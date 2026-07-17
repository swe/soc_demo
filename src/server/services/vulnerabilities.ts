import { and, desc, eq, ilike, lt, or, type SQL } from 'drizzle-orm'

import { decodeCursor, encodeCursor, type Page } from '../../domain/entities/common'
import type {
  VulnerabilityDto,
  VulnerabilityListQuery,
} from '../../domain/entities/vulnerability'
import type { OrgContext } from '../auth/types'
import { orgScoped } from '../db/scoped'
import { assets, vulnerabilities } from '../db/schema'

function toDto(row: typeof vulnerabilities.$inferSelect, assetName: string | null): VulnerabilityDto {
  return {
    id: row.id,
    cveId: row.cveId,
    ruleKey: row.ruleKey,
    title: row.title,
    severity: row.severity,
    status: row.status,
    cvss: row.cvss,
    epss: row.epss,
    exploitedInWild: row.exploitedInWild,
    fixAvailable: row.fixAvailable,
    assetId: row.assetId,
    assetName,
    detectedAt: row.detectedAt.toISOString(),
    resolvedAt: row.resolvedAt?.toISOString() ?? null,
  }
}

export async function listVulnerabilities(
  ctx: OrgContext,
  query: VulnerabilityListQuery,
): Promise<Page<VulnerabilityDto>> {
  const scoped = orgScoped(ctx)

  const conditions: (SQL | undefined)[] = [
    query.status ? eq(vulnerabilities.status, query.status) : undefined,
    query.severity ? eq(vulnerabilities.severity, query.severity) : undefined,
    query.exploited !== undefined ? eq(vulnerabilities.exploitedInWild, query.exploited) : undefined,
    query.q
      ? or(ilike(vulnerabilities.title, `%${query.q}%`), ilike(vulnerabilities.cveId, `%${query.q}%`))
      : undefined,
  ]

  const cursor = query.cursor ? decodeCursor(query.cursor) : null
  if (cursor) {
    const t = new Date(cursor.t)
    conditions.push(
      or(
        lt(vulnerabilities.detectedAt, t),
        and(eq(vulnerabilities.detectedAt, t), lt(vulnerabilities.id, cursor.id)),
      ),
    )
  }

  const rows = await scoped.db
    .select({ vulnerability: vulnerabilities, assetName: assets.name })
    .from(vulnerabilities)
    .leftJoin(assets, eq(assets.id, vulnerabilities.assetId))
    .where(scoped.where(vulnerabilities.organizationId, ...conditions))
    .orderBy(desc(vulnerabilities.detectedAt), desc(vulnerabilities.id))
    .limit(query.limit + 1)

  const hasMore = rows.length > query.limit
  const items = rows.slice(0, query.limit)
  const last = items[items.length - 1]

  return {
    items: items.map((r) => toDto(r.vulnerability, r.assetName)),
    nextCursor:
      hasMore && last
        ? encodeCursor({ t: last.vulnerability.detectedAt.toISOString(), id: last.vulnerability.id })
        : null,
  }
}

export async function getVulnerabilityById(
  ctx: OrgContext,
  id: string,
): Promise<VulnerabilityDto | null> {
  const scoped = orgScoped(ctx)
  const [row] = await scoped.db
    .select({ vulnerability: vulnerabilities, assetName: assets.name })
    .from(vulnerabilities)
    .leftJoin(assets, eq(assets.id, vulnerabilities.assetId))
    .where(scoped.where(vulnerabilities.organizationId, eq(vulnerabilities.id, id)))
    .limit(1)
  return row ? toDto(row.vulnerability, row.assetName) : null
}
