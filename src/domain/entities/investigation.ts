import { z } from 'zod'

import { DISPOSITIONS, INVESTIGATION_STATUSES } from '../enums'
import { alertSchema } from './alert'
import { listQuerySchema } from './common'

export const investigationNoteSchema = z.object({
  at: z.string(),
  membershipId: z.string(),
  text: z.string(),
})
export type InvestigationNoteDto = z.infer<typeof investigationNoteSchema>

export const investigationSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.enum(INVESTIGATION_STATUSES),
  hypothesis: z.string().nullable(),
  assigneeMembershipId: z.string().nullable(),
  disposition: z.enum(DISPOSITIONS).nullable(),
  createdFromAlertId: z.string().nullable(),
  createdBy: z.string().nullable(),
  closedAt: z.string().nullable(),
  createdAt: z.string(),
})
export type InvestigationDto = z.infer<typeof investigationSchema>

export const investigationDetailSchema = investigationSchema.extend({
  notes: z.array(investigationNoteSchema),
  alerts: z.array(alertSchema),
})
export type InvestigationDetailDto = z.infer<typeof investigationDetailSchema>

export const investigationListQuerySchema = listQuerySchema.extend({
  status: z.enum(INVESTIGATION_STATUSES).optional(),
})
export type InvestigationListQuery = z.infer<typeof investigationListQuerySchema>

export const createInvestigationSchema = z.object({
  title: z.string().trim().min(3).max(300),
  hypothesis: z.string().trim().max(2000).optional(),
  alertIds: z.array(z.string().min(1)).max(50).default([]),
})
export type CreateInvestigation = z.infer<typeof createInvestigationSchema>

/** Body for POST /v1/alerts/:id/create-investigation (title defaults to the alert's). */
export const createInvestigationFromAlertSchema = z.object({
  title: z.string().trim().min(3).max(300).optional(),
  hypothesis: z.string().trim().max(2000).optional(),
})
export type CreateInvestigationFromAlert = z.infer<typeof createInvestigationFromAlertSchema>

/**
 * PATCH /v1/investigations/:id. Lifecycle from domain/transitions; closing
 * requires a disposition in the same request.
 */
export const investigationPatchSchema = z
  .object({
    status: z.enum(INVESTIGATION_STATUSES).optional(),
    hypothesis: z.string().trim().max(2000).nullable().optional(),
    assigneeMembershipId: z.string().min(1).nullable().optional(),
    disposition: z.enum(DISPOSITIONS).optional(),
    note: z.string().trim().min(1).max(2000).optional(),
  })
  .refine((v) => Object.values(v).some((field) => field !== undefined), {
    message: 'Patch must contain at least one field',
  })
  .refine((v) => v.status !== 'closed' || Boolean(v.disposition), {
    message: 'Closing an investigation requires a disposition',
    path: ['disposition'],
  })
export type InvestigationPatch = z.infer<typeof investigationPatchSchema>
