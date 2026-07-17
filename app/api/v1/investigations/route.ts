import { NextResponse } from 'next/server'

import {
  createInvestigationSchema,
  investigationListQuerySchema,
} from '@domain/entities/investigation'
import { parseJsonBody, problem, withOrgContext } from '@server/api/respond'
import { createInvestigation, listInvestigations } from '@server/services/investigations'

export const GET = withOrgContext(async ({ request, ctx }) => {
  const parsed = investigationListQuerySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams.entries()),
  )
  if (!parsed.success) return problem(400, 'Invalid query parameters', parsed.error.issues)

  const page = await listInvestigations(ctx, parsed.data)
  return NextResponse.json(page)
})

export const POST = withOrgContext(
  async ({ request, ctx }) => {
    const input = await parseJsonBody(request, createInvestigationSchema)
    const investigation = await createInvestigation(ctx, input)
    return NextResponse.json(investigation, { status: 201 })
  },
  { permission: 'investigation:write' },
)
