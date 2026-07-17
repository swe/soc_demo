import { NextResponse } from 'next/server'

import { createInvestigationFromAlertSchema } from '@domain/entities/investigation'
import { parseJsonBody, problem, withOrgContext } from '@server/api/respond'
import { getAlertById } from '@server/services/alerts'
import { createInvestigation } from '@server/services/investigations'

/** Alert → investigation: links the alert, records provenance, triages if new. */
export const POST = withOrgContext<{ id: string }>(
  async ({ request, ctx, params }) => {
    const alert = await getAlertById(ctx, params.id)
    if (!alert) return problem(404, 'Alert not found')

    const input = await parseJsonBody(request, createInvestigationFromAlertSchema)
    const investigation = await createInvestigation(ctx, {
      title: input.title ?? `Investigate: ${alert.title}`,
      hypothesis: input.hypothesis,
      alertIds: [],
      createdFromAlertId: alert.id,
    })
    return NextResponse.json(investigation, { status: 201 })
  },
  { permission: 'investigation:write' },
)
