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
