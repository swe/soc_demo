import { NextResponse } from 'next/server'

import { problem, withSession } from '@server/api/respond'
import {
  createOrganization,
  createOrganizationSchema,
  listUserOrganizations,
} from '@server/services/organizations'

export const GET = withSession(async ({ userId }) => {
  const organizations = await listUserOrganizations(userId)
  return NextResponse.json({ organizations })
})

export const POST = withSession(async ({ request, userId }) => {
  const parsed = createOrganizationSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return problem(400, 'Validation failed', parsed.error.issues)

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null
  const { organization, membership } = await createOrganization({
    userId,
    name: parsed.data.name,
    ip,
  })
  return NextResponse.json(
    { organization: { id: organization.id, name: organization.name, slug: organization.slug }, role: membership.role },
    { status: 201 },
  )
})
