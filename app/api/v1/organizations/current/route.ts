import { NextResponse } from 'next/server'
import { z } from 'zod'

import { problem, withOrgContext, withSession } from '@server/api/respond'
import { db } from '@server/db/client'
import { organizations } from '@server/db/schema'
import { switchOrganization } from '@server/services/organizations'
import { eq } from 'drizzle-orm'

export const GET = withOrgContext(async ({ ctx }) => {
  const [org] = await db
    .select({ id: organizations.id, name: organizations.name, slug: organizations.slug })
    .from(organizations)
    .where(eq(organizations.id, ctx.organizationId))
    .limit(1)
  return NextResponse.json({ organization: org, role: ctx.role })
})

const switchSchema = z.object({ organizationId: z.string().min(1) })

export const PUT = withSession(async ({ request, userId }) => {
  const parsed = switchSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return problem(400, 'Validation failed', parsed.error.issues)

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null
  await switchOrganization({ userId, organizationId: parsed.data.organizationId, ip })
  return NextResponse.json({ ok: true })
})
