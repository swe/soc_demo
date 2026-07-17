import { NextResponse } from 'next/server'

import { alertPatchSchema } from '@domain/entities/alert'
import { parseJsonBody, problem, withOrgContext } from '@server/api/respond'
import { getAlertDetail, patchAlert } from '@server/services/alerts'

export const GET = withOrgContext<{ id: string }>(async ({ ctx, params }) => {
  const alert = await getAlertDetail(ctx, params.id)
  if (!alert) return problem(404, 'Alert not found')
  return NextResponse.json(alert)
})

export const PATCH = withOrgContext<{ id: string }>(
  async ({ request, ctx, params }) => {
    const patch = await parseJsonBody(request, alertPatchSchema)
    const alert = await patchAlert(ctx, params.id, patch)
    if (!alert) return problem(404, 'Alert not found')
    return NextResponse.json(alert)
  },
  { permission: 'alert:triage' },
)
