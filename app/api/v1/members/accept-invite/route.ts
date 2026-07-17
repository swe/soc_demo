import { NextResponse } from 'next/server'

import { acceptInviteSchema } from '@domain/entities/member'
import { parseJsonBody, withSession } from '@server/api/respond'
import { setActiveOrganization } from '@server/auth/types'
import { acceptInvite } from '@server/services/members'

/**
 * Accept an invite link. Session-only (no OrgContext — the user has no
 * membership in the target org until this succeeds). The invite must match
 * the signed-in account's email.
 */
export const POST = withSession(async ({ request, userId }) => {
  const { token } = await parseJsonBody(request, acceptInviteSchema)
  const result = await acceptInvite(userId, token)
  await setActiveOrganization(userId, result.organizationId)
  return NextResponse.json(result, { status: 201 })
})
