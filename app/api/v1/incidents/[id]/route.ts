import { NextResponse } from 'next/server'

import { problem, withOrgContext } from '@server/api/respond'
import { getIncidentById } from '@server/services/incidents'

export const GET = withOrgContext<{ id: string }>(async ({ ctx, params }) => {
  const incident = await getIncidentById(ctx, params.id)
  if (!incident) return problem(404, 'Incident not found')
  return NextResponse.json(incident)
})
