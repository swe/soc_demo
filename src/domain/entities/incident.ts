import { z } from 'zod'

import { INCIDENT_STATUSES, SEVERITIES } from '../enums'
import { listQuerySchema } from './common'

export const incidentTimelineEntrySchema = z.object({
  at: z.string(),
  kind: z.enum(['declared', 'status_change', 'note', 'evidence', 'action']),
  summary: z.string(),
  actor: z.string().optional(),
})

export const incidentSchema = z.object({
  id: z.string(),
  number: z.number().int(),
  title: z.string(),
  severity: z.enum(SEVERITIES),
  status: z.enum(INCIDENT_STATUSES),
  ownerMembershipId: z.string().nullable(),
  investigationId: z.string().nullable(),
  impactSummary: z.string(),
  declaredAt: z.string(),
  resolvedAt: z.string().nullable(),
})
export type IncidentDto = z.infer<typeof incidentSchema>

export const incidentDetailSchema = incidentSchema.extend({
  timeline: z.array(incidentTimelineEntrySchema),
})
export type IncidentDetailDto = z.infer<typeof incidentDetailSchema>

export const incidentListQuerySchema = listQuerySchema.extend({
  status: z.enum(INCIDENT_STATUSES).optional(),
  severity: z.enum(SEVERITIES).optional(),
})
export type IncidentListQuery = z.infer<typeof incidentListQuerySchema>

/**
 * PATCH /v1/incidents/:id. Lifecycle from domain/transitions; every status
 * change and note appends a timeline entry service-side.
 */
export const incidentPatchSchema = z
  .object({
    status: z.enum(INCIDENT_STATUSES).optional(),
    ownerMembershipId: z.string().min(1).nullable().optional(),
    impactSummary: z.string().trim().max(2000).optional(),
    note: z.string().trim().min(1).max(2000).optional(),
  })
  .refine((v) => Object.values(v).some((field) => field !== undefined), {
    message: 'Patch must contain at least one field',
  })
export type IncidentPatch = z.infer<typeof incidentPatchSchema>
