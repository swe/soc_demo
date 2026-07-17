import { asc, eq } from 'drizzle-orm'

import type { MemberDto } from '../../domain/entities/member'
import type { OrgContext } from '../auth/types'
import { orgScoped } from '../db/scoped'
import { memberships, users } from '../db/schema'

/**
 * Org member directory. Read is org-visible (data:read) so analysts can pick
 * assignees; all management mutations (Step 8) require admin:members.
 */
export async function listMembers(ctx: OrgContext): Promise<MemberDto[]> {
  const scoped = orgScoped(ctx)
  const rows = await scoped.db
    .select({
      membershipId: memberships.id,
      userId: users.id,
      name: users.name,
      email: users.email,
      role: memberships.role,
      status: memberships.status,
      createdAt: memberships.createdAt,
    })
    .from(memberships)
    .innerJoin(users, eq(users.id, memberships.userId))
    .where(scoped.where(memberships.organizationId))
    .orderBy(asc(memberships.createdAt))

  return rows.map((row) => ({ ...row, createdAt: row.createdAt.toISOString() }))
}
