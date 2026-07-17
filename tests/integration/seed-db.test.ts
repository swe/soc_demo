import { count, eq } from 'drizzle-orm'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { db } from '@server/db/client'
import { alerts, incidents } from '@server/db/schema'
import { alertFingerprint, createOrgWithAdmin, seedOrg } from '../helpers/fixtures'

const ANCHOR = new Date('2026-07-01T12:00:00.000Z')

describe('seedMeridian database behavior', () => {
  let organizationId: string

  beforeAll(async () => {
    const { organization } = await createOrgWithAdmin(`Seed Org ${Date.now()}`)
    organizationId = organization.id
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
})
