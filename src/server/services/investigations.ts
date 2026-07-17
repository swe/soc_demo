import { and, desc, eq, inArray, lt, or, type SQL } from 'drizzle-orm'

import { decodeCursor, encodeCursor, type Page } from '../../domain/entities/common'
import type {
  CreateInvestigation,
  InvestigationDetailDto,
  InvestigationDto,
  InvestigationListQuery,
  InvestigationPatch,
} from '../../domain/entities/investigation'
import {
  ALERT_TRANSITIONS,
  INVESTIGATION_TRANSITIONS,
  TransitionError,
  assertTransition,
  canTransition,
  isTerminal,
} from '../../domain/transitions'
import { requirePermission, type OrgContext } from '../auth/types'
import { orgScoped } from '../db/scoped'
import { alerts, investigations, memberships } from '../db/schema'
import { writeAudit } from './audit'
import { ServiceError } from './errors'

type InvestigationRow = typeof investigations.$inferSelect

function toDto(row: InvestigationRow): InvestigationDto {
  return {
    id: row.id,
    title: row.title,
    status: row.status,
    hypothesis: row.hypothesis,
    assigneeMembershipId: row.assigneeMembershipId,
    disposition: row.disposition,
    createdFromAlertId: row.createdFromAlertId,
    createdBy: row.createdBy,
    closedAt: row.closedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  }
}

