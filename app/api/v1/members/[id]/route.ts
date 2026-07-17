import { NextResponse } from 'next/server'

import { memberPatchSchema } from '@domain/entities/member'
import { parseJsonBody, problem, withOrgContext } from '@server/api/respond'
import { patchMember } from '@server/services/members'

export const PATCH = withOrgContext<{ id: string }>(
  async ({ request, ctx, params }) => {
    const patch = await parseJsonBody(request, memberPatchSchema)
    const member = await patchMember(ctx, params.id, patch)
    if (!member) return problem(404, 'Member not found')
    return NextResponse.json(member)
  },
  { permission: 'admin:members' },
)
