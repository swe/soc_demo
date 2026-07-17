import { desc, eq, and } from 'drizzle-orm'
import { describe, expect, it } from 'vitest'

import { alertPatchSchema } from '@domain/entities/alert'
import { TransitionError } from '@domain/transitions'
import { AuthError } from '@server/auth/types'
import { db } from '@server/db/client'
import { auditLogs } from '@server/db/schema'
import { getAlertDetail, listAlerts, patchAlert } from '@server/services/alerts'
import { ServiceError } from '@server/services/errors'
import { addMembership, asCtx, createOrgWithAdmin, createUser, seedOrg } from '../helpers/fixtures'

const ANCHOR = new Date('2026-07-01T12:00:00.000Z')

async function orgWithAlert() {
  const { organization, ctx } = await createOrgWithAdmin(`Alert Write Org ${Date.now()}`)
  await seedOrg(organization.id, ANCHOR)
  const page = await listAlerts(ctx, { limit: 5, status: 'new' })
  expect(page.items.length).toBeGreaterThan(0)
  return { organization, ctx, alert: page.items[0] }
}

async function auditActions(organizationId: string, targetId: string) {
  const rows = await db
    .select({ action: auditLogs.action })
    .from(auditLogs)
    .where(and(eq(auditLogs.organizationId, organizationId), eq(auditLogs.targetId, targetId)))
    .orderBy(desc(auditLogs.createdAt))
  return rows.map((r) => r.action)
}

describe('alert patch validation', () => {
  it('rejects empty patches and dismissal without a reason', () => {
    expect(alertPatchSchema.safeParse({}).success).toBe(false)
    expect(alertPatchSchema.safeParse({ status: 'dismissed' }).success).toBe(false)
    expect(alertPatchSchema.safeParse({ dismissedReason: 'not dismissing' }).success).toBe(false)
    expect(
      alertPatchSchema.safeParse({ status: 'dismissed', dismissedReason: 'duplicate of INC-7' })
        .success,
    ).toBe(true)
  })
})

describe('alert triage workflow', () => {
  it('triages then resolves, setting lifecycle timestamps and audit records', async () => {
    const { organization, ctx, alert } = await orgWithAlert()

    const triaged = await patchAlert(ctx, alert.id, { status: 'triaged' })
    expect(triaged?.status).toBe('triaged')
    expect(triaged?.triagedAt).toBeTruthy()

    const resolved = await patchAlert(ctx, alert.id, { status: 'resolved' })
    expect(resolved?.status).toBe('resolved')
    expect(resolved?.resolvedAt).toBeTruthy()

    const actions = await auditActions(organization.id, alert.id)
    expect(actions).toContain('alert.triage')
    expect(actions).toContain('alert.resolve')
  })

  it('dismiss stores the reason; terminal alerts accept only a disposition', async () => {
    const { ctx, alert } = await orgWithAlert()

    const dismissed = await patchAlert(ctx, alert.id, {
      status: 'dismissed',
      dismissedReason: 'Known-good admin activity',
    })
    expect(dismissed?.status).toBe('dismissed')
    expect(dismissed?.dismissedReason).toBe('Known-good admin activity')

    await expect(patchAlert(ctx, alert.id, { severity: 'low' })).rejects.toThrow(TransitionError)
    await expect(patchAlert(ctx, alert.id, { status: 'triaged' })).rejects.toThrow(TransitionError)

    const withDisposition = await patchAlert(ctx, alert.id, { disposition: 'benign' })
    expect(withDisposition?.disposition).toBe('benign')
  })

  it('rejects illegal transitions with TransitionError (409)', async () => {
    const { ctx, alert } = await orgWithAlert()
    await patchAlert(ctx, alert.id, { status: 'resolved' })

    const error = await patchAlert(ctx, alert.id, { status: 'new' }).catch((e) => e)
    expect(error).toBeInstanceOf(TransitionError)
    expect(error.status).toBe(409)
  })

  it('assigns an active org member and rejects foreign memberships', async () => {
    const { organization, ctx, alert } = await orgWithAlert()

    const { user: analyst } = await createUser({ name: 'Second Analyst' })
    const membership = await addMembership({
      organizationId: organization.id,
      userId: analyst.id,
      role: 'analyst',
    })

    const assigned = await patchAlert(ctx, alert.id, { assignedMembershipId: membership.id })
    expect(assigned?.assignedMembershipId).toBe(membership.id)

    // Membership from another organization must be rejected.
    const other = await createOrgWithAdmin(`Other Org ${Date.now()}`)
    await expect(
      patchAlert(ctx, alert.id, { assignedMembershipId: other.membership.id }),
    ).rejects.toThrow(ServiceError)

    const unassigned = await patchAlert(ctx, alert.id, { assignedMembershipId: null })
    expect(unassigned?.assignedMembershipId).toBeNull()
  })

  it('severity change and analyst note are persisted and audited', async () => {
    const { organization, ctx, alert } = await orgWithAlert()

    const patched = await patchAlert(ctx, alert.id, {
      severity: 'critical',
      analystNote: 'Correlated with VPN CVE campaign',
    })
    expect(patched?.severity).toBe('critical')
    expect(patched?.analystNote).toBe('Correlated with VPN CVE campaign')

    const actions = await auditActions(organization.id, alert.id)
    expect(actions).toContain('alert.severity_change')
    expect(actions).toContain('alert.note')
  })

  it('detail view exposes the audit history for the alert', async () => {
    const { ctx, alert } = await orgWithAlert()
    await patchAlert(ctx, alert.id, { status: 'triaged' })

    const detail = await getAlertDetail(ctx, alert.id)
    expect(detail).not.toBeNull()
    expect(detail!.history.length).toBeGreaterThan(0)
    expect(detail!.history[0].action).toBe('alert.triage')
  })
})

describe('alert triage authorization and tenancy', () => {
  it('viewer role cannot triage (403 AuthError)', async () => {
    const { organization, ctx, alert } = await orgWithAlert()

    const { user: viewer } = await createUser({ name: 'Read Only' })
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

    const error = await patchAlert(viewerCtx, alert.id, { status: 'triaged' }).catch((e) => e)
    expect(error).toBeInstanceOf(AuthError)
    expect(error.status).toBe(403)
    // Alert unchanged for everyone else
    const detail = await getAlertDetail(ctx, alert.id)
    expect(detail!.status).toBe('new')
  })

  it('cannot patch an alert belonging to another organization (returns null)', async () => {
    const { alert } = await orgWithAlert()
    const intruder = await createOrgWithAdmin(`Intruder Org ${Date.now()}`)

    const result = await patchAlert(intruder.ctx, alert.id, { status: 'triaged' })
    expect(result).toBeNull()
  })
})
