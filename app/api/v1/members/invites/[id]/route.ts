import { NextResponse } from 'next/server'

import { problem, withOrgContext } from '@server/api/respond'
import { revokeInvite } from '@server/services/members'

/** Revoke a pending invite. */
export const DELETE = withOrgContext<{ id: string }>(
  async ({ ctx, params }) => {
    const invite = await revokeInvite(ctx, params.id)
    if (!invite) return problem(404, 'Invite not found')
    return NextResponse.json(invite)
  },
  { permission: 'admin:members' },
)
