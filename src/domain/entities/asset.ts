import { z } from 'zod'

import { ASSET_TYPES, CRITICALITIES, ENTITY_STATUSES, SEVERITIES, VULNERABILITY_STATUSES } from '../enums'
import { alertSchema } from './alert'
import { listQuerySchema } from './common'

export const assetSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(ASSET_TYPES),
  criticality: z.enum(CRITICALITIES),
  status: z.enum(ENTITY_STATUSES),
  riskScore: z.number().int(),
  ownerIdentityId: z.string().nullable(),
  ownerName: z.string().nullable(),
  firstSeen: z.string(),
  lastSeen: z.string(),
})
export type AssetDto = z.infer<typeof assetSchema>

export const assetVulnerabilitySummarySchema = z.object({
  id: z.string(),
  cveId: z.string().nullable(),
  title: z.string(),
  severity: z.enum(SEVERITIES),
  status: z.enum(VULNERABILITY_STATUSES),
  exploitedInWild: z.boolean(),
})

export const assetDetailSchema = assetSchema.extend({
  attributes: z.record(z.string(), z.unknown()),
  externalIds: z.record(z.string(), z.unknown()),
  relatedAlerts: z.array(alertSchema),
  vulnerabilities: z.array(assetVulnerabilitySummarySchema),
})
export type AssetDetailDto = z.infer<typeof assetDetailSchema>

export const assetListQuerySchema = listQuerySchema.extend({
  type: z.enum(ASSET_TYPES).optional(),
  criticality: z.enum(CRITICALITIES).optional(),
  q: z.string().trim().min(1).max(200).optional(),
})
export type AssetListQuery = z.infer<typeof assetListQuerySchema>
