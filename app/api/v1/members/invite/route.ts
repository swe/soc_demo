import { NextResponse } from 'next/server'

import { inviteCreateSchema } from '@domain/entities/member'
import { parseJsonBody, withOrgContext } from '@server/api/respond'
import { createInvite } from '@server/services/members'

/** Admin-only. Returns the invite plus the one-time accept URL (no email in M2). */
export const POST = withOrgContext(
  async ({ request, ctx }) => {
    const input = await parseJsonBody(request, inviteCreateSchema)
    const result = await createInvite(ctx, input)
    return NextResponse.json(result, { status: 201 })
  },
  { permission: 'admin:members' },
)
