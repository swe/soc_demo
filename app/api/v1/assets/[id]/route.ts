import { NextResponse } from 'next/server'

import { problem, withOrgContext } from '@server/api/respond'
import { getAssetById } from '@server/services/assets'

export const GET = withOrgContext<{ id: string }>(async ({ ctx, params }) => {
  const asset = await getAssetById(ctx, params.id)
  if (!asset) return problem(404, 'Asset not found')
  return NextResponse.json(asset)
})
