import { and, desc, eq, lt, or, type SQL } from 'drizzle-orm'

import type { AuditListItemDto, AuditListQuery } from '../../domain/entities/audit'
import { decodeCursor, encodeCursor, type Page } from '../../domain/entities/common'
import { requirePermission, type OrgContext } from '../auth/types'
import { db } from '../db/client'
import { orgScoped } from '../db/scoped'
import { auditLogs, memberships, users } from '../db/schema'

type AuditInput = {
  action: string
  targetType: string
  targetId?: string | null
  metadata?: Record<string, unknown>
}

/** Append an audit record for an action performed inside an org context. */
export async function writeAudit(ctx: OrgContext, input: AuditInput): Promise<void> {
  await db.insert(auditLogs).values({
    organizationId: ctx.organizationId,
    actorMembershipId: ctx.membershipId,
    actorType: 'user',
    action: input.action,
    targetType: input.targetType,
    targetId: input.targetId ?? null,
    metadata: input.metadata ?? {},
    ip: ctx.ip ?? null,
  })
}

/**
 * Audit variant for moments where a full OrgContext does not exist yet:
 * the org-creation transaction, and platform-level auth events
 * (registration, login) which have no tenant.
 */
export async function writeAuditRaw(input: AuditInput & {
  organizationId: string | null
  membershipId?: string | null
  ip?: string | null
}): Promise<void> {
  await db.insert(auditLogs).values({
    organizationId: input.organizationId,
    actorMembershipId: input.membershipId ?? null,
    actorType: 'user',
    action: input.action,
    targetType: input.targetType,
    targetId: input.targetId ?? null,
    metadata: input.metadata ?? {},
    ip: input.ip ?? null,
  })
}

/** Admin-only audit trail with filters and keyset pagination (newest first). */
export async function listAudit(
  ctx: OrgContext,
  query: AuditListQuery,
): Promise<Page<AuditListItemDto>> {
  requirePermission(ctx, 'admin:audit')
  const scoped = orgScoped(ctx)

  const conditions: (SQL | undefined)[] = [
    query.action ? eq(auditLogs.action, query.action) : undefined,
    query.targetType ? eq(auditLogs.targetType, query.targetType) : undefined,
    query.actorMembershipId ? eq(auditLogs.actorMembershipId, query.actorMembershipId) : undefined,
  ]

  const cursor = query.cursor ? decodeCursor(query.cursor) : null
  if (cursor) {
    const t = new Date(cursor.t)
    conditions.push(
      or(lt(auditLogs.createdAt, t), and(eq(auditLogs.createdAt, t), lt(auditLogs.id, cursor.id))),
    )
  }

  const rows = await scoped.db
    .select({
      id: auditLogs.id,
      action: auditLogs.action,
      targetType: auditLogs.targetType,
      targetId: auditLogs.targetId,
      actorMembershipId: auditLogs.actorMembershipId,
      metadata: auditLogs.metadata,
      createdAt: auditLogs.createdAt,
      actorName: users.name,
      actorEmail: users.email,
    })
    .from(auditLogs)
    .leftJoin(memberships, eq(memberships.id, auditLogs.actorMembershipId))
    .leftJoin(users, eq(users.id, memberships.userId))
    .where(scoped.where(auditLogs.organizationId, ...conditions))
    .orderBy(desc(auditLogs.createdAt), desc(auditLogs.id))
    .limit(query.limit + 1)

  const hasMore = rows.length > query.limit
  const items = rows.slice(0, query.limit)
  const last = items[items.length - 1]

  return {
    items: items.map((row) => ({
      id: row.id,
      action: row.action,
      targetType: row.targetType,
      targetId: row.targetId,
      actorMembershipId: row.actorMembershipId,
      metadata: row.metadata as Record<string, unknown>,
      createdAt: row.createdAt.toISOString(),
      actorName: row.actorName ?? row.actorEmail,
    })),
    nextCursor:
      hasMore && last ? encodeCursor({ t: last.createdAt.toISOString(), id: last.id }) : null,
  }
}
