import { z } from 'zod'

import { ALERT_STATUSES, DISPOSITIONS, SEVERITIES } from '../enums'
import { entityRefSchema, listQuerySchema } from './common'

export const alertSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  severity: z.enum(SEVERITIES),
  status: z.enum(ALERT_STATUSES),
  disposition: z.enum(DISPOSITIONS).nullable(),
  source: z.string(),
  ruleKey: z.string(),
  mitreTechniques: z.array(z.string()),
  entityRefs: z.array(entityRefSchema),
  investigationId: z.string().nullable(),
  detectedAt: z.string(),
})
export type AlertDto = z.infer<typeof alertSchema>

export const alertListQuerySchema = listQuerySchema.extend({
  status: z.enum(ALERT_STATUSES).optional(),
  severity: z.enum(SEVERITIES).optional(),
  q: z.string().trim().min(1).max(200).optional(),
  from: z.iso.datetime().optional(),
  to: z.iso.datetime().optional(),
})
export type AlertListQuery = z.infer<typeof alertListQuerySchema>
