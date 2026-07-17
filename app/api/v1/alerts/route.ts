import { NextResponse } from 'next/server'

import { alertListQuerySchema } from '@domain/entities/alert'
import { problem, withOrgContext } from '@server/api/respond'
import { listAlerts } from '@server/services/alerts'

export const GET = withOrgContext(async ({ request, ctx }) => {
  const parsed = alertListQuerySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams.entries()),
  )
  if (!parsed.success) return problem(400, 'Invalid query parameters', parsed.error.issues)

  const page = await listAlerts(ctx, parsed.data)
  return NextResponse.json(page)
})
