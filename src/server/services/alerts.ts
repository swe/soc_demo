import { and, desc, eq, gte, ilike, lt, lte, or, type SQL } from 'drizzle-orm'

import type {
  AlertDetailDto,
  AlertDto,
  AlertListQuery,
  AlertPatch,
} from '../../domain/entities/alert'
import { decodeCursor, encodeCursor, type Page } from '../../domain/entities/common'
import { ALERT_TRANSITIONS, TransitionError, assertTransition } from '../../domain/transitions'
import { requirePermission, type OrgContext } from '../auth/types'
import { orgScoped } from '../db/scoped'
import { alerts, auditLogs, memberships } from '../db/schema'
import { writeAudit } from './audit'
import { ServiceError } from './errors'

function toDto(row: typeof alerts.$inferSelect): AlertDto {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    severity: row.severity,
    status: row.status,
    disposition: row.disposition,
    source: row.source,
    ruleKey: row.ruleKey,
    mitreTechniques: row.mitreTechniques,
    entityRefs: row.entityRefs,
    investigationId: row.investigationId,
    assignedMembershipId: row.assignedMembershipId,
    analystNote: row.analystNote,
    triagedAt: row.triagedAt?.toISOString() ?? null,
    resolvedAt: row.resolvedAt?.toISOString() ?? null,
    dismissedReason: row.dismissedReason,
    detectedAt: row.detectedAt.toISOString(),
  }
}

export async function listAlerts(ctx: OrgContext, query: AlertListQuery): Promise<Page<AlertDto>> {
  const scoped = orgScoped(ctx)

  const conditions: (SQL | undefined)[] = [
    query.status ? eq(alerts.status, query.status) : undefined,
    query.severity ? eq(alerts.severity, query.severity) : undefined,
    query.q
      ? or(ilike(alerts.title, `%${query.q}%`), ilike(alerts.description, `%${query.q}%`))
      : undefined,
    query.from ? gte(alerts.detectedAt, new Date(query.from)) : undefined,
    query.to ? lte(alerts.detectedAt, new Date(query.to)) : undefined,
  ]

  const cursor = query.cursor ? decodeCursor(query.cursor) : null
  if (cursor) {
    // Keyset pagination on (detectedAt, id) descending
    const t = new Date(cursor.t)
    conditions.push(
      or(lt(alerts.detectedAt, t), and(eq(alerts.detectedAt, t), lt(alerts.id, cursor.id))),
    )
  }

  const rows = await scoped.db
    .select()
    .from(alerts)
    .where(scoped.where(alerts.organizationId, ...conditions))
    .orderBy(desc(alerts.detectedAt), desc(alerts.id))
    .limit(query.limit + 1)

  const hasMore = rows.length > query.limit
  const items = rows.slice(0, query.limit)
  const last = items[items.length - 1]

  return {
    items: items.map(toDto),
    nextCursor: hasMore && last ? encodeCursor({ t: last.detectedAt.toISOString(), id: last.id }) : null,
  }
}

export async function getAlertById(ctx: OrgContext, id: string): Promise<AlertDto | null> {
  const scoped = orgScoped(ctx)
  const [row] = await scoped.db
    .select()
    .from(alerts)
    .where(scoped.where(alerts.organizationId, eq(alerts.id, id)))
    .limit(1)
  return row ? toDto(row) : null
}

const HISTORY_LIMIT = 20

/** Detail view for the alert modal: the alert plus its recent audit history. */
export async function getAlertDetail(ctx: OrgContext, id: string): Promise<AlertDetailDto | null> {
  const alert = await getAlertById(ctx, id)
  if (!alert) return null

  const scoped = orgScoped(ctx)
  const history = await scoped.db
    .select({
      id: auditLogs.id,
      action: auditLogs.action,
      targetType: auditLogs.targetType,
      targetId: auditLogs.targetId,
      actorMembershipId: auditLogs.actorMembershipId,
      metadata: auditLogs.metadata,
      createdAt: auditLogs.createdAt,
    })
    .from(auditLogs)
    .where(
      scoped.where(
        auditLogs.organizationId,
        eq(auditLogs.targetType, 'alert'),
        eq(auditLogs.targetId, id),
      ),
    )
    .orderBy(desc(auditLogs.createdAt), desc(auditLogs.id))
    .limit(HISTORY_LIMIT)

  return {
    ...alert,
    history: history.map((row) => ({
      ...row,
      metadata: row.metadata as Record<string, unknown>,
      createdAt: row.createdAt.toISOString(),
    })),
  }
}

