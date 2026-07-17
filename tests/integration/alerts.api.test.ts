import { describe, expect, it } from 'vitest'

import { alertListQuerySchema } from '@domain/entities/alert'
import { getAlertById, listAlerts } from '@server/services/alerts'
import { createOrgWithAdmin, seedOrg } from '../helpers/fixtures'

const ANCHOR = new Date('2026-07-01T12:00:00.000Z')

describe('alerts API / service coverage', () => {
  it('rejects invalid query parameters', () => {
    const bad = alertListQuerySchema.safeParse({ limit: '999', severity: 'ultra' })
    expect(bad.success).toBe(false)

    const ok = alertListQuerySchema.safeParse({ limit: '25', severity: 'critical', q: 'phish' })
    expect(ok.success).toBe(true)
    if (ok.success) {
      expect(ok.data.limit).toBe(25)
      expect(ok.data.severity).toBe('critical')
      expect(ok.data.q).toBe('phish')
    }
  })

  it('lists, filters, paginates, and returns detail for seeded alerts', async () => {
    const { ctx } = await createOrgWithAdmin(`Alerts Org ${Date.now()}`)
    await seedOrg(ctx.organizationId, ANCHOR)

    const page1 = await listAlerts(ctx, { limit: 20 })
    expect(page1.items.length).toBe(20)
    expect(page1.nextCursor).toBeTruthy()

    const page2 = await listAlerts(ctx, { limit: 20, cursor: page1.nextCursor! })
    expect(page2.items.length).toBeGreaterThan(0)
    expect(page2.items[0].id).not.toBe(page1.items[0].id)

    const critical = await listAlerts(ctx, { limit: 50, severity: 'critical' })
    expect(critical.items.length).toBeGreaterThan(0)
    expect(critical.items.every((a) => a.severity === 'critical')).toBe(true)

    const searched = await listAlerts(ctx, { limit: 50, q: critical.items[0].title.slice(0, 12) })
    expect(searched.items.some((a) => a.id === critical.items[0].id)).toBe(true)

    const detail = await getAlertById(ctx, page1.items[0].id)
    expect(detail).not.toBeNull()
    expect(detail?.id).toBe(page1.items[0].id)
    expect(detail?.detectedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)

    expect(await getAlertById(ctx, 'does-not-exist')).toBeNull()
  })
})
