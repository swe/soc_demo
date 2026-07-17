import { desc, eq, lt, sql, type SQL } from 'drizzle-orm'

import { decodeCursor, encodeCursor, type Page } from '../../domain/entities/common'
import type {
  IncidentDetailDto,
  IncidentDto,
  IncidentListQuery,
  IncidentPatch,
} from '../../domain/entities/incident'
import type { Severity } from '../../domain/enums'
import {
  INCIDENT_TRANSITIONS,
  TransitionError,
  assertTransition,
  isTerminal,
} from '../../domain/transitions'
import { requirePermission, type OrgContext } from '../auth/types'
import { orgScoped } from '../db/scoped'
import {
  alerts,
  incidents,
  investigations,
  memberships,
  organizations,
  users,
  type IncidentTimelineEntry,
} from '../db/schema'
import { writeAudit } from './audit'
import { ServiceError } from './errors'

function toDto(row: typeof incidents.$inferSelect): IncidentDto {
  return {
    id: row.id,
    number: row.number,
    title: row.title,
    severity: row.severity,
    status: row.status,
    ownerMembershipId: row.ownerMembershipId,
    investigationId: row.investigationId,
    impactSummary: row.impactSummary,
    declaredAt: row.declaredAt.toISOString(),
    resolvedAt: row.resolvedAt?.toISOString() ?? null,
  }
}

export async function listIncidents(
  ctx: OrgContext,
  query: IncidentListQuery,
): Promise<Page<IncidentDto>> {
  const scoped = orgScoped(ctx)

  const conditions: (SQL | undefined)[] = [
    query.status ? eq(incidents.status, query.status) : undefined,
    query.severity ? eq(incidents.severity, query.severity) : undefined,
  ]

  // Cursor carries the incident number (unique per org, ordered)
  const cursor = query.cursor ? decodeCursor(query.cursor) : null
  if (cursor) {
    conditions.push(lt(incidents.number, Number(cursor.t)))
  }

  const rows = await scoped.db
    .select()
    .from(incidents)
    .where(scoped.where(incidents.organizationId, ...conditions))
    .orderBy(desc(incidents.number))
    .limit(query.limit + 1)

  const hasMore = rows.length > query.limit
  const items = rows.slice(0, query.limit)
  const last = items[items.length - 1]

  return {
    items: items.map(toDto),
    nextCursor: hasMore && last ? encodeCursor({ t: String(last.number), id: last.id }) : null,
  }
}

export async function getIncidentById(
  ctx: OrgContext,
  id: string,
): Promise<IncidentDetailDto | null> {
  const scoped = orgScoped(ctx)
  const [row] = await scoped.db
    .select()
    .from(incidents)
    .where(scoped.where(incidents.organizationId, eq(incidents.id, id)))
    .limit(1)
  if (!row) return null
  return {
    ...toDto(row),
    timeline: [...row.timeline].sort((a, b) => a.at.localeCompare(b.at)),
  }
}

/** Display name of the acting user for human-readable timeline entries. */
async function actorName(ctx: OrgContext): Promise<string> {
  const [row] = await orgScoped(ctx)
    .db.select({ name: users.name, email: users.email })
    .from(users)
    .where(eq(users.id, ctx.userId))
    .limit(1)
  return row?.name ?? row?.email ?? 'Unknown analyst'
}

const SEVERITY_RANK: Record<Severity, number> = { critical: 0, high: 1, medium: 2, low: 3 }

/**
 * Promote an investigation to an incident (ADR-0003: the investigation keeps
 * its status; promotion never auto-closes). The per-org incident number is
 * allocated inside a transaction holding a row lock on the organization, so
 * concurrent promotions cannot collide.
 */
