import { NextResponse } from 'next/server'

import { withOrgContext } from '@server/api/respond'
import { listInvites } from '@server/services/members'

export const GET = withOrgContext(
  async ({ ctx }) => {
    const invites = await listInvites(ctx)
    return NextResponse.json({ items: invites })
  },
  { permission: 'admin:members' },
)
