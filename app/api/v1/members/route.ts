import { NextResponse } from 'next/server'

import { withOrgContext } from '@server/api/respond'
import { listMembers } from '@server/services/members'

export const GET = withOrgContext(async ({ ctx }) => {
  const members = await listMembers(ctx)
  return NextResponse.json({ items: members })
})
