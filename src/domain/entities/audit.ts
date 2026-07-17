import { z } from 'zod'

/** A single audit_log row as exposed by the API (append-only, read-only). */
export const auditEntrySchema = z.object({
  id: z.string(),
  action: z.string(),
  targetType: z.string(),
  targetId: z.string().nullable(),
  actorMembershipId: z.string().nullable(),
  metadata: z.record(z.string(), z.unknown()),
  createdAt: z.string(),
})
export type AuditEntryDto = z.infer<typeof auditEntrySchema>

/** Audit UI row: entry plus the resolved actor name (null for system events). */
export const auditListItemSchema = auditEntrySchema.extend({
  actorName: z.string().nullable(),
})
export type AuditListItemDto = z.infer<typeof auditListItemSchema>

export const auditListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  cursor: z.string().optional(),
  action: z.string().trim().min(1).max(100).optional(),
  targetType: z.string().trim().min(1).max(100).optional(),
  actorMembershipId: z.string().trim().min(1).optional(),
})
export type AuditListQuery = z.infer<typeof auditListQuerySchema>
