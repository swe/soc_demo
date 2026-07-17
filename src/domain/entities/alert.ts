import { z } from 'zod'

import { ALERT_STATUSES, DISPOSITIONS, SEVERITIES } from '../enums'
import { auditEntrySchema } from './audit'
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
  assignedMembershipId: z.string().nullable(),
  analystNote: z.string().nullable(),
  triagedAt: z.string().nullable(),
  resolvedAt: z.string().nullable(),
  dismissedReason: z.string().nullable(),
  detectedAt: z.string(),
})
export type AlertDto = z.infer<typeof alertSchema>

/** Detail view: the alert plus its recent audit history (analyst-visible). */
export const alertDetailSchema = alertSchema.extend({
  history: z.array(auditEntrySchema),
})
export type AlertDetailDto = z.infer<typeof alertDetailSchema>

export const alertListQuerySchema = listQuerySchema.extend({
  status: z.enum(ALERT_STATUSES).optional(),
  severity: z.enum(SEVERITIES).optional(),
  q: z.string().trim().min(1).max(200).optional(),
  from: z.iso.datetime().optional(),
  to: z.iso.datetime().optional(),
})
export type AlertListQuery = z.infer<typeof alertListQuerySchema>

/**
 * PATCH /v1/alerts/:id body. Any combination of triage actions; the service
 * enforces lifecycle rules from domain/transitions and terminal immutability.
 */
export const alertPatchSchema = z
  .object({
    status: z.enum(ALERT_STATUSES).optional(),
    dismissedReason: z.string().trim().min(3).max(500).optional(),
    disposition: z.enum(DISPOSITIONS).optional(),
    severity: z.enum(SEVERITIES).optional(),
    assignedMembershipId: z.string().min(1).nullable().optional(),
    analystNote: z.string().trim().max(2000).nullable().optional(),
  })
  .refine((v) => Object.values(v).some((field) => field !== undefined), {
    message: 'Patch must contain at least one field',
  })
  .refine((v) => v.status !== 'dismissed' || Boolean(v.dismissedReason), {
    message: 'Dismissing an alert requires a reason',
    path: ['dismissedReason'],
  })
  .refine((v) => v.dismissedReason === undefined || v.status === 'dismissed', {
    message: 'dismissedReason is only valid when dismissing',
    path: ['dismissedReason'],
  })
export type AlertPatch = z.infer<typeof alertPatchSchema>
