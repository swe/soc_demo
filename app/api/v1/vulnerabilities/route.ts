import { NextResponse } from 'next/server'

import { vulnerabilityListQuerySchema } from '@domain/entities/vulnerability'
import { problem, withOrgContext } from '@server/api/respond'
import { listVulnerabilities } from '@server/services/vulnerabilities'

export const GET = withOrgContext(async ({ request, ctx }) => {
  const parsed = vulnerabilityListQuerySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams.entries()),
  )
  if (!parsed.success) return problem(400, 'Invalid query parameters', parsed.error.issues)

  const page = await listVulnerabilities(ctx, parsed.data)
  return NextResponse.json(page)
})
