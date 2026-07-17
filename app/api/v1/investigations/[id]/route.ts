import { NextResponse } from 'next/server'

import { investigationPatchSchema } from '@domain/entities/investigation'
import { parseJsonBody, problem, withOrgContext } from '@server/api/respond'
import { getInvestigationById, patchInvestigation } from '@server/services/investigations'

export const GET = withOrgContext<{ id: string }>(async ({ ctx, params }) => {
  const investigation = await getInvestigationById(ctx, params.id)
  if (!investigation) return problem(404, 'Investigation not found')
  return NextResponse.json(investigation)
})

export const PATCH = withOrgContext<{ id: string }>(
  async ({ request, ctx, params }) => {
    const patch = await parseJsonBody(request, investigationPatchSchema)
    const investigation = await patchInvestigation(ctx, params.id, patch)
    if (!investigation) return problem(404, 'Investigation not found')
    return NextResponse.json(investigation)
  },
  { permission: 'investigation:write' },
)
