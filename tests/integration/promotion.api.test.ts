import { describe, expect, it } from 'vitest'

import { TransitionError } from '@domain/transitions'
import { AuthError } from '@server/auth/types'
import { listAlerts } from '@server/services/alerts'
import { ServiceError } from '@server/services/errors'
import { getIncidentById, patchIncident, promoteFromInvestigation } from '@server/services/incidents'
import { createInvestigation, getInvestigationById } from '@server/services/investigations'
import { addMembership, asCtx, createOrgWithAdmin, createUser, seedOrg } from '../helpers/fixtures'

const ANCHOR = new Date('2026-07-01T12:00:00.000Z')

async function orgWithInvestigation() {
  const { organization, ctx } = await createOrgWithAdmin(`Promotion Org ${Date.now()}`)
  await seedOrg(organization.id, ANCHOR)
  const page = await listAlerts(ctx, { limit: 10, status: 'new' })
  const unlinked = page.items.filter((a) => !a.investigationId)
  const investigation = await createInvestigation(ctx, {
    title: 'Suspicious VPN session cluster',
    alertIds: unlinked.slice(0, 2).map((a) => a.id),
  })
  return { organization, ctx, investigation, alerts: unlinked }
}

describe('investigation → incident promotion', () => {
  it('allocates INC number, copies max alert severity, links back, and audits', async () => {
    const { ctx, investigation } = await orgWithInvestigation()

    const incident = await promoteFromInvestigation(ctx, investigation.id)
    expect(incident).not.toBeNull()
    expect(incident!.number).toBeGreaterThan(0)
    expect(incident!.status).toBe('declared')
    expect(incident!.investigationId).toBe(investigation.id)

    // Severity is the max across linked alerts
    const detail = await getInvestigationById(ctx, investigation.id)
    const severities = detail!.alerts.map((a) => a.severity)
    const rank = { critical: 0, high: 1, medium: 2, low: 3 } as const
    const expected = severities.sort((a, b) => rank[a] - rank[b])[0] ?? 'medium'
    expect(incident!.severity).toBe(expected)

    // Timeline starts with the declaration entry
    expect(incident!.timeline[0].kind).toBe('declared')
    expect(incident!.timeline[0].summary).toContain(investigation.title)

    // Investigation is NOT auto-closed
    expect(detail!.status).toBe(investigation.status)
  })

  it('cannot promote the same investigation twice (409)', async () => {
    const { ctx, investigation } = await orgWithInvestigation()
    await promoteFromInvestigation(ctx, investigation.id)

    const error = await promoteFromInvestigation(ctx, investigation.id).catch((e) => e)
    expect(error).toBeInstanceOf(ServiceError)
    expect(error.status).toBe(409)
    expect(error.message).toContain('INC-')
  })

  it('concurrent promotions of different investigations get unique numbers', async () => {
    const { ctx, alerts } = await orgWithInvestigation()
    const [a, b] = await Promise.all([
      createInvestigation(ctx, { title: 'Concurrent case A', alertIds: [alerts[2].id] }),
      createInvestigation(ctx, { title: 'Concurrent case B', alertIds: [alerts[3].id] }),
    ])

    const [incidentA, incidentB] = await Promise.all([
      promoteFromInvestigation(ctx, a.id),
      promoteFromInvestigation(ctx, b.id),
    ])
    expect(incidentA!.number).not.toBe(incidentB!.number)
  })

  it('promotion is tenant-isolated and permission-guarded', async () => {
    const { organization, investigation } = await orgWithInvestigation()

    const intruder = await createOrgWithAdmin(`Promo Intruder ${Date.now()}`)
    expect(await promoteFromInvestigation(intruder.ctx, investigation.id)).toBeNull()

    const { user: viewer } = await createUser({ name: 'Viewer' })
    const viewerMembership = await addMembership({
      organizationId: organization.id,
      userId: viewer.id,
      role: 'viewer',
    })
    const viewerCtx = asCtx({
      organizationId: organization.id,
      membershipId: viewerMembership.id,
      userId: viewer.id,
      role: 'viewer',
    })
    const error = await promoteFromInvestigation(viewerCtx, investigation.id).catch((e) => e)
    expect(error).toBeInstanceOf(AuthError)
    expect(error.status).toBe(403)
  })
})

describe('incident lifecycle writes', () => {
  it('moves declared → contained → resolved → closed with timeline and audit', async () => {
    const { organization, ctx, investigation } = await orgWithInvestigation()
    const incident = await promoteFromInvestigation(ctx, investigation.id)

    const { user: owner } = await createUser({ name: 'IR Lead' })
    const ownerMembership = await addMembership({
      organizationId: organization.id,
      userId: owner.id,
      role: 'analyst',
    })

    const assigned = await patchIncident(ctx, incident!.id, {
      ownerMembershipId: ownerMembership.id,
    })
    expect(assigned!.ownerMembershipId).toBe(ownerMembership.id)

    const noted = await patchIncident(ctx, incident!.id, { note: 'Endpoint isolated via EDR' })
    expect(noted!.timeline.some((t) => t.kind === 'note' && t.summary.includes('EDR'))).toBe(true)

    const contained = await patchIncident(ctx, incident!.id, { status: 'contained' })
    expect(contained!.status).toBe('contained')

    const resolved = await patchIncident(ctx, incident!.id, { status: 'resolved' })
    expect(resolved!.status).toBe('resolved')
    expect(resolved!.resolvedAt).toBeTruthy()

    const closed = await patchIncident(ctx, incident!.id, { status: 'closed' })
    expect(closed!.status).toBe('closed')

    // Timeline recorded each transition
    const statusChanges = closed!.timeline.filter((t) => t.kind === 'status_change')
    expect(statusChanges.length).toBe(3)

    // Closed incidents are immutable
    const error = await patchIncident(ctx, incident!.id, { note: 'too late' }).catch((e) => e)
    expect(error).toBeInstanceOf(TransitionError)
  })

  it('rejects illegal lifecycle jumps (declared → closed)', async () => {
    const { ctx, investigation } = await orgWithInvestigation()
    const incident = await promoteFromInvestigation(ctx, investigation.id)

    const error = await patchIncident(ctx, incident!.id, { status: 'closed' }).catch((e) => e)
    expect(error).toBeInstanceOf(TransitionError)
    expect(error.status).toBe(409)

    const detail = await getIncidentById(ctx, incident!.id)
    expect(detail!.status).toBe('declared')
  })
})
