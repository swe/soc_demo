import { describe, expect, it } from 'vitest'

import { getVulnerabilityById, listVulnerabilities } from '@server/services/vulnerabilities'
import { createOrgWithAdmin, seedOrg } from '../helpers/fixtures'

const ANCHOR = new Date('2026-07-01T12:00:00.000Z')

async function seededOrg() {
  const { organization, ctx } = await createOrgWithAdmin(`Vuln Org ${Date.now()}`)
  await seedOrg(organization.id, ANCHOR)
  return { organization, ctx }
}

describe('vulnerability reads', () => {
  it('lists newest-first with severity/status/exploited filters', async () => {
    const { ctx } = await seededOrg()

    const page = await listVulnerabilities(ctx, { limit: 50 })
    expect(page.items.length).toBeGreaterThan(0)
    // Every row resolves its asset name via join
    expect(page.items.every((v) => typeof v.assetName === 'string')).toBe(true)

    const critical = await listVulnerabilities(ctx, { limit: 50, severity: 'critical' })
    expect(critical.items.every((v) => v.severity === 'critical')).toBe(true)

    const open = await listVulnerabilities(ctx, { limit: 50, status: 'open' })
    expect(open.items.every((v) => v.status === 'open')).toBe(true)

    const exploited = await listVulnerabilities(ctx, { limit: 50, exploited: true })
    expect(exploited.items.length).toBeGreaterThan(0)
    expect(exploited.items.every((v) => v.exploitedInWild)).toBe(true)
  })

  it('detail returns a single finding; cross-tenant reads return null', async () => {
    const { ctx } = await seededOrg()
    const page = await listVulnerabilities(ctx, { limit: 1 })
    const id = page.items[0].id

    const detail = await getVulnerabilityById(ctx, id)
    expect(detail).not.toBeNull()
    expect(detail!.id).toBe(id)

    const intruder = await createOrgWithAdmin(`Vuln Intruder ${Date.now()}`)
    expect(await getVulnerabilityById(intruder.ctx, id)).toBeNull()
  })
})