function alertToDto(row: typeof alerts.$inferSelect) {
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

async function requireOrgMembership(ctx: OrgContext, membershipId: string) {
  const scoped = orgScoped(ctx)
  const [member] = await scoped.db
    .select({ id: memberships.id })
    .from(memberships)
    .where(
      scoped.where(
        memberships.organizationId,
        eq(memberships.id, membershipId),
        eq(memberships.status, 'active'),
      ),
    )
    .limit(1)
  if (!member) throw new ServiceError('Assignee is not an active member of this organization')
}

export async function listInvestigations(
  ctx: OrgContext,
  query: InvestigationListQuery,
): Promise<Page<InvestigationDto>> {
  const scoped = orgScoped(ctx)

  const conditions: (SQL | undefined)[] = [
    query.status ? eq(investigations.status, query.status) : undefined,
  ]

  const cursor = query.cursor ? decodeCursor(query.cursor) : null
  if (cursor) {
    const t = new Date(cursor.t)
    conditions.push(
      or(
        lt(investigations.createdAt, t),
        and(eq(investigations.createdAt, t), lt(investigations.id, cursor.id)),
      ),
    )
  }

  const rows = await scoped.db
    .select()
    .from(investigations)
    .where(scoped.where(investigations.organizationId, ...conditions))
    .orderBy(desc(investigations.createdAt), desc(investigations.id))
    .limit(query.limit + 1)

  const hasMore = rows.length > query.limit
  const items = rows.slice(0, query.limit)
  const last = items[items.length - 1]

  return {
    items: items.map(toDto),
    nextCursor:
      hasMore && last ? encodeCursor({ t: last.createdAt.toISOString(), id: last.id }) : null,
  }
}

export async function getInvestigationById(
  ctx: OrgContext,
  id: string,
): Promise<InvestigationDetailDto | null> {
  const scoped = orgScoped(ctx)
  const [row] = await scoped.db
    .select()
    .from(investigations)
    .where(scoped.where(investigations.organizationId, eq(investigations.id, id)))
    .limit(1)
  if (!row) return null

  const linked = await scoped.db
    .select()
    .from(alerts)
    .where(scoped.where(alerts.organizationId, eq(alerts.investigationId, id)))
    .orderBy(desc(alerts.detectedAt))

  return { ...toDto(row), notes: row.notes, alerts: linked.map(alertToDto) }
}

/**
 * Create an investigation, optionally linking existing alerts. Alert-initiated
 * creation (create-from-alert endpoint) sets `createdFromAlertId` and triages
 * the source alert if it is still new.
 */
export async function createInvestigation(
  ctx: OrgContext,
  input: CreateInvestigation & { createdFromAlertId?: string },
): Promise<InvestigationDetailDto> {
  requirePermission(ctx, 'investigation:write')
  const scoped = orgScoped(ctx)

  const alertIds = [...new Set([...(input.alertIds ?? []), input.createdFromAlertId].filter(
    (v): v is string => Boolean(v),
  ))]

  // Every referenced alert must exist inside this tenant.
  let linkedAlerts: (typeof alerts.$inferSelect)[] = []
  if (alertIds.length > 0) {
    linkedAlerts = await scoped.db
      .select()
      .from(alerts)
      .where(scoped.where(alerts.organizationId, inArray(alerts.id, alertIds)))
    if (linkedAlerts.length !== alertIds.length) {
      throw new ServiceError('One or more alerts were not found in this organization', 404)
    }
    const alreadyLinked = linkedAlerts.find((a) => a.investigationId)
    if (alreadyLinked) {
      throw new ServiceError(`Alert ${alreadyLinked.id} already belongs to an investigation`, 409)
    }
  }

  const [row] = await scoped.db
    .insert(investigations)
    .values({
      organizationId: ctx.organizationId,
      title: input.title,
      hypothesis: input.hypothesis ?? null,
      createdFromAlertId: input.createdFromAlertId ?? null,
      createdBy: ctx.userId,
    })
    .returning()

  if (alertIds.length > 0) {
    await scoped.db
      .update(alerts)
      .set({ investigationId: row.id })
      .where(scoped.where(alerts.organizationId, inArray(alerts.id, alertIds)))

    // Linking to an investigation is triage: move still-new alerts along.
    const stillNew = linkedAlerts.filter(
      (a) => a.status === 'new' && canTransition(ALERT_TRANSITIONS, a.status, 'triaged'),
    )
    if (stillNew.length > 0) {
      await scoped.db
        .update(alerts)
        .set({ status: 'triaged', triagedAt: new Date() })
        .where(
          scoped.where(
            alerts.organizationId,
            inArray(alerts.id, stillNew.map((a) => a.id)),
          ),
        )
    }
  }

  await writeAudit(ctx, {
    action: 'investigation.create',
    targetType: 'investigation',
    targetId: row.id,
    metadata: {
      title: row.title,
      alertIds,
      ...(input.createdFromAlertId ? { createdFromAlertId: input.createdFromAlertId } : {}),
    },
  })
  for (const alertId of alertIds) {
    await writeAudit(ctx, {
      action: 'alert.link_investigation',
      targetType: 'alert',
      targetId: alertId,
      metadata: { investigationId: row.id },
    })
  }

  const detail = await getInvestigationById(ctx, row.id)
  return detail!
}

export async function patchInvestigation(
  ctx: OrgContext,
  id: string,
  patch: InvestigationPatch,
): Promise<InvestigationDto | null> {
  requirePermission(ctx, 'investigation:write')
  const scoped = orgScoped(ctx)

  const [row] = await scoped.db
    .select()
    .from(investigations)
    .where(scoped.where(investigations.organizationId, eq(investigations.id, id)))
    .limit(1)
  if (!row) return null

  if (isTerminal(INVESTIGATION_TRANSITIONS, row.status)) {
    throw TransitionError.immutable('investigation', row.status)
  }

  if (patch.assigneeMembershipId) await requireOrgMembership(ctx, patch.assigneeMembershipId)

  const update: Partial<typeof investigations.$inferInsert> = {}
  const auditEntries: { action: string; metadata: Record<string, unknown> }[] = []

  if (patch.status !== undefined) {
    assertTransition('investigation', INVESTIGATION_TRANSITIONS, row.status, patch.status)
    update.status = patch.status
    if (patch.status === 'closed') {
      update.closedAt = new Date()
      update.disposition = patch.disposition
      auditEntries.push({
        action: 'investigation.close',
        metadata: { from: row.status, disposition: patch.disposition },
      })
    } else {
      auditEntries.push({
        action: 'investigation.status_change',
        metadata: { from: row.status, to: patch.status },
      })
    }
  } else if (patch.disposition !== undefined) {
    update.disposition = patch.disposition
    auditEntries.push({
      action: 'investigation.disposition',
      metadata: { from: row.disposition, to: patch.disposition },
    })
  }

  if (patch.hypothesis !== undefined) {
    update.hypothesis = patch.hypothesis
    auditEntries.push({ action: 'investigation.hypothesis', metadata: {} })
  }

  if (patch.assigneeMembershipId !== undefined) {
    update.assigneeMembershipId = patch.assigneeMembershipId
    auditEntries.push({
      action: 'investigation.assign',
      metadata: { from: row.assigneeMembershipId, to: patch.assigneeMembershipId },
    })
  }

  if (patch.note !== undefined) {
    update.notes = [
      ...row.notes,
      { at: new Date().toISOString(), membershipId: ctx.membershipId, text: patch.note },
    ]
    auditEntries.push({ action: 'investigation.note', metadata: { length: patch.note.length } })
  }

  if (Object.keys(update).length === 0) return toDto(row)

  const [updated] = await scoped.db
    .update(investigations)
    .set(update)
    .where(scoped.where(investigations.organizationId, eq(investigations.id, id)))
    .returning()

  for (const entry of auditEntries) {
    await writeAudit(ctx, {
      action: entry.action,
      targetType: 'investigation',
      targetId: id,
      metadata: entry.metadata,
    })
  }

  return toDto(updated)
}
