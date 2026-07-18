import { describe, expect, it, vi } from 'vitest'

import type { OrgContext } from '@server/auth/types'

// Simulate a customer deployment: ENABLE_DEMO_DATA=false. Both demo entry
// points must refuse before touching the database.
vi.mock('../../src/env', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../../src/env')>()
  return { ...mod, demoDataEnabled: false }
})

const adminCtx: OrgContext = {
  organizationId: 'org-test',
  membershipId: 'mem-test',
  userId: 'user-test',
  role: 'admin',
}

describe('demo data gating (ENABLE_DEMO_DATA=false)', () => {
  it('seedDemoTenant refuses even for org admins', async () => {
    const { seedDemoTenant } = await import('@server/services/seed')
    await expect(seedDemoTenant(adminCtx)).rejects.toMatchObject({
      name: 'ServiceError',
      status: 403,
    })
  })

  it('ensureDemoTenant refuses to bootstrap', async () => {
    const { ensureDemoTenant } = await import('@server/seed/demo')
    await expect(ensureDemoTenant()).rejects.toMatchObject({
      name: 'ServiceError',
      status: 403,
    })
  })
})
