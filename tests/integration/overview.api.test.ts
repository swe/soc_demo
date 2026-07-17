import { describe, expect, it } from 'vitest'

import { getOverview } from '@server/services/overview'
import { createOrgWithAdmin, seedOrg } from '../helpers/fixtures'

const ANCHOR = new Date('2026-07-01T12:00:00.000Z')

describe('overview API / service coverage', () => {
  it('returns empty KPIs for an unseeded organization', async () => {
    const { ctx } = await createOrgWithAdmin(`Empty Overview ${Date.now()}`)
    const overview = await getOverview(ctx)
    expect(overview.kpis.openAlerts).toBe(0)
    expect(overview.kpis.openIncidents).toBe(0)
    expect(overview.kpis.monitoredAssets).toBe(0)
    expect(overview.openIncidents).toEqual([])
    expect(overview.severityTrend).toHaveLength(14)
  })

  it('computes KPIs and lists from seeded Meridian data', async () => {
    const { ctx } = await createOrgWithAdmin(`Seeded Overview ${Date.now()}`)
    await seedOrg(ctx.organizationId, ANCHOR)

    const overview = await getOverview(ctx)
    expect(overview.kpis.openAlerts).toBeGreaterThan(0)
    expect(overview.kpis.monitoredAssets).toBeGreaterThan(0)
    expect(overview.kpis.openVulnerabilities).toBeGreaterThan(0)
    expect(overview.topRiskyAssets.length).toBeGreaterThan(0)
    expect(overview.severityTrend).toHaveLength(14)

    const severitySum =
      overview.kpis.openAlertsBySeverity.critical +
      overview.kpis.openAlertsBySeverity.high +
      overview.kpis.openAlertsBySeverity.medium +
      overview.kpis.openAlertsBySeverity.low
    expect(severitySum).toBe(overview.kpis.openAlerts)
  })
})
