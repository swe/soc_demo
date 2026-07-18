import { and, count, eq, inArray } from 'drizzle-orm'
import { beforeAll, describe, expect, it } from 'vitest'

import { hashPassword, verifyPassword } from '@server/auth/passwords'
import { db } from '@server/db/client'
import { alerts, memberships, organizations, users } from '@server/db/schema'
import {
  DEMO_ORG_NAME,
  DEMO_ORG_SLUG,
  DEMO_USER_EMAIL,
  DEMO_USER_PASSWORD,
  ensureDemoTenant,
} from '@server/seed/demo'

async function demoOrg() {
  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.slug, DEMO_ORG_SLUG))
    .limit(1)
  return org
}

async function demoUser() {
  const [user] = await db.select().from(users).where(eq(users.email, DEMO_USER_EMAIL)).limit(1)
  return user
}

describe('demo bootstrap (ensureDemoTenant)', () => {
  beforeAll(async () => {
    // Start from whatever state the shared test DB is in — the bootstrap must
    // converge regardless.
    await ensureDemoTenant()
  })

  it('creates the demo org with the exact slug — no suffixes, no duplicates', async () => {
    const rows = await db
      .select()
      .from(organizations)
      .where(eq(organizations.slug, DEMO_ORG_SLUG))
    expect(rows).toHaveLength(1)
    expect(rows[0].name).toBe(DEMO_ORG_NAME)
  })

  it('is idempotent: re-running creates nothing and skips the seed', async () => {
    const report = await ensureDemoTenant()
    expect(report.organization.created).toBe(false)
    expect(report.user.created).toBe(false)
    expect(report.membership.created).toBe(false)
    expect(report.seed.action).toBe('skipped')

    const org = await demoOrg()
    const user = await demoUser()
    const [{ n: membershipCount }] = await db
      .select({ n: count() })
      .from(memberships)
      .where(and(eq(memberships.organizationId, org.id), eq(memberships.userId, user.id)))
    expect(membershipCount).toBe(1)
  })

  it('demo user signs in with the documented password via the normal hash flow', async () => {
    const user = await demoUser()
    expect(user.passwordHash).toBeTruthy()
    expect(await verifyPassword(user.passwordHash!, DEMO_USER_PASSWORD)).toBe(true)
    expect(user.emailVerified).not.toBeNull()
  })

  it('never overwrites an existing password', async () => {
    const user = await demoUser()
    const customHash = await hashPassword('operator-changed-password')
    await db.update(users).set({ passwordHash: customHash }).where(eq(users.id, user.id))

    await ensureDemoTenant()

    const after = await demoUser()
    expect(after.passwordHash).toBe(customHash)

    // Restore for the rest of the suite
    await db
      .update(users)
      .set({ passwordHash: await hashPassword(DEMO_USER_PASSWORD) })
      .where(eq(users.id, user.id))
  })

  it('heals a drifted membership back to active admin', async () => {
    const org = await demoOrg()
    const user = await demoUser()
    await db
      .update(memberships)
      .set({ role: 'viewer', status: 'suspended' })
      .where(and(eq(memberships.organizationId, org.id), eq(memberships.userId, user.id)))

    const report = await ensureDemoTenant()
    expect(report.membership.role).toBe('admin')
    expect(report.membership.status).toBe('active')
  })

  it('preserves demo-session modifications on re-run; --reset restores pristine data', async () => {
    const org = await demoOrg()
    const [victim] = await db
      .select({ id: alerts.id, status: alerts.status })
      .from(alerts)
      .where(and(eq(alerts.organizationId, org.id), eq(alerts.status, 'new')))
      .limit(1)
    expect(victim).toBeTruthy()

    await db.update(alerts).set({ status: 'triaged' }).where(eq(alerts.id, victim.id))

    const rerun = await ensureDemoTenant()
    expect(rerun.seed.action).toBe('skipped')
    const [afterRerun] = await db
      .select({ status: alerts.status })
      .from(alerts)
      .where(eq(alerts.id, victim.id))
    expect(afterRerun.status).toBe('triaged')

    const reset = await ensureDemoTenant({ reset: true })
    expect(reset.seed.action).toBe('reset')
    const [afterReset] = await db
      .select({ status: alerts.status })
      .from(alerts)
      .where(eq(alerts.id, victim.id))
    // Stable seed IDs: the same row exists again, back in its seeded state
    expect(afterReset.status).toBe('new')
  })

  it('fails integrity verification when seeded data is missing, until --reset', async () => {
    const org = await demoOrg()
    const missing = await db
      .select({ id: alerts.id })
      .from(alerts)
      .where(eq(alerts.organizationId, org.id))
      .limit(5)
    await db.delete(alerts).where(
      inArray(
        alerts.id,
        missing.map((a) => a.id),
      ),
    )

    await expect(ensureDemoTenant()).rejects.toMatchObject({ name: 'ServiceError', status: 409 })

    const report = await ensureDemoTenant({ reset: true })
    expect(report.seed.action).toBe('reset')
    expect(report.counts.alerts).toBeGreaterThan(0)
  })
})
