import { and, desc, eq, ilike, lt, or, sql, type SQL } from 'drizzle-orm'

import type { AssetDetailDto, AssetDto, AssetListQuery } from '../../domain/entities/asset'
import { decodeCursor, encodeCursor, type Page } from '../../domain/entities/common'
import type { OrgContext } from '../auth/types'
import { orgScoped } from '../db/scoped'
import { alerts, assets, identities, vulnerabilities } from '../db/schema'

type AssetRow = typeof assets.$inferSelect

function toDto(row: AssetRow, ownerName: string | null): AssetDto {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    criticality: row.criticality,
    status: row.status,
    riskScore: row.riskScore,
    ownerIdentityId: row.ownerIdentityId,
    ownerName,
    firstSeen: row.firstSeen.toISOString(),
    lastSeen: row.lastSeen.toISOString(),
  }
}

export function alertRowToDto(row: typeof alerts.$inferSelect) {
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

/** Alerts whose entity_refs reference the given graph entity. */
export async function alertsReferencingEntity(
  ctx: OrgContext,
  entity: { type: 'asset' | 'identity'; id: string },
  limit = 20,
) {
  const scoped = orgScoped(ctx)
  const rows = await scoped.db
    .select()
    .from(alerts)
    .where(
      scoped.where(
        alerts.organizationId,
        sql`${alerts.entityRefs} @> ${JSON.stringify([{ type: entity.type, id: entity.id }])}::jsonb`,
      ),
    )
    .orderBy(desc(alerts.detectedAt))
    .limit(limit)
  return rows.map(alertRowToDto)
}

export async function listAssets(ctx: OrgContext, query: AssetListQuery): Promise<Page<AssetDto>> {
  const scoped = orgScoped(ctx)

  const conditions: (SQL | undefined)[] = [
    query.type ? eq(assets.type, query.type) : undefined,
    query.criticality ? eq(assets.criticality, query.criticality) : undefined,
    query.q ? ilike(assets.name, `%${query.q}%`) : undefined,
  ]

  const cursor = query.cursor ? decodeCursor(query.cursor) : null
  if (cursor) {
    // Keyset on (riskScore desc, id desc); cursor.t carries the risk score
    const score = Number(cursor.t)
    conditions.push(
      or(lt(assets.riskScore, score), and(eq(assets.riskScore, score), lt(assets.id, cursor.id))),
    )
  }

  const rows = await scoped.db
    .select({ asset: assets, ownerName: identities.displayName })
    .from(assets)
    .leftJoin(identities, eq(identities.id, assets.ownerIdentityId))
    .where(scoped.where(assets.organizationId, ...conditions))
    .orderBy(desc(assets.riskScore), desc(assets.id))
    .limit(query.limit + 1)

  const hasMore = rows.length > query.limit
  const items = rows.slice(0, query.limit)
  const last = items[items.length - 1]

  return {
    items: items.map((r) => toDto(r.asset, r.ownerName)),
    nextCursor:
      hasMore && last
        ? encodeCursor({ t: String(last.asset.riskScore), id: last.asset.id })
        : null,
  }
}

export async function getAssetById(ctx: OrgContext, id: string): Promise<AssetDetailDto | null> {
  const scoped = orgScoped(ctx)
  const [row] = await scoped.db
    .select({ asset: assets, ownerName: identities.displayName })
    .from(assets)
    .leftJoin(identities, eq(identities.id, assets.ownerIdentityId))
    .where(scoped.where(assets.organizationId, eq(assets.id, id)))
    .limit(1)
  if (!row) return null

  const [relatedAlerts, vulnRows] = await Promise.all([
    alertsReferencingEntity(ctx, { type: 'asset', id }),
    scoped.db
      .select({
        id: vulnerabilities.id,
        cveId: vulnerabilities.cveId,
        title: vulnerabilities.title,
        severity: vulnerabilities.severity,
        status: vulnerabilities.status,
        exploitedInWild: vulnerabilities.exploitedInWild,
      })
      .from(vulnerabilities)
      .where(scoped.where(vulnerabilities.organizationId, eq(vulnerabilities.assetId, id)))
      .orderBy(desc(vulnerabilities.detectedAt)),
  ])

  return {
    ...toDto(row.asset, row.ownerName),
    attributes: row.asset.attributes as Record<string, unknown>,
    externalIds: row.asset.externalIds as Record<string, unknown>,
    relatedAlerts,
    vulnerabilities: vulnRows,
  }
}
