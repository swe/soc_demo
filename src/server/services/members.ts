import { createHash, randomBytes } from 'node:crypto'

import { and, asc, count, desc, eq, isNull, ne, sql } from 'drizzle-orm'

import type {
  InviteCreate,
  InviteDto,
  MemberDto,
  MemberPatch,
} from '../../domain/entities/member'
import { requirePermission, type OrgContext } from '../auth/types'
import { env } from '../../env'
import { db } from '../db/client'
import { orgScoped } from '../db/scoped'
import { memberships, organizationInvites, users } from '../db/schema'
import { writeAudit, writeAuditRaw } from './audit'
import { ServiceError } from './errors'

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

const INVITE_TTL_DAYS = 7

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

function inviteToDto(row: typeof organizationInvites.$inferSelect): InviteDto {
  return {
    id: row.id,
    email: row.email,
    role: row.role,
    invitedByMembershipId: row.invitedByMembershipId,
    expiresAt: row.expiresAt.toISOString(),
    acceptedAt: row.acceptedAt?.toISOString() ?? null,
    revokedAt: row.revokedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  }
}

/** Admin guard: an org must always keep at least one active admin. */
async function assertNotLastActiveAdmin(ctx: OrgContext, membershipId: string): Promise<void> {
  const scoped = orgScoped(ctx)
  const [target] = await scoped.db
    .select({ role: memberships.role, status: memberships.status })
    .from(memberships)
    .where(scoped.where(memberships.organizationId, eq(memberships.id, membershipId)))
    .limit(1)
  if (!target || target.role !== 'admin' || target.status !== 'active') return

  const [others] = await scoped.db
    .select({ n: count() })
    .from(memberships)
    .where(
      scoped.where(
        memberships.organizationId,
        eq(memberships.role, 'admin'),
        eq(memberships.status, 'active'),
        ne(memberships.id, membershipId),
      ),
    )
  if (Number(others?.n ?? 0) === 0) {
    throw new ServiceError('Cannot demote or suspend the last active admin', 409)
  }
}

export async function patchMember(
  ctx: OrgContext,
  membershipId: string,
  patch: MemberPatch,
): Promise<MemberDto | null> {
  requirePermission(ctx, 'admin:members')
  const scoped = orgScoped(ctx)

  const [row] = await scoped.db
    .select()
    .from(memberships)
    .where(scoped.where(memberships.organizationId, eq(memberships.id, membershipId)))
    .limit(1)
  if (!row) return null

  const demotesAdmin =
    (patch.role !== undefined && patch.role !== 'admin') ||
    (patch.status !== undefined && patch.status !== 'active')
  if (demotesAdmin) await assertNotLastActiveAdmin(ctx, membershipId)

  const update: Partial<typeof memberships.$inferInsert> = {}
  const auditEntries: { action: string; metadata: Record<string, unknown> }[] = []

  if (patch.role !== undefined && patch.role !== row.role) {
    update.role = patch.role
    auditEntries.push({ action: 'member.role_change', metadata: { from: row.role, to: patch.role } })
  }
  if (patch.status !== undefined && patch.status !== row.status) {
    update.status = patch.status
    auditEntries.push({
      action: patch.status === 'suspended' ? 'member.suspend' : 'member.reactivate',
      metadata: { from: row.status, to: patch.status },
    })
  }

  if (Object.keys(update).length > 0) {
    await scoped.db
      .update(memberships)
      .set(update)
      .where(scoped.where(memberships.organizationId, eq(memberships.id, membershipId)))
    for (const entry of auditEntries) {
      await writeAudit(ctx, {
        action: entry.action,
        targetType: 'membership',
        targetId: membershipId,
        metadata: entry.metadata,
      })
    }
  }

  const members = await listMembers(ctx)
  return members.find((m) => m.membershipId === membershipId) ?? null
}

export async function listInvites(ctx: OrgContext): Promise<InviteDto[]> {
  requirePermission(ctx, 'admin:members')
  const scoped = orgScoped(ctx)
  const rows = await scoped.db
    .select()
    .from(organizationInvites)
    .where(scoped.where(organizationInvites.organizationId))
    .orderBy(desc(organizationInvites.createdAt))
  return rows.map(inviteToDto)
}

/**
 * Create an invite and return the one-time accept URL. The raw token is
 * never stored — only its SHA-256 hash. No email is sent in M2; the admin
 * copies the link.
 */
