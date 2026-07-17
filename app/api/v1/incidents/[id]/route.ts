import { NextResponse } from 'next/server'

import { incidentPatchSchema } from '@domain/entities/incident'
import { parseJsonBody, problem, withOrgContext } from '@server/api/respond'
import { getIncidentById, patchIncident } from '@server/services/incidents'

export const GET = withOrgContext<{ id: string }>(async ({ ctx, params }) => {
  const incident = await getIncidentById(ctx, params.id)
  if (!incident) return problem(404, 'Incident not found')
  return NextResponse.json(incident)
})

export const PATCH = withOrgContext<{ id: string }>(
  async ({ request, ctx, params }) => {
    const patch = await parseJsonBody(request, incidentPatchSchema)
    const incident = await patchIncident(ctx, params.id, patch)
    if (!incident) return problem(404, 'Incident not found')
    return NextResponse.json(incident)
  },
  { permission: 'incident:write' },
)
