import { describe, expect, it } from 'vitest'

import { getAlertById, listAlerts } from '@server/services/alerts'
import { getIncidentById, listIncidents } from '@server/services/incidents'
import { getOverview } from '@server/services/overview'
import { createOrgWithAdmin, seedOrg } from '../helpers/fixtures'

const ANCHOR = new Date('2026-07-01T12:00:00.000Z')

describe('tenant isolation', () => {
  it('prevents org B from reading org A alerts, incidents, and overview counts', async () => {
    const orgA = await createOrgWithAdmin(`Tenant A ${Date.now()}`)
    const orgB = await createOrgWithAdmin(`Tenant B ${Date.now()}`)
    await seedOrg(orgA.organization.id, ANCHOR)

    const alertsA = await listAlerts(orgA.ctx, { limit: 10 })
    expect(alertsA.items.length).toBeGreaterThan(0)
    const sampleAlertId = alertsA.items[0].id

    const alertsB = await listAlerts(orgB.ctx, { limit: 10 })
    expect(alertsB.items).toEqual([])
    expect(await getAlertById(orgB.ctx, sampleAlertId)).toBeNull()

    const incidentsA = await listIncidents(orgA.ctx, { limit: 10 })
    expect(incidentsA.items.length).toBeGreaterThan(0)
    const sampleIncidentId = incidentsA.items[0].id

    const incidentsB = await listIncidents(orgB.ctx, { limit: 10 })
    expect(incidentsB.items).toEqual([])
    expect(await getIncidentById(orgB.ctx, sampleIncidentId)).toBeNull()

    const overviewA = await getOverview(orgA.ctx)
    const overviewB = await getOverview(orgB.ctx)
    expect(overviewA.kpis.openAlerts).toBeGreaterThan(0)
    expect(overviewA.kpis.monitoredAssets).toBeGreaterThan(0)
    expect(overviewB.kpis.openAlerts).toBe(0)
    expect(overviewB.kpis.monitoredAssets).toBe(0)
    expect(overviewB.openIncidents).toEqual([])
  })
})
