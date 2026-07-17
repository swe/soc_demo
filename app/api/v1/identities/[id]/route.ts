import { NextResponse } from 'next/server'

import { problem, withOrgContext } from '@server/api/respond'
import { getIdentityById } from '@server/services/identities'

export const GET = withOrgContext<{ id: string }>(async ({ ctx, params }) => {
  const identity = await getIdentityById(ctx, params.id)
  if (!identity) return problem(404, 'Identity not found')
  return NextResponse.json(identity)
})
