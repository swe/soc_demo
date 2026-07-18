import { and, count, eq } from 'drizzle-orm'

import { demoDataEnabled } from '../../env'
import { hashPassword } from '../auth/passwords'
import { db } from '../db/client'
import {
  alerts,
  assets,
  events,
  identities,
  incidents,
  investigations,
  memberships,
  organizations,
  users,
  vulnerabilities,
} from '../db/schema'
import { writeAuditRaw } from '../services/audit'
import { ServiceError } from '../services/errors'
import { seedMeridian, type SeedSummary } from './meridian'

export const DEMO_ORG_NAME = 'Meridian Financial Group'
export const DEMO_ORG_SLUG = 'meridian-financial-group'
export const DEMO_USER_EMAIL = 'demo@svalbard.ca'
export const DEMO_USER_NAME = 'Demo Analyst'
export const DEMO_USER_PASSWORD = 'Demo123'

/** Marker stored in organization.settings so re-runs can skip re-seeding. */
type DemoSeedMarker = {
  version: number
  seededAt: string
  summary: SeedSummary
}

export type DemoBootstrapReport = {
  organization: { id: string; name: string; slug: string; created: boolean }
  user: { id: string; email: string; created: boolean }
  membership: { id: string; role: string; status: string; created: boolean }
  seed: { action: 'seeded' | 'reset' | 'skipped'; version: number }
  counts: {
    alerts: number
    incidents: number
    investigations: number
    assets: number
    identities: number
    vulnerabilities: number
    events: number
  }
}

async function entityCounts(organizationId: string): Promise<DemoBootstrapReport['counts']> {
  const [[a], [inc], [inv], [ast], [idn], [vln], [evt]] = await Promise.all([
    db.select({ n: count() }).from(alerts).where(eq(alerts.organizationId, organizationId)),
    db.select({ n: count() }).from(incidents).where(eq(incidents.organizationId, organizationId)),
    db.select({ n: count() }).from(investigations).where(eq(investigations.organizationId, organizationId)),
    db.select({ n: count() }).from(assets).where(eq(assets.organizationId, organizationId)),
    db.select({ n: count() }).from(identities).where(eq(identities.organizationId, organizationId)),
    db.select({ n: count() }).from(vulnerabilities).where(eq(vulnerabilities.organizationId, organizationId)),
    db.select({ n: count() }).from(events).where(eq(events.organizationId, organizationId)),
  ])
  return {
    alerts: a.n,
    incidents: inc.n,
    investigations: inv.n,
    assets: ast.n,
    identities: idn.n,
    vulnerabilities: vln.n,
    events: evt.n,
  }
}

/**
 * Integrity check after bootstrap. Freshly seeded orgs must match the seed
 * summary exactly; previously seeded orgs may have grown (demo sessions
 * promote investigations into new incidents) but must never have lost the
 * seeded baseline for entities the app cannot delete.
 */
function verifyIntegrity(
  countsNow: DemoBootstrapReport['counts'],
  expected: SeedSummary,
  freshlySeeded: boolean,
): void {
  const checks: Array<[keyof DemoBootstrapReport['counts'], number]> = [
    ['alerts', expected.alerts],
    ['incidents', expected.incidents],
    ['investigations', expected.investigations],
    ['assets', expected.assets],
    ['identities', expected.identities],
    ['vulnerabilities', expected.vulnerabilities],
    ['events', expected.events],
  ]
  for (const [entity, expectedCount] of checks) {
    const actual = countsNow[entity]
    const ok = freshlySeeded ? actual === expectedCount : actual >= expectedCount
    if (!ok) {
      throw new ServiceError(
        `Demo data integrity check failed: ${entity} count is ${actual}, expected ` +
          `${freshlySeeded ? '' : 'at least '}${expectedCount}. ` +
          'Run "pnpm demo:setup --reset" to restore the pristine dataset.',
        409,
      )
    }
  }
}

/**
 * Idempotent demo bootstrap: guarantee the Meridian Financial Group demo org
 * (exact slug, no suffixes), the demo user, an active admin membership, and
 * the deterministic Meridian dataset (seed-if-missing; `reset` wipes the org's
 * security data and restores the pristine dataset).
 *
 * Every step is check-then-create, so the function is safe to run repeatedly
 * and completes the remainder if a previous run was interrupted.
 */
