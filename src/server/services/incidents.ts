import { desc, eq, type SQL } from 'drizzle-orm'

import { decodeCursor, encodeCursor, type Page } from '../../domain/entities/common'
import type { IncidentDetailDto, IncidentDto, IncidentListQuery } from '../../domain/entities/incident'
import type { OrgContext } from '../auth/context'
import { orgScoped } from '../db/scoped'
import { incidents } from '../db/schema'
import { lt } from 'drizzle-orm'

function toDto(row: typeof incidents.$inferSelect): IncidentDto {
  return {
    id: row.id,
    number: row.number,
    title: row.title,
    severity: row.severity,
    status: row.status,
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
