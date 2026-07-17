import { eq } from 'drizzle-orm'
import { uuidv7 } from 'uuidv7'

import type { Role } from '@domain/enums'
import type { OrgContext } from '@server/auth/types'
import { hashPassword } from '@server/auth/passwords'
import { db } from '@server/db/client'
import { alerts, memberships, users } from '@server/db/schema'
import { createOrganization } from '@server/services/organizations'
import { seedMeridian } from '@server/seed/meridian'

let counter = 0

export function uniqueEmail(prefix = 'analyst'): string {
  counter += 1
  return `${prefix}.${Date.now()}.${counter}@example.test`
}

export async function createUser(input?: {
  email?: string
  name?: string
  password?: string
}) {
  const email = input?.email ?? uniqueEmail()
  const password = input?.password ?? 'test-password-ok'
  const [user] = await db
    .insert(users)
    .values({
      id: uuidv7(),
      email,
      name: input?.name ?? 'Test User',
      passwordHash: await hashPassword(password),
    })
    .returning()
  return { user, password }
}

export async function createOrgWithAdmin(name = 'Meridian Financial Group') {
  const { user } = await createUser({ name: 'Admin User' })
  const { organization, membership } = await createOrganization({
    userId: user.id,
    name,
  })
  const ctx: OrgContext = {
    organizationId: organization.id,
    membershipId: membership.id,
    userId: user.id,
    role: 'admin',
  }
  return { user, organization, membership, ctx }
}

export async function addMembership(input: {
  organizationId: string
  userId: string
  role: Role
}) {
  const [membership] = await db
    .insert(memberships)
    .values({
      organizationId: input.organizationId,
      userId: input.userId,
      role: input.role,
      status: 'active',
    })
    .returning()
  return membership
}

export function asCtx(input: {
  organizationId: string
  membershipId: string
  userId: string
  role: Role
}): OrgContext {
  return {
    organizationId: input.organizationId,
    membershipId: input.membershipId,
    userId: input.userId,
    role: input.role,
  }
}

export async function seedOrg(organizationId: string, anchor = new Date('2026-07-01T12:00:00.000Z')) {
  return seedMeridian(db, organizationId, anchor)
}

/** Stable fingerprint of seeded alerts for determinism checks. */
export async function alertFingerprint(organizationId: string): Promise<string> {
  const rows = await db
    .select({
      id: alerts.id,
      title: alerts.title,
      severity: alerts.severity,
      status: alerts.status,
      ruleKey: alerts.ruleKey,
      detectedAt: alerts.detectedAt,
    })
    .from(alerts)
    .where(eq(alerts.organizationId, organizationId))
    .orderBy(alerts.id)

  return JSON.stringify(
    rows.map((r) => ({
      id: r.id,
      title: r.title,
      severity: r.severity,
      status: r.status,
      ruleKey: r.ruleKey,
      detectedAt: r.detectedAt.toISOString(),
    })),
  )
}
