import { z } from 'zod'

import { ENTITY_STATUSES, IDENTITY_TYPES, PRIVILEGE_TIERS } from '../enums'
import { alertSchema } from './alert'
import { assetSchema } from './asset'
import { listQuerySchema } from './common'

export const identitySchema = z.object({
  id: z.string(),
  principal: z.string(),
  displayName: z.string(),
  type: z.enum(IDENTITY_TYPES),
  privilegeTier: z.enum(PRIVILEGE_TIERS),
  mfaEnabled: z.boolean(),
  riskScore: z.number().int(),
  status: z.enum(ENTITY_STATUSES),
  firstSeen: z.string(),
  lastSeen: z.string(),
})
export type IdentityDto = z.infer<typeof identitySchema>

export const identityDetailSchema = identitySchema.extend({
  attributes: z.record(z.string(), z.unknown()),
  ownedAssets: z.array(assetSchema),
  relatedAlerts: z.array(alertSchema),
})
export type IdentityDetailDto = z.infer<typeof identityDetailSchema>

export const identityListQuerySchema = listQuerySchema.extend({
  type: z.enum(IDENTITY_TYPES).optional(),
  privilegeTier: z.enum(PRIVILEGE_TIERS).optional(),
  q: z.string().trim().min(1).max(200).optional(),
})
export type IdentityListQuery = z.infer<typeof identityListQuerySchema>
