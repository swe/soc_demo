import { describe, expect, it } from 'vitest'

import { incidentListQuerySchema } from '@domain/entities/incident'
import { getIncidentById, listIncidents } from '@server/services/incidents'
import { createOrgWithAdmin, seedOrg } from '../helpers/fixtures'

const ANCHOR = new Date('2026-07-01T12:00:00.000Z')

describe('incidents API / service coverage', () => {
  it('rejects invalid query parameters', () => {
    const bad = incidentListQuerySchema.safeParse({ status: 'banana' })
    expect(bad.success).toBe(false)

    const ok = incidentListQuerySchema.safeParse({ status: 'declared', limit: '10' })
    expect(ok.success).toBe(true)
    if (ok.success) expect(ok.data.limit).toBe(10)
  })

  it('lists seeded incidents with per-org numbers and timeline detail', async () => {
    const { ctx } = await createOrgWithAdmin(`Incidents Org ${Date.now()}`)
    await seedOrg(ctx.organizationId, ANCHOR)

    const page = await listIncidents(ctx, { limit: 50 })
    expect(page.items.length).toBeGreaterThan(0)
    expect(page.items.every((i) => i.number >= 1)).toBe(true)

    const numbers = page.items.map((i) => i.number)
    expect(numbers).toEqual([...numbers].sort((a, b) => b - a))

    const detail = await getIncidentById(ctx, page.items[0].id)
    expect(detail).not.toBeNull()
    expect(detail!.timeline.length).toBeGreaterThan(0)
    const firstAt = detail!.timeline[0]!.at
    const lastAt = detail!.timeline[detail!.timeline.length - 1]!.at
    expect(firstAt <= lastAt).toBe(true)

    const declared = await listIncidents(ctx, { limit: 50, status: 'declared' })
    expect(declared.items.every((i) => i.status === 'declared')).toBe(true)
  })
})
