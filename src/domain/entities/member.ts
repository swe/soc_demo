import { z } from 'zod'

import { MEMBERSHIP_STATUSES, ROLES } from '../enums'

/**
 * Org member directory entry. Listing is org-visible (data:read) so analysts
 * can assign work; management mutations require admin:members.
 */
export const memberSchema = z.object({
  membershipId: z.string(),
  userId: z.string(),
  name: z.string().nullable(),
  email: z.string(),
  role: z.enum(ROLES),
  status: z.enum(MEMBERSHIP_STATUSES),
  createdAt: z.string(),
})
export type MemberDto = z.infer<typeof memberSchema>
