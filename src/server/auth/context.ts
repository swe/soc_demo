import { and, eq } from 'drizzle-orm'

import type { Role } from '../../domain/enums'
import { roleHasPermission, type Permission } from '../../domain/permissions'
import { db } from '../db/client'
import { memberships, sessions } from '../db/schema'
import { auth } from './config'

/**
 * The tenant context every service function requires as its first argument.
 * Built from the session; carries the acting org, membership, and role.
 */
export type OrgContext = {
  organizationId: string
  membershipId: string
  userId: string
  role: Role
  ip?: string
}

export class AuthError extends Error {
  constructor(
    message: string,
    public readonly status: 401 | 403 = 401,
  ) {
    super(message)
  }
}

export function can(ctx: OrgContext, permission: Permission): boolean {
  return roleHasPermission(ctx.role, permission)
}

export function requirePermission(ctx: OrgContext, permission: Permission): void {
  if (!can(ctx, permission)) {
    throw new AuthError(`Missing permission: ${permission}`, 403)
  }
}

/** Current Auth.js session, or null. The only session accessor the app uses. */
export async function getSession() {
  return auth()
}

/**
 * Resolve session → active organization → membership → OrgContext.
 * Falls back to the user's only membership when the session has no active org
 * pinned yet (first login), persisting the choice.
 */
export async function getOrgContext(): Promise<OrgContext | null> {
  const session = await getSession()
  if (!session?.user?.id) return null
  const userId = session.user.id

  const userSessions = await db
    .select({ token: sessions.sessionToken, activeOrganizationId: sessions.activeOrganizationId })
    .from(sessions)
    .where(eq(sessions.userId, userId))
    .limit(50)

  // Auth.js does not expose the raw token here; use the most recently pinned
  // active org across the user's sessions, else their sole active membership.
  const pinnedOrgId = userSessions.find((s) => s.activeOrganizationId)?.activeOrganizationId

  const rows = await db
    .select({
      id: memberships.id,
      organizationId: memberships.organizationId,
      role: memberships.role,
      status: memberships.status,
    })
    .from(memberships)
    .where(and(eq(memberships.userId, userId), eq(memberships.status, 'active')))

  if (rows.length === 0) return null

  const active = (pinnedOrgId && rows.find((m) => m.organizationId === pinnedOrgId)) || rows[0]

  return {
    organizationId: active.organizationId,
    membershipId: active.id,
    userId,
    role: active.role,
  }
}

export async function requireOrgContext(permission?: Permission): Promise<OrgContext> {
  const ctx = await getOrgContext()
  if (!ctx) throw new AuthError('Not authenticated or no active organization', 401)
  if (permission) requirePermission(ctx, permission)
  return ctx
}

/** Pin the acting organization on all of the user's sessions (org switcher). */
export async function setActiveOrganization(userId: string, organizationId: string): Promise<void> {
  const [membership] = await db
    .select({ id: memberships.id })
    .from(memberships)
    .where(
      and(
        eq(memberships.userId, userId),
        eq(memberships.organizationId, organizationId),
        eq(memberships.status, 'active'),
      ),
    )
    .limit(1)
  if (!membership) throw new AuthError('Not a member of that organization', 403)

  await db
    .update(sessions)
    .set({ activeOrganizationId: organizationId })
    .where(eq(sessions.userId, userId))
}
