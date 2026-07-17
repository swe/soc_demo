import { NextResponse } from 'next/server'

import { withOrgContext } from '@server/api/respond'
import { getOverview } from '@server/services/overview'

export const GET = withOrgContext(async ({ ctx }) => {
  const overview = await getOverview(ctx)
  return NextResponse.json(overview)
})
