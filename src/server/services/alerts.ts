import { and, desc, eq, gte, ilike, lt, lte, or, type SQL } from 'drizzle-orm'

import type { AlertDto, AlertListQuery } from '../../domain/entities/alert'
import { decodeCursor, encodeCursor, type Page } from '../../domain/entities/common'
import type { OrgContext } from '../auth/types'
import { orgScoped } from '../db/scoped'
import { alerts } from '../db/schema'

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
