import { describe, expect, it } from 'vitest'

import { AuthError } from '@server/auth/types'
import { ServiceError } from '@server/services/errors'
import {
  acceptInvite,
  createInvite,
  listInvites,
  listMembers,
  patchMember,
  revokeInvite,
} from '@server/services/members'
import { addMembership, asCtx, createOrgWithAdmin, createUser, uniqueEmail } from '../helpers/fixtures'

function tokenFrom(acceptUrl: string): string {
  return new URL(acceptUrl).searchParams.get('token')!
}

describe('member invites', () => {
  it('invite → accept creates an active membership with the invited role', async () => {
    const { organization, ctx } = await createOrgWithAdmin(`Members Org ${Date.now()}`)
    const email = uniqueEmail('invitee')

    const { invite, acceptUrl } = await createInvite(ctx, { email, role: 'analyst' })
    expect(invite.email).toBe(email.toLowerCase())
    expect(acceptUrl).toContain('/accept-invite?token=')

    const { user: invitee } = await createUser({ email })
    const result = await acceptInvite(invitee.id, tokenFrom(acceptUrl))
    expect(result.organizationId).toBe(organization.id)

    const members = await listMembers(ctx)
    const added = members.find((m) => m.email === email)
    expect(added).toBeDefined()
    expect(added!.role).toBe('analyst')
    expect(added!.status).toBe('active')

    const invites = await listInvites(ctx)
    expect(invites.find((i) => i.id === invite.id)!.acceptedAt).toBeTruthy()
  })

  it('accept is single-use, email-bound, and revocable', async () => {
    const { ctx } = await createOrgWithAdmin(`Invite Guard Org ${Date.now()}`)
    const email = uniqueEmail('guarded')

    const { acceptUrl } = await createInvite(ctx, { email, role: 'viewer' })
    const token = tokenFrom(acceptUrl)

    // Wrong account cannot use the link
    const { user: stranger } = await createUser()
    const wrongEmail = await acceptInvite(stranger.id, token).catch((e) => e)
    expect(wrongEmail).toBeInstanceOf(ServiceError)
    expect(wrongEmail.status).toBe(403)

    // Right account: works once, then 410
    const { user: invitee } = await createUser({ email })
    await acceptInvite(invitee.id, token)
    const reuse = await acceptInvite(invitee.id, token).catch((e) => e)
    expect(reuse).toBeInstanceOf(ServiceError)
    expect(reuse.status).toBe(410)

    // Revoked invites cannot be accepted
    const second = await createInvite(ctx, { email: uniqueEmail('revoked'), role: 'viewer' })
    await revokeInvite(ctx, second.invite.id)
    const { user: other } = await createUser({ email: second.invite.email })
    const revoked = await acceptInvite(other.id, tokenFrom(second.acceptUrl)).catch((e) => e)
    expect(revoked).toBeInstanceOf(ServiceError)
    expect(revoked.status).toBe(410)
  })

  it('rejects duplicate live invites and invites for existing members', async () => {
    const { ctx, user } = await createOrgWithAdmin(`Dup Invite Org ${Date.now()}`)
    const email = uniqueEmail('dup')

    await createInvite(ctx, { email, role: 'viewer' })
    const dup = await createInvite(ctx, { email, role: 'analyst' }).catch((e) => e)
    expect(dup).toBeInstanceOf(ServiceError)
    expect(dup.status).toBe(409)

    const existing = await createInvite(ctx, { email: user.email, role: 'viewer' }).catch((e) => e)
    expect(existing).toBeInstanceOf(ServiceError)
    expect(existing.status).toBe(409)
  })
})

describe('member management', () => {
  it('changes roles and suspends/reactivates with audit-backed guards', async () => {
    const { organization, ctx } = await createOrgWithAdmin(`Manage Org ${Date.now()}`)

    const { user: analyst } = await createUser({ name: 'To Manage' })
    const membership = await addMembership({
      organizationId: organization.id,
      userId: analyst.id,
      role: 'analyst',
    })

    const promoted = await patchMember(ctx, membership.id, { role: 'engineer' })
    expect(promoted!.role).toBe('engineer')

    const suspended = await patchMember(ctx, membership.id, { status: 'suspended' })
    expect(suspended!.status).toBe('suspended')

    const reactivated = await patchMember(ctx, membership.id, { status: 'active' })
    expect(reactivated!.status).toBe('active')
  })

  it('refuses to demote or suspend the last active admin', async () => {
    const { ctx } = await createOrgWithAdmin(`Last Admin Org ${Date.now()}`)

    const demote = await patchMember(ctx, ctx.membershipId, { role: 'viewer' }).catch((e) => e)
    expect(demote).toBeInstanceOf(ServiceError)
    expect(demote.status).toBe(409)

    const suspend = await patchMember(ctx, ctx.membershipId, { status: 'suspended' }).catch((e) => e)
    expect(suspend).toBeInstanceOf(ServiceError)
  })

  it('member mutations are admin-only and tenant-isolated', async () => {
    const { organization } = await createOrgWithAdmin(`Member Auth Org ${Date.now()}`)

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

    const inviteError = await createInvite(analystCtx, {
      email: uniqueEmail(),
      role: 'viewer',
    }).catch((e) => e)
    expect(inviteError).toBeInstanceOf(AuthError)
    expect(inviteError.status).toBe(403)

    const patchError = await patchMember(analystCtx, analystMembership.id, {
      role: 'admin',
    }).catch((e) => e)
    expect(patchError).toBeInstanceOf(AuthError)

    // Cross-tenant patch resolves to null (not found in scope)
    const other = await createOrgWithAdmin(`Member Intruder ${Date.now()}`)
    expect(await patchMember(other.ctx, analystMembership.id, { role: 'viewer' })).toBeNull()
  })
})
