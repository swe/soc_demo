import { describe, expect, it } from 'vitest'

import { getAssetById, listAssets } from '@server/services/assets'
import { getIdentityById, listIdentities } from '@server/services/identities'
import { createOrgWithAdmin, seedOrg } from '../helpers/fixtures'

const ANCHOR = new Date('2026-07-01T12:00:00.000Z')

async function seededOrg() {
  const { organization, ctx } = await createOrgWithAdmin(`Inventory Org ${Date.now()}`)
  await seedOrg(organization.id, ANCHOR)
  return { organization, ctx }
}

describe('asset reads', () => {
  it('lists assets by risk with filters and pagination', async () => {
    const { ctx } = await seededOrg()

    const page = await listAssets(ctx, { limit: 10 })
    expect(page.items.length).toBe(10)
    expect(page.nextCursor).toBeTruthy()
    // Ordered by descending risk
    const scores = page.items.map((a) => a.riskScore)
    expect([...scores].sort((a, b) => b - a)).toEqual(scores)

    const page2 = await listAssets(ctx, { limit: 10, cursor: page.nextCursor! })
    expect(page2.items[0].id).not.toBe(page.items[0].id)

    const devices = await listAssets(ctx, { limit: 50, type: 'device' })
    expect(devices.items.length).toBeGreaterThan(0)
    expect(devices.items.every((a) => a.type === 'device')).toBe(true)
  })

  it('asset detail includes owner, vulnerabilities, and related alerts', async () => {
    const { ctx } = await seededOrg()
    const page = await listAssets(ctx, { limit: 50 })

    // The seeded top-risk assets carry vulnerabilities and alert references
    const withVulns = []
    for (const asset of page.items.slice(0, 10)) {
      const detail = await getAssetById(ctx, asset.id)
      expect(detail).not.toBeNull()
      if (detail!.vulnerabilities.length > 0) withVulns.push(detail!)
    }
    expect(withVulns.length).toBeGreaterThan(0)

    const someWithAlerts = []
    for (const asset of page.items) {
      const detail = await getAssetById(ctx, asset.id)
      if (detail!.relatedAlerts.length > 0) {
        someWithAlerts.push(detail!)
        break
      }
    }
    expect(someWithAlerts.length).toBeGreaterThan(0)
  })

  it('asset reads are tenant-isolated', async () => {
    const { ctx } = await seededOrg()
    const page = await listAssets(ctx, { limit: 1 })

    const intruder = await createOrgWithAdmin(`Inventory Intruder ${Date.now()}`)
    expect(await getAssetById(intruder.ctx, page.items[0].id)).toBeNull()
    const foreign = await listAssets(intruder.ctx, { limit: 50 })
    expect(foreign.items.length).toBe(0)
  })
})

describe('identity reads', () => {
  it('lists identities by risk with type and tier filters', async () => {
    const { ctx } = await seededOrg()

    const page = await listIdentities(ctx, { limit: 50 })
    expect(page.items.length).toBeGreaterThan(0)
    const scores = page.items.map((i) => i.riskScore)
    expect([...scores].sort((a, b) => b - a)).toEqual(scores)

    const humans = await listIdentities(ctx, { limit: 50, type: 'human' })
    expect(humans.items.every((i) => i.type === 'human')).toBe(true)

    const privileged = await listIdentities(ctx, { limit: 50, privilegeTier: 'privileged' })
    expect(privileged.items.every((i) => i.privilegeTier === 'privileged')).toBe(true)
  })

  it('identity detail includes owned assets and related alerts', async () => {
    const { ctx } = await seededOrg()
    const page = await listIdentities(ctx, { limit: 50 })

    let sawOwnedAsset = false
    let sawRelatedAlert = false
    for (const identity of page.items) {
      const detail = await getIdentityById(ctx, identity.id)
      expect(detail).not.toBeNull()
      if (detail!.ownedAssets.length > 0) sawOwnedAsset = true
      if (detail!.relatedAlerts.length > 0) sawRelatedAlert = true
      if (sawOwnedAsset && sawRelatedAlert) break
    }
    expect(sawOwnedAsset).toBe(true)
    expect(sawRelatedAlert).toBe(true)
  })

  it('identity reads are tenant-isolated', async () => {
    const { ctx } = await seededOrg()
    const page = await listIdentities(ctx, { limit: 1 })

    const intruder = await createOrgWithAdmin(`Identity Intruder ${Date.now()}`)
    expect(await getIdentityById(intruder.ctx, page.items[0].id)).toBeNull()
  })
})