export async function ensureDemoTenant(options?: { reset?: boolean }): Promise<DemoBootstrapReport> {
  if (!demoDataEnabled) {
    throw new ServiceError(
      'Demo bootstrap is disabled on this deployment (ENABLE_DEMO_DATA=false). ' +
        'Customer environments must never receive Meridian demo data.',
      403,
    )
  }

  // 1. Organization — adopt by slug, never create suffixed duplicates.
  let orgCreated = false
  let [org] = await db.select().from(organizations).where(eq(organizations.slug, DEMO_ORG_SLUG)).limit(1)
  if (!org) {
    ;[org] = await db
      .insert(organizations)
      .values({ name: DEMO_ORG_NAME, slug: DEMO_ORG_SLUG })
      .onConflictDoNothing({ target: organizations.slug })
      .returning()
    // Lost a concurrent race → someone else just created it; adopt theirs.
    if (!org) {
      ;[org] = await db.select().from(organizations).where(eq(organizations.slug, DEMO_ORG_SLUG)).limit(1)
    } else {
      orgCreated = true
    }
  }

  // 2. User — create if missing; never overwrite an existing password.
  let userCreated = false
  let [user] = await db.select().from(users).where(eq(users.email, DEMO_USER_EMAIL)).limit(1)
  if (!user) {
    ;[user] = await db
      .insert(users)
      .values({
        name: DEMO_USER_NAME,
        email: DEMO_USER_EMAIL,
        emailVerified: new Date(),
        passwordHash: await hashPassword(DEMO_USER_PASSWORD),
      })
      .returning()
    userCreated = true
  }

  // 3. Membership — guarantee an active admin membership in the demo org.
  let membershipCreated = false
  let [membership] = await db
    .select()
    .from(memberships)
    .where(and(eq(memberships.organizationId, org.id), eq(memberships.userId, user.id)))
    .limit(1)
  if (!membership) {
    ;[membership] = await db
      .insert(memberships)
      .values({ organizationId: org.id, userId: user.id, role: 'admin', status: 'active' })
      .returning()
    membershipCreated = true
  } else if (membership.role !== 'admin' || membership.status !== 'active') {
    ;[membership] = await db
      .update(memberships)
      .set({ role: 'admin', status: 'active' })
      .where(eq(memberships.id, membership.id))
      .returning()
  }

  // 4. Seed — if missing (no marker) or explicitly reset. Skipping preserves
  //    modifications made during demo sessions.
  const settings = (org.settings ?? {}) as Record<string, unknown>
  const existingMarker = settings.demoSeed as DemoSeedMarker | undefined
  let seedAction: DemoBootstrapReport['seed']['action'] = 'skipped'
  let marker = existingMarker

  if (!existingMarker || options?.reset) {
    const summary = await seedMeridian(db, org.id)
    marker = { version: summary.seedVersion, seededAt: new Date().toISOString(), summary }
    await db
      .update(organizations)
      .set({ settings: { ...settings, demoSeed: marker } })
      .where(eq(organizations.id, org.id))
    seedAction = existingMarker ? 'reset' : 'seeded'
  }

  // 5. Verify integrity against the recorded seed summary.
  const counts = await entityCounts(org.id)
  verifyIntegrity(counts, marker!.summary, seedAction !== 'skipped')

  // 6. One system audit record per run that changed something.
  if (orgCreated || userCreated || membershipCreated || seedAction !== 'skipped') {
    await writeAuditRaw({
      organizationId: org.id,
      actorType: 'system',
      action: 'demo.bootstrap',
      targetType: 'organization',
      targetId: org.id,
      metadata: { orgCreated, userCreated, membershipCreated, seedAction, counts },
    })
  }

  return {
    organization: { id: org.id, name: org.name, slug: org.slug, created: orgCreated },
    user: { id: user.id, email: user.email, created: userCreated },
    membership: {
      id: membership.id,
      role: membership.role,
      status: membership.status,
      created: membershipCreated,
    },
    seed: { action: seedAction, version: marker!.version },
    counts,
  }
}
