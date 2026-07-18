import { demoDataEnabled } from '../../env'
import { requirePermission, type OrgContext } from '../auth/types'
import { db } from '../db/client'
import { seedMeridian, type SeedSummary } from '../seed/meridian'
import { writeAudit } from './audit'
import { ServiceError } from './errors'

/** Load the Meridian Financial demo dataset into the caller's organization. */
export async function seedDemoTenant(ctx: OrgContext): Promise<SeedSummary> {
  requirePermission(ctx, 'admin:seed')
  if (!demoDataEnabled) {
    throw new ServiceError('Demo data is disabled on this deployment (ENABLE_DEMO_DATA=false)', 403)
  }

  const startedAt = Date.now()
  const summary = await seedMeridian(db, ctx.organizationId)

  await writeAudit(ctx, {
    action: 'org.seed',
    targetType: 'organization',
    targetId: ctx.organizationId,
    metadata: { ...summary, durationMs: Date.now() - startedAt },
  })

  return summary
}