export async function promoteFromInvestigation(
  ctx: OrgContext,
  investigationId: string,
): Promise<IncidentDetailDto | null> {
  requirePermission(ctx, 'incident:write')
  const scoped = orgScoped(ctx)

  const [investigation] = await scoped.db
    .select()
    .from(investigations)
    .where(scoped.where(investigations.organizationId, eq(investigations.id, investigationId)))
    .limit(1)
  if (!investigation) return null

  const [existing] = await scoped.db
    .select({ id: incidents.id, number: incidents.number })
    .from(incidents)
    .where(scoped.where(incidents.organizationId, eq(incidents.investigationId, investigationId)))
    .limit(1)
  if (existing) {
    throw new ServiceError(
      `Investigation was already promoted to incident INC-${existing.number}`,
      409,
    )
  }

  const linkedAlerts = await scoped.db
    .select({ severity: alerts.severity })
    .from(alerts)
    .where(scoped.where(alerts.organizationId, eq(alerts.investigationId, investigationId)))

  // Incident severity = highest severity across linked alerts.
  const severity =
    linkedAlerts.map((a) => a.severity).sort((a, b) => SEVERITY_RANK[a] - SEVERITY_RANK[b])[0] ??
    'medium'

  const actor = await actorName(ctx)
  const now = new Date()

  const created = await scoped.db.transaction(async (tx) => {
    // Row lock serializes number allocation per organization.
    const [org] = await tx
      .select({ id: organizations.id, counter: organizations.incidentCounter })
      .from(organizations)
      .where(eq(organizations.id, ctx.organizationId))
      .for('update')
    if (!org) throw new ServiceError('Organization not found', 404)

    const number = org.counter + 1
    await tx
      .update(organizations)
      .set({ incidentCounter: number })
      .where(eq(organizations.id, ctx.organizationId))

    const timeline: IncidentTimelineEntry[] = [
      {
        at: now.toISOString(),
        kind: 'declared',
        summary: `Incident declared from investigation "${investigation.title}".`,
        actor,
      },
    ]

    const [incident] = await tx
      .insert(incidents)
      .values({
        organizationId: ctx.organizationId,
        number,
        title: investigation.title,
        severity,
        investigationId,
        timeline,
        declaredAt: now,
      })
      .returning()
    return incident
  })

  await writeAudit(ctx, {
    action: 'incident.declare',
    targetType: 'incident',
    targetId: created.id,
    metadata: { number: created.number, investigationId, severity, linkedAlerts: linkedAlerts.length },
  })
  await writeAudit(ctx, {
    action: 'investigation.promote',
    targetType: 'investigation',
    targetId: investigationId,
    metadata: { incidentId: created.id, incidentNumber: created.number },
  })

  return getIncidentById(ctx, created.id)
}

export async function patchIncident(
  ctx: OrgContext,
  id: string,
  patch: IncidentPatch,
): Promise<IncidentDetailDto | null> {
  requirePermission(ctx, 'incident:write')
  const scoped = orgScoped(ctx)

  const [row] = await scoped.db
    .select()
    .from(incidents)
    .where(scoped.where(incidents.organizationId, eq(incidents.id, id)))
    .limit(1)
  if (!row) return null

  if (isTerminal(INCIDENT_TRANSITIONS, row.status)) {
    throw TransitionError.immutable('incident', row.status)
  }

  if (patch.ownerMembershipId) {
    const [member] = await scoped.db
      .select({ id: memberships.id })
      .from(memberships)
      .where(
        scoped.where(
          memberships.organizationId,
          eq(memberships.id, patch.ownerMembershipId),
          eq(memberships.status, 'active'),
        ),
      )
      .limit(1)
    if (!member) throw new ServiceError('Owner is not an active member of this organization')
  }

  const actor = await actorName(ctx)
  const now = new Date()
  const update: Partial<typeof incidents.$inferInsert> = {}
  const timelineAdditions: IncidentTimelineEntry[] = []
  const auditEntries: { action: string; metadata: Record<string, unknown> }[] = []

  if (patch.status !== undefined) {
    assertTransition('incident', INCIDENT_TRANSITIONS, row.status, patch.status)
    update.status = patch.status
    if (patch.status === 'resolved') update.resolvedAt = now
    timelineAdditions.push({
      at: now.toISOString(),
      kind: 'status_change',
      summary: `Status changed: ${row.status} → ${patch.status}.`,
      actor,
    })
    auditEntries.push({
      action: 'incident.status_change',
      metadata: { from: row.status, to: patch.status },
    })
  }

  if (patch.ownerMembershipId !== undefined) {
    update.ownerMembershipId = patch.ownerMembershipId
    timelineAdditions.push({
      at: now.toISOString(),
      kind: 'action',
      summary: patch.ownerMembershipId ? 'Incident owner assigned.' : 'Incident owner cleared.',
      actor,
    })
    auditEntries.push({
      action: 'incident.assign',
      metadata: { from: row.ownerMembershipId, to: patch.ownerMembershipId },
    })
  }

  if (patch.impactSummary !== undefined) {
    update.impactSummary = patch.impactSummary
    auditEntries.push({ action: 'incident.impact_summary', metadata: {} })
  }

  if (patch.note !== undefined) {
    timelineAdditions.push({ at: now.toISOString(), kind: 'note', summary: patch.note, actor })
    auditEntries.push({ action: 'incident.note', metadata: { length: patch.note.length } })
  }

  if (Object.keys(update).length === 0 && timelineAdditions.length === 0) {
    return getIncidentById(ctx, id)
  }

  if (timelineAdditions.length > 0) {
    update.timeline = sql`${incidents.timeline} || ${JSON.stringify(timelineAdditions)}::jsonb` as unknown as IncidentTimelineEntry[]
  }

  await scoped.db
    .update(incidents)
    .set(update)
    .where(scoped.where(incidents.organizationId, eq(incidents.id, id)))

  for (const entry of auditEntries) {
    await writeAudit(ctx, {
      action: entry.action,
      targetType: 'incident',
      targetId: id,
      metadata: entry.metadata,
    })
  }

  return getIncidentById(ctx, id)
}
