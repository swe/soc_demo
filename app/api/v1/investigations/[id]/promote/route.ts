import { NextResponse } from 'next/server'

import { problem, withOrgContext } from '@server/api/respond'
import { promoteFromInvestigation } from '@server/services/incidents'

/** Investigation → incident. Allocates INC-<n>; never auto-closes the investigation. */
export const POST = withOrgContext<{ id: string }>(
  async ({ ctx, params }) => {
    const incident = await promoteFromInvestigation(ctx, params.id)
    if (!incident) return problem(404, 'Investigation not found')
    return NextResponse.json(incident, { status: 201 })
  },
  { permission: 'incident:write' },
)
