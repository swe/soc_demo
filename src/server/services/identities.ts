import { and, desc, eq, ilike, lt, or, type SQL } from 'drizzle-orm'

import { decodeCursor, encodeCursor, type Page } from '../../domain/entities/common'
import type {
  IdentityDetailDto,
  IdentityDto,
  IdentityListQuery,
} from '../../domain/entities/identity'
import type { OrgContext } from '../auth/types'
import { orgScoped } from '../db/scoped'
import { assets, identities } from '../db/schema'
import { alertsReferencingEntity } from './assets'

type IdentityRow = typeof identities.$inferSelect

function toDto(row: IdentityRow): IdentityDto {
  return {
    id: row.id,
    principal: row.principal,
    displayName: row.displayName,
    type: row.type,
    privilegeTier: row.privilegeTier,
    mfaEnabled: row.mfaEnabled,
    riskScore: row.riskScore,
    status: row.status,
    firstSeen: row.firstSeen.toISOString(),
    lastSeen: row.lastSeen.toISOString(),
  }
}

export async function listIdentities(
  ctx: OrgContext,
  query: IdentityListQuery,
): Promise<Page<IdentityDto>> {
  const scoped = orgScoped(ctx)

  const conditions: (SQL | undefined)[] = [
    query.type ? eq(identities.type, query.type) : undefined,
    query.privilegeTier ? eq(identities.privilegeTier, query.privilegeTier) : undefined,
    query.q
      ? or(ilike(identities.displayName, `%${query.q}%`), ilike(identities.principal, `%${query.q}%`))
      : undefined,
  ]

  const cursor = query.cursor ? decodeCursor(query.cursor) : null
  if (cursor) {
    const score = Number(cursor.t)
    conditions.push(
      or(
        lt(identities.riskScore, score),
        and(eq(identities.riskScore, score), lt(identities.id, cursor.id)),
      ),
    )
  }

  const rows = await scoped.db
    .select()
    .from(identities)
    .where(scoped.where(identities.organizationId, ...conditions))
    .orderBy(desc(identities.riskScore), desc(identities.id))
    .limit(query.limit + 1)

  const hasMore = rows.length > query.limit
  const items = rows.slice(0, query.limit)
  const last = items[items.length - 1]

  return {
    items: items.map(toDto),
    nextCursor:
      hasMore && last ? encodeCursor({ t: String(last.riskScore), id: last.id }) : null,
  }
}

export async function getIdentityById(
  ctx: OrgContext,
  id: string,
): Promise<IdentityDetailDto | null> {
  const scoped = orgScoped(ctx)
  const [row] = await scoped.db
    .select()
    .from(identities)
    .where(scoped.where(identities.organizationId, eq(identities.id, id)))
    .limit(1)
  if (!row) return null

  const [ownedAssets, relatedAlerts] = await Promise.all([
    scoped.db
      .select()
      .from(assets)
      .where(scoped.where(assets.organizationId, eq(assets.ownerIdentityId, id)))
      .orderBy(desc(assets.riskScore)),
    alertsReferencingEntity(ctx, { type: 'identity', id }),
  ])

  return {
    ...toDto(row),
    attributes: row.attributes as Record<string, unknown>,
    ownedAssets: ownedAssets.map((a) => ({
      id: a.id,
      name: a.name,
      type: a.type,
      criticality: a.criticality,
      status: a.status,
      riskScore: a.riskScore,
      ownerIdentityId: a.ownerIdentityId,
      ownerName: row.displayName,
      firstSeen: a.firstSeen.toISOString(),
      lastSeen: a.lastSeen.toISOString(),
    })),
    relatedAlerts,
  }
}
