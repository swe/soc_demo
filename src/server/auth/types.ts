import { and, eq } from 'drizzle-orm'

import type { Role } from '../../domain/enums'
import { roleHasPermission, type Permission } from '../../domain/permissions'
import { db } from '../db/client'
import { memberships, sessions } from '../db/schema'

/**
 * The tenant context every service function requires as its first argument.
 * Built from the session; carries the acting org, membership, and role.
 *
 * Kept free of Auth.js / Next imports so services and integration tests can
 * load without the Next runtime.
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

/**
 * Default organization for a fresh session: the org already pinned on another
 * of the user's sessions, else their first active membership. Mirrors the
 * fallback in getOrgContext() so a first login lands directly in a tenant
 * with no organization-selection friction.
 */
export async function resolveDefaultOrganizationId(userId: string): Promise<string | null> {
  const pinned = await db
    .select({ organizationId: sessions.activeOrganizationId })
    .from(sessions)
    .where(eq(sessions.userId, userId))
    .limit(50)
  const pinnedOrgId = pinned.find((s) => s.organizationId)?.organizationId
  if (pinnedOrgId) return pinnedOrgId

  const [membership] = await db
    .select({ organizationId: memberships.organizationId })
    .from(memberships)
    .where(and(eq(memberships.userId, userId), eq(memberships.status, 'active')))
    .limit(1)
  return membership?.organizationId ?? null
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
