import { NextResponse } from 'next/server'

import { auditListQuerySchema } from '@domain/entities/audit'
import { problem, withOrgContext } from '@server/api/respond'
import { listAudit } from '@server/services/audit'

export const GET = withOrgContext(
  async ({ request, ctx }) => {
    const parsed = auditListQuerySchema.safeParse(
      Object.fromEntries(request.nextUrl.searchParams.entries()),
    )
    if (!parsed.success) return problem(400, 'Invalid query parameters', parsed.error.issues)

    const page = await listAudit(ctx, parsed.data)
    return NextResponse.json(page)
  },
  { permission: 'admin:audit' },
)