export async function createInvite(
  ctx: OrgContext,
  input: InviteCreate,
): Promise<{ invite: InviteDto; acceptUrl: string }> {
  requirePermission(ctx, 'admin:members')
  const scoped = orgScoped(ctx)
  const email = input.email.toLowerCase()

  // Reject if the address already belongs to an active/invited member.
  const [existingMember] = await scoped.db
    .select({ id: memberships.id })
    .from(memberships)
    .innerJoin(users, eq(users.id, memberships.userId))
    .where(
      scoped.where(
        memberships.organizationId,
        sql`lower(${users.email}) = ${email}`,
        ne(memberships.status, 'suspended'),
      ),
    )
    .limit(1)
  if (existingMember) {
    throw new ServiceError('That address already belongs to a member of this organization', 409)
  }

  const [live] = await scoped.db
    .select({ id: organizationInvites.id })
    .from(organizationInvites)
    .where(
      scoped.where(
        organizationInvites.organizationId,
        sql`lower(${organizationInvites.email}) = ${email}`,
        isNull(organizationInvites.acceptedAt),
        isNull(organizationInvites.revokedAt),
      ),
    )
    .limit(1)
  if (live) {
    throw new ServiceError('A pending invite already exists for that address', 409)
  }

  const token = randomBytes(32).toString('base64url')
  const [row] = await scoped.db
    .insert(organizationInvites)
    .values({
      organizationId: ctx.organizationId,
      email,
      role: input.role,
      tokenHash: hashToken(token),
      invitedByMembershipId: ctx.membershipId,
      expiresAt: new Date(Date.now() + INVITE_TTL_DAYS * 86_400_000),
    })
    .returning()

  await writeAudit(ctx, {
    action: 'member.invite',
    targetType: 'organization_invite',
    targetId: row.id,
    metadata: { email, role: input.role },
  })

  return {
    invite: inviteToDto(row),
    acceptUrl: `${env.APP_URL}/accept-invite?token=${token}`,
  }
}

export async function revokeInvite(ctx: OrgContext, id: string): Promise<InviteDto | null> {
  requirePermission(ctx, 'admin:members')
  const scoped = orgScoped(ctx)

  const [row] = await scoped.db
    .select()
    .from(organizationInvites)
    .where(scoped.where(organizationInvites.organizationId, eq(organizationInvites.id, id)))
    .limit(1)
  if (!row) return null
  if (row.acceptedAt) throw new ServiceError('Invite was already accepted', 409)
  if (row.revokedAt) return inviteToDto(row)

  const [updated] = await scoped.db
    .update(organizationInvites)
    .set({ revokedAt: new Date() })
    .where(scoped.where(organizationInvites.organizationId, eq(organizationInvites.id, id)))
    .returning()

  await writeAudit(ctx, {
    action: 'member.invite_revoke',
    targetType: 'organization_invite',
    targetId: id,
    metadata: { email: row.email },
  })

  return inviteToDto(updated)
}

/**
 * Accept an invite link. Runs without an OrgContext — the acting user has no
 * membership in the target org yet. The invite is bound to the invited email:
 * the signed-in account must match it.
 */
export async function acceptInvite(
  userId: string,
  token: string,
): Promise<{ organizationId: string; membershipId: string }> {
  const [user] = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)
  if (!user) throw new ServiceError('User not found', 404)

  const [invite] = await db
    .select()
    .from(organizationInvites)
    .where(eq(organizationInvites.tokenHash, hashToken(token)))
    .limit(1)

  if (!invite) throw new ServiceError('Invite not found', 404)
  if (invite.revokedAt) throw new ServiceError('Invite was revoked', 410)
  if (invite.acceptedAt) throw new ServiceError('Invite was already used', 410)
  if (invite.expiresAt.getTime() < Date.now()) throw new ServiceError('Invite has expired', 410)
  if (invite.email.toLowerCase() !== user.email.toLowerCase()) {
    throw new ServiceError('This invite was issued to a different email address', 403)
  }

  const [existing] = await db
    .select({ id: memberships.id, status: memberships.status })
    .from(memberships)
    .where(
      and(
        eq(memberships.organizationId, invite.organizationId),
        eq(memberships.userId, user.id),
      ),
    )
    .limit(1)
  if (existing && existing.status !== 'suspended') {
    throw new ServiceError('You are already a member of this organization', 409)
  }
  if (existing) throw new ServiceError('Your membership in this organization is suspended', 403)

  const membership = await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(memberships)
      .values({
        organizationId: invite.organizationId,
        userId: user.id,
        role: invite.role,
        status: 'active',
      })
      .returning()
    await tx
      .update(organizationInvites)
      .set({ acceptedAt: new Date() })
      .where(eq(organizationInvites.id, invite.id))
    return created
  })

  await writeAuditRaw({
    organizationId: invite.organizationId,
    membershipId: membership.id,
    action: 'member.invite_accept',
    targetType: 'membership',
    targetId: membership.id,
    metadata: { inviteId: invite.id, role: invite.role },
  })

  return { organizationId: invite.organizationId, membershipId: membership.id }
}
