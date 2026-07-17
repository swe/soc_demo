import { and, eq } from 'drizzle-orm'
import { z } from 'zod'

import { AuthError, setActiveOrganization } from '../auth/context'
import { db } from '../db/client'
import { auditLogs, memberships, organizations } from '../db/schema'
import { writeAuditRaw } from './audit'

export const createOrganizationSchema = z.object({
  name: z.string().trim().min(2).max(200),
})

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

export async function createOrganization(input: {
  userId: string
  name: string
  ip?: string | null
}) {
  const base = slugify(input.name) || 'org'

  return db.transaction(async (tx) => {
    // Find a free slug (base, base-2, base-3, …)
    let slug = base
    for (let i = 2; ; i++) {
      const [taken] = await tx
        .select({ id: organizations.id })
        .from(organizations)
        .where(eq(organizations.slug, slug))
        .limit(1)
      if (!taken) break
      slug = `${base}-${i}`
    }

    const [org] = await tx
      .insert(organizations)
      .values({ name: input.name, slug })
      .returning()

    const [membership] = await tx
      .insert(memberships)
      .values({
        organizationId: org.id,
        userId: input.userId,
        role: 'admin',
        status: 'active',
      })
      .returning()

    await tx.insert(auditLogs).values({
      organizationId: org.id,
      actorMembershipId: membership.id,
      actorType: 'user',
      action: 'org.create',
      targetType: 'organization',
      targetId: org.id,
      metadata: { name: org.name, slug: org.slug },
      ip: input.ip ?? null,
    })

    return { organization: org, membership }
  })
}

export async function listUserOrganizations(userId: string) {
  return db
    .select({
      id: organizations.id,
      name: organizations.name,
      slug: organizations.slug,
      role: memberships.role,
      membershipId: memberships.id,
    })
    .from(memberships)
    .innerJoin(organizations, eq(organizations.id, memberships.organizationId))
    .where(and(eq(memberships.userId, userId), eq(memberships.status, 'active')))
    .orderBy(organizations.name)
}

export async function switchOrganization(input: {
  userId: string
  organizationId: string
  ip?: string | null
}) {
  await setActiveOrganization(input.userId, input.organizationId)

  const [membership] = await db
    .select({ id: memberships.id })
    .from(memberships)
    .where(
      and(
        eq(memberships.userId, input.userId),
        eq(memberships.organizationId, input.organizationId),
      ),
    )
    .limit(1)
  if (!membership) throw new AuthError('Not a member of that organization', 403)

  await writeAuditRaw({
    organizationId: input.organizationId,
    membershipId: membership.id,
    action: 'org.switch',
    targetType: 'organization',
    targetId: input.organizationId,
    ip: input.ip,
  })
}
