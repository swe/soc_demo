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

/** PATCH /v1/members/:id (admin-only): change role and/or suspend/reactivate. */
export const memberPatchSchema = z
  .object({
    role: z.enum(ROLES).optional(),
    status: z.enum(['active', 'suspended']).optional(),
  })
  .refine((v) => v.role !== undefined || v.status !== undefined, {
    message: 'Patch must contain at least one field',
  })
export type MemberPatch = z.infer<typeof memberPatchSchema>

export const inviteCreateSchema = z.object({
  email: z.email().max(320),
  role: z.enum(ROLES).default('viewer'),
})
export type InviteCreate = z.infer<typeof inviteCreateSchema>

export const inviteSchema = z.object({
  id: z.string(),
  email: z.string(),
  role: z.enum(ROLES),
  invitedByMembershipId: z.string().nullable(),
  expiresAt: z.string(),
  acceptedAt: z.string().nullable(),
  revokedAt: z.string().nullable(),
  createdAt: z.string(),
})
export type InviteDto = z.infer<typeof inviteSchema>

export const acceptInviteSchema = z.object({
  token: z.string().min(20).max(200),
})
