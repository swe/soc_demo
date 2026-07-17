import { describe, expect, it } from 'vitest'

import { createInvestigationSchema, investigationPatchSchema } from '@domain/entities/investigation'
import { TransitionError } from '@domain/transitions'
import { AuthError } from '@server/auth/types'
import { getAlertDetail, listAlerts } from '@server/services/alerts'
import { ServiceError } from '@server/services/errors'
import {
  createInvestigation,
  getInvestigationById,
  listInvestigations,
  patchInvestigation,
} from '@server/services/investigations'
import { addMembership, asCtx, createOrgWithAdmin, createUser, seedOrg } from '../helpers/fixtures'

const ANCHOR = new Date('2026-07-01T12:00:00.000Z')

async function orgWithAlerts() {
  const { organization, ctx } = await createOrgWithAdmin(`Investigation Org ${Date.now()}`)
  await seedOrg(organization.id, ANCHOR)
  const page = await listAlerts(ctx, { limit: 10, status: 'new' })
  const unlinked = page.items.filter((a) => !a.investigationId)
  expect(unlinked.length).toBeGreaterThanOrEqual(2)
  return { organization, ctx, alerts: unlinked }
}

describe('investigation schemas', () => {
  it('validates creation and patch bodies', () => {
    expect(createInvestigationSchema.safeParse({ title: 'x' }).success).toBe(false)
    expect(createInvestigationSchema.safeParse({ title: 'Lateral movement hunt' }).success).toBe(true)
    expect(investigationPatchSchema.safeParse({}).success).toBe(false)
    expect(investigationPatchSchema.safeParse({ status: 'closed' }).success).toBe(false)
    expect(
      investigationPatchSchema.safeParse({ status: 'closed', disposition: 'benign' }).success,
    ).toBe(true)
  })
})

