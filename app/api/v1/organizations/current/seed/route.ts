import { NextResponse } from 'next/server'

import { withOrgContext } from '@server/api/respond'
import { seedDemoTenant } from '@server/services/seed'

export const POST = withOrgContext(
  async ({ ctx }) => {
    const summary = await seedDemoTenant(ctx)
    return NextResponse.json({ seeded: true, summary })
  },
  { permission: 'admin:seed' },
)
