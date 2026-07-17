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