describe('investigation workflow', () => {
  it('creates from alerts, links them, and triages new alerts', async () => {
    const { ctx, alerts } = await orgWithAlerts()
    const [a1, a2] = alerts

    const created = await createInvestigation(ctx, {
      title: 'Phishing chain follow-up',
      hypothesis: 'Same actor as INC-1',
      alertIds: [a1.id, a2.id],
    })

    expect(created.status).toBe('open')
    expect(created.alerts.map((a) => a.id).sort()).toEqual([a1.id, a2.id].sort())
    // Linking triaged the previously-new alerts
    expect(created.alerts.every((a) => a.status === 'triaged')).toBe(true)

    const alertDetail = await getAlertDetail(ctx, a1.id)
    expect(alertDetail!.investigationId).toBe(created.id)
    expect(alertDetail!.history.some((h) => h.action === 'alert.link_investigation')).toBe(true)
  })

  it('records provenance for alert-initiated investigations', async () => {
    const { ctx, alerts } = await orgWithAlerts()
    const source = alerts[0]

    const created = await createInvestigation(ctx, {
      title: `Investigate: ${source.title}`,
      alertIds: [],
      createdFromAlertId: source.id,
    })
    expect(created.createdFromAlertId).toBe(source.id)
    expect(created.alerts.map((a) => a.id)).toEqual([source.id])
  })

  it('refuses to link an alert that already belongs to an investigation', async () => {
    const { ctx, alerts } = await orgWithAlerts()
    const [a1] = alerts
    await createInvestigation(ctx, { title: 'First case', alertIds: [a1.id] })

    const error = await createInvestigation(ctx, { title: 'Second case', alertIds: [a1.id] }).catch(
      (e) => e,
    )
    expect(error).toBeInstanceOf(ServiceError)
    expect(error.status).toBe(409)
  })

  it('assigns, moves through the lifecycle, and closes with a disposition', async () => {
    const { organization, ctx, alerts } = await orgWithAlerts()
    const created = await createInvestigation(ctx, { title: 'Spray review', alertIds: [alerts[0].id] })

    const { user: analyst } = await createUser({ name: 'Case Owner' })
    const membership = await addMembership({
      organizationId: organization.id,
      userId: analyst.id,
      role: 'analyst',
    })

    const assigned = await patchInvestigation(ctx, created.id, {
      assigneeMembershipId: membership.id,
    })
    expect(assigned?.assigneeMembershipId).toBe(membership.id)

    const active = await patchInvestigation(ctx, created.id, { status: 'active' })
    expect(active?.status).toBe('active')

    const noted = await patchInvestigation(ctx, created.id, { note: 'Confirmed benign change window' })
    expect(noted).not.toBeNull()
    const withNote = await getInvestigationById(ctx, created.id)
    expect(withNote!.notes.length).toBe(1)
    expect(withNote!.notes[0].membershipId).toBe(ctx.membershipId)

    const closed = await patchInvestigation(ctx, created.id, {
      status: 'closed',
      disposition: 'benign',
    })
    expect(closed?.status).toBe('closed')
    expect(closed?.disposition).toBe('benign')
    expect(closed?.closedAt).toBeTruthy()

    // Closed investigations are immutable
    const error = await patchInvestigation(ctx, created.id, { note: 'late note' }).catch((e) => e)
    expect(error).toBeInstanceOf(TransitionError)
    expect(error.status).toBe(409)
  })

  it('rejects illegal lifecycle moves', async () => {
    const { ctx, alerts } = await orgWithAlerts()
    const created = await createInvestigation(ctx, { title: 'Lifecycle check', alertIds: [alerts[0].id] })
    await patchInvestigation(ctx, created.id, { status: 'closed', disposition: 'inconclusive' })

    const error = await patchInvestigation(ctx, created.id, { status: 'active' }).catch((e) => e)
    expect(error).toBeInstanceOf(TransitionError)
  })

  it('lists investigations newest-first with status filter', async () => {
    const { ctx, alerts } = await orgWithAlerts()
    await createInvestigation(ctx, { title: 'Case A', alertIds: [alerts[0].id] })
    const b = await createInvestigation(ctx, { title: 'Case B', alertIds: [alerts[1].id] })
    await patchInvestigation(ctx, b.id, { status: 'closed', disposition: 'malicious' })

    // Seed data also contains investigations; ours must be present and filtered correctly.
    const open = await listInvestigations(ctx, { limit: 50, status: 'open' })
    expect(open.items.some((i) => i.title === 'Case A')).toBe(true)
    expect(open.items.every((i) => i.status === 'open')).toBe(true)

    const closed = await listInvestigations(ctx, { limit: 50, status: 'closed' })
    expect(closed.items.some((i) => i.id === b.id)).toBe(true)
  })
})

describe('investigation authorization and tenancy', () => {
  it('viewer cannot create or patch (403)', async () => {
    const { organization, ctx, alerts } = await orgWithAlerts()
    const created = await createInvestigation(ctx, { title: 'Guarded case', alertIds: [alerts[0].id] })

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

    const createError = await createInvestigation(viewerCtx, { title: 'Nope', alertIds: [] }).catch(
      (e) => e,
    )
    expect(createError).toBeInstanceOf(AuthError)

    const patchError = await patchInvestigation(viewerCtx, created.id, { status: 'active' }).catch(
      (e) => e,
    )
    expect(patchError).toBeInstanceOf(AuthError)
  })

  it('cannot read, patch, or link across tenants', async () => {
    const { ctx, alerts } = await orgWithAlerts()
    const created = await createInvestigation(ctx, { title: 'Tenant case', alertIds: [alerts[0].id] })

    const intruder = await createOrgWithAdmin(`Intruder ${Date.now()}`)
    expect(await getInvestigationById(intruder.ctx, created.id)).toBeNull()
    expect(await patchInvestigation(intruder.ctx, created.id, { status: 'active' })).toBeNull()

    // Linking a foreign alert into your own investigation is a 404
    const error = await createInvestigation(intruder.ctx, {
      title: 'Steal alerts',
      alertIds: [alerts[1].id],
    }).catch((e) => e)
    expect(error).toBeInstanceOf(ServiceError)
    expect(error.status).toBe(404)
  })
})
