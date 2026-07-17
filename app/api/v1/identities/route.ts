import { NextResponse } from 'next/server'

import { identityListQuerySchema } from '@domain/entities/identity'
import { problem, withOrgContext } from '@server/api/respond'
import { listIdentities } from '@server/services/identities'

export const GET = withOrgContext(async ({ request, ctx }) => {
  const parsed = identityListQuerySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams.entries()),
  )
  if (!parsed.success) return problem(400, 'Invalid query parameters', parsed.error.issues)

  const page = await listIdentities(ctx, parsed.data)
  return NextResponse.json(page)
})