/** Semantic audit action for a status transition. */
function statusAuditAction(to: AlertPatch['status']): string {
  switch (to) {
    case 'triaged':
      return 'alert.triage'
    case 'resolved':
      return 'alert.resolve'
    case 'dismissed':
      return 'alert.dismiss'
    default:
      return 'alert.status_change'
  }
}

/**
 * Triage mutations on a single alert. Lifecycle rules come exclusively from
 * domain/transitions (ADR-0003); terminal alerts accept a disposition only.
 */
export async function patchAlert(
  ctx: OrgContext,
  id: string,
  patch: AlertPatch,
): Promise<AlertDto | null> {
  requirePermission(ctx, 'alert:triage')
  const scoped = orgScoped(ctx)

  const [row] = await scoped.db
    .select()
    .from(alerts)
    .where(scoped.where(alerts.organizationId, eq(alerts.id, id)))
    .limit(1)
  if (!row) return null

  const isTerminalNow = ALERT_TRANSITIONS[row.status].length === 0
  const touchesMoreThanDisposition =
    patch.status !== undefined ||
    patch.severity !== undefined ||
    patch.assignedMembershipId !== undefined ||
    patch.analystNote !== undefined
  if (isTerminalNow && touchesMoreThanDisposition) {
    throw TransitionError.immutable('alert', row.status)
  }

  // Assignee must be an active membership of this organization.
  if (patch.assignedMembershipId) {
    const [member] = await scoped.db
      .select({ id: memberships.id })
      .from(memberships)
      .where(
        scoped.where(
          memberships.organizationId,
          eq(memberships.id, patch.assignedMembershipId),
          eq(memberships.status, 'active'),
        ),
      )
      .limit(1)
    if (!member) throw new ServiceError('Assignee is not an active member of this organization')
  }

  const now = new Date()
  const update: Partial<typeof alerts.$inferInsert> = {}
  const auditEntries: { action: string; metadata: Record<string, unknown> }[] = []

  if (patch.status !== undefined) {
    assertTransition('alert', ALERT_TRANSITIONS, row.status, patch.status)
    update.status = patch.status
    if (patch.status === 'triaged') update.triagedAt = now
    if (patch.status === 'resolved') update.resolvedAt = now
    if (patch.status === 'dismissed') update.dismissedReason = patch.dismissedReason
    auditEntries.push({
      action: statusAuditAction(patch.status),
      metadata: {
        from: row.status,
        to: patch.status,
        ...(patch.dismissedReason ? { reason: patch.dismissedReason } : {}),
      },
    })
  }

  if (patch.severity !== undefined && patch.severity !== row.severity) {
    update.severity = patch.severity
    auditEntries.push({
      action: 'alert.severity_change',
      metadata: { from: row.severity, to: patch.severity },
    })
  }

  if (patch.assignedMembershipId !== undefined) {
    update.assignedMembershipId = patch.assignedMembershipId
    auditEntries.push({
      action: 'alert.assign',
      metadata: { from: row.assignedMembershipId, to: patch.assignedMembershipId },
    })
  }

  if (patch.analystNote !== undefined) {
    update.analystNote = patch.analystNote
    auditEntries.push({ action: 'alert.note', metadata: { length: patch.analystNote?.length ?? 0 } })
  }

  if (patch.disposition !== undefined) {
    update.disposition = patch.disposition
    auditEntries.push({
      action: 'alert.disposition',
      metadata: { from: row.disposition, to: patch.disposition },
    })
  }

  if (Object.keys(update).length === 0) return toDto(row)

  const [updated] = await scoped.db
    .update(alerts)
    .set(update)
    .where(scoped.where(alerts.organizationId, eq(alerts.id, id)))
    .returning()

  for (const entry of auditEntries) {
    await writeAudit(ctx, {
      action: entry.action,
      targetType: 'alert',
      targetId: id,
      metadata: entry.metadata,
    })
  }

  return toDto(updated)
}
