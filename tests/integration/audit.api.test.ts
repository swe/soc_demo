import { describe, expect, it } from 'vitest'

import { AuthError } from '@server/auth/types'
import { patchAlert, listAlerts } from '@server/services/alerts'
import { listAudit } from '@server/services/audit'
import { addMembership, asCtx, createOrgWithAdmin, createUser, seedOrg } from '../helpers/fixtures'

const ANCHOR = new Date('2026-07-01T12:00:00.000Z')

describe('audit listing', () => {
  it('lists newest-first with action/target/actor filters and pagination', async () => {
    const { organization, ctx } = await createOrgWithAdmin(`Audit Org ${Date.now()}`)
    await seedOrg(organization.id, ANCHOR)

    const page = await listAlerts(ctx, { limit: 2, status: 'new' })
    await patchAlert(ctx, page.items[0].id, { status: 'triaged' })
    await patchAlert(ctx, page.items[1].id, { severity: 'low' })

    const all = await listAudit(ctx, { limit: 50 })
    expect(all.items.length).toBeGreaterThanOrEqual(2)
    const times = all.items.map((e) => e.createdAt)
    expect([...times].sort().reverse()).toEqual(times)
    // Actor is resolved to a display name
    expect(all.items.some((e) => e.actorName)).toBe(true)

    const triage = await listAudit(ctx, { limit: 50, action: 'alert.triage' })
    expect(triage.items.length).toBe(1)
    expect(triage.items[0].targetId).toBe(page.items[0].id)

    const byActor = await listAudit(ctx, { limit: 50, actorMembershipId: ctx.membershipId })
    expect(byActor.items.every((e) => e.actorMembershipId === ctx.membershipId)).toBe(true)

    const paged = await listAudit(ctx, { limit: 1 })
    expect(paged.nextCursor).toBeTruthy()
    const next = await listAudit(ctx, { limit: 1, cursor: paged.nextCursor! })
    expect(next.items[0]?.id).not.toBe(paged.items[0].id)
  })

  it('is admin-only and tenant-isolated', async () => {
    const { organization, ctx } = await createOrgWithAdmin(`Audit Guard Org ${Date.now()}`)
    await seedOrg(organization.id, ANCHOR)
    const page = await listAlerts(ctx, { limit: 1, status: 'new' })
    await patchAlert(ctx, page.items[0].id, { status: 'triaged' })

    const { user: analyst } = await createUser()
    const analystMembership = await addMembership({
      organizationId: organization.id,
      userId: analyst.id,
      role: 'analyst',
    })
    const analystCtx = asCtx({
      organizationId: organization.id,
      membershipId: analystMembership.id,
      userId: analyst.id,
      role: 'analyst',
    })
    const error = await listAudit(analystCtx, { limit: 10 }).catch((e) => e)
    expect(error).toBeInstanceOf(AuthError)
    expect(error.status).toBe(403)

    // Another org's admin sees none of this tenant's entries
    const other = await createOrgWithAdmin(`Audit Intruder ${Date.now()}`)
    const foreign = await listAudit(other.ctx, { limit: 50, action: 'alert.triage' })
    expect(foreign.items.length).toBe(0)
  })
})
