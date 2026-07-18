import { and, count, eq, like, not } from 'drizzle-orm'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { uuidv7 } from 'uuidv7'

import type { OrgContext } from '@server/auth/types'
import { db } from '@server/db/client'
import { alerts, incidents, investigations } from '@server/db/schema'
import { promoteFromInvestigation } from '@server/services/incidents'
import { createInvestigation } from '@server/services/investigations'
import { alertFingerprint, createOrgWithAdmin, seedOrg } from '../helpers/fixtures'

const ANCHOR = new Date('2026-07-01T12:00:00.000Z')
const seedOwned = like(alerts.id, 'seed\\_%')

describe('seedMeridian database behavior', () => {
  let organizationId: string
  let ctx: OrgContext

  beforeAll(async () => {
    const created = await createOrgWithAdmin(`Seed Org ${Date.now()}`)
    organizationId = created.organization.id
    ctx = created.ctx
  })

  afterAll(async () => {
    // Leave tenant data for debugging failed runs; CI uses ephemeral DB.
  })

  it('is deterministic for a fixed time anchor', async () => {
    await seedOrg(organizationId, ANCHOR)
    const first = await alertFingerprint(organizationId)

    await seedOrg(organizationId, ANCHOR)
    const second = await alertFingerprint(organizationId)

    expect(second).toEqual(first)
  })

  it('is idempotent on re-seed (stable counts and incident numbering restart)', async () => {
    const summaryA = await seedOrg(organizationId, ANCHOR)
    const [{ n: alertsA }] = await db
      .select({ n: count() })
      .from(alerts)
      .where(eq(alerts.organizationId, organizationId))
    const incidentsA = await db
      .select({ number: incidents.number, title: incidents.title })
      .from(incidents)
      .where(eq(incidents.organizationId, organizationId))
      .orderBy(incidents.number)

    const summaryB = await seedOrg(organizationId, ANCHOR)
    const [{ n: alertsB }] = await db
      .select({ n: count() })
      .from(alerts)
      .where(eq(alerts.organizationId, organizationId))
    const incidentsB = await db
      .select({ number: incidents.number, title: incidents.title })
      .from(incidents)
      .where(eq(incidents.organizationId, organizationId))
      .orderBy(incidents.number)

    expect(summaryB).toEqual(summaryA)
    expect(Number(alertsB)).toBe(Number(alertsA))
    expect(incidentsB).toEqual(incidentsA)
    expect(incidentsB[0]?.number).toBe(1)
  })

  it('never deletes non-seed operational rows on re-seed', async () => {
    await seedOrg(organizationId, ANCHOR)

    // App-created rows use uuidv7 ids — they must not match the seed_ prefix.
    const [opsAlert] = await db
      .insert(alerts)
      .values({
        id: uuidv7(),
        organizationId,
        title: 'Operator-created alert that must survive re-seed',
        description: 'Created through the product, not the seed engine',
        severity: 'high',
        status: 'new',
        source: 'manual',
        ruleKey: 'ops.survive',
        detectedAt: new Date('2026-07-02T08:00:00.000Z'),
      })
      .returning()

    const investigation = await createInvestigation(ctx, {
      title: 'Operator investigation that must survive re-seed',
      hypothesis: 'Non-seed data must survive seedMeridian wipe',
      alertIds: [],
    })
    const incident = await promoteFromInvestigation(ctx, investigation.id)
    expect(incident).not.toBeNull()

    const [{ seedAlertsBefore }] = await db
      .select({ seedAlertsBefore: count() })
      .from(alerts)
      .where(and(eq(alerts.organizationId, organizationId), seedOwned))

    await seedOrg(organizationId, ANCHOR)

    const [survivingAlert] = await db
      .select({ id: alerts.id, title: alerts.title })
      .from(alerts)
      .where(eq(alerts.id, opsAlert.id))
    expect(survivingAlert?.title).toBe(opsAlert.title)

    const [survivingInvestigation] = await db
      .select({ id: investigations.id, title: investigations.title })
      .from(investigations)
      .where(eq(investigations.id, investigation.id))
    expect(survivingInvestigation?.title).toBe(investigation.title)

    const [survivingIncident] = await db
      .select({ id: incidents.id, number: incidents.number })
      .from(incidents)
      .where(eq(incidents.id, incident!.id))
    expect(survivingIncident?.number).toBe(incident!.number)

    const [{ seedAlertsAfter }] = await db
      .select({ seedAlertsAfter: count() })
      .from(alerts)
      .where(and(eq(alerts.organizationId, organizationId), seedOwned))
    expect(Number(seedAlertsAfter)).toBe(Number(seedAlertsBefore))

    const [{ opsAlerts }] = await db
      .select({ opsAlerts: count() })
      .from(alerts)
      .where(and(eq(alerts.organizationId, organizationId), not(seedOwned)))
    expect(Number(opsAlerts)).toBeGreaterThanOrEqual(1)
  })
})
