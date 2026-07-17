import { NextResponse } from 'next/server'

import { problem, withOrgContext } from '@server/api/respond'
import { getAlertById } from '@server/services/alerts'

export const GET = withOrgContext<{ id: string }>(async ({ ctx, params }) => {
  const alert = await getAlertById(ctx, params.id)
  if (!alert) return problem(404, 'Alert not found')
  return NextResponse.json(alert)
})
