import { NextResponse } from 'next/server'

import { incidentListQuerySchema } from '@domain/entities/incident'
import { problem, withOrgContext } from '@server/api/respond'
import { listIncidents } from '@server/services/incidents'

export const GET = withOrgContext(async ({ request, ctx }) => {
  const parsed = incidentListQuerySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams.entries()),
  )
  if (!parsed.success) return problem(400, 'Invalid query parameters', parsed.error.issues)

  const page = await listIncidents(ctx, parsed.data)
  return NextResponse.json(page)
})
