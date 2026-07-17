import { index, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'
import { and, isNull, sql } from 'drizzle-orm'
import { uuidv7 } from 'uuidv7'

import { roleEnum } from './enums'
import { memberships, organizations } from './tenancy'

/**
 * Pending membership invites. A membership row requires a user_id, so invites
 * for addresses without an account live here until accepted.
 *
 * M2 ships accept-links only (no email delivery): the raw token appears once
 * in the URL returned to the inviting admin; only its SHA-256 hash is stored.
 */
export const organizationInvites = pgTable(
  'organization_invite',
  {
    id: text('id').primaryKey().$defaultFn(uuidv7),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    email: text('email').notNull(),
    role: roleEnum('role').notNull().default('viewer'),
    tokenHash: text('token_hash').notNull().unique(),
    invitedByMembershipId: text('invited_by_membership_id').references(() => memberships.id, {
      onDelete: 'set null',
    }),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    acceptedAt: timestamp('accepted_at', { withTimezone: true }),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    // One live (not yet accepted or revoked) invite per address per org.
    uniqueIndex('invite_org_email_live_uq')
      .on(t.organizationId, sql`lower(${t.email})`)
      .where(and(isNull(t.acceptedAt), isNull(t.revokedAt))!),
    index('invite_org_created_idx').on(t.organizationId, t.createdAt),
  ],
)
