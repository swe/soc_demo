import { NextResponse } from 'next/server'

import { assetListQuerySchema } from '@domain/entities/asset'
import { problem, withOrgContext } from '@server/api/respond'
import { listAssets } from '@server/services/assets'

export const GET = withOrgContext(async ({ request, ctx }) => {
  const parsed = assetListQuerySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams.entries()),
  )
  if (!parsed.success) return problem(400, 'Invalid query parameters', parsed.error.issues)

  const page = await listAssets(ctx, parsed.data)
  return NextResponse.json(page)
})
