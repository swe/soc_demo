import { NextResponse } from 'next/server'

import { problem, withOrgContext } from '@server/api/respond'
import { getVulnerabilityById } from '@server/services/vulnerabilities'

export const GET = withOrgContext<{ id: string }>(async ({ ctx, params }) => {
  const vulnerability = await getVulnerabilityById(ctx, params.id)
  if (!vulnerability) return problem(404, 'Vulnerability not found')
  return NextResponse.json(vulnerability)
})
