import { index, jsonb, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'
import { uuidv7 } from 'uuidv7'

import { actorTypeEnum, integrationStatusEnum } from './enums'
import { memberships, organizations } from './tenancy'

const id = () => text('id').primaryKey().$defaultFn(uuidv7)
const orgId = () =>
  text('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' })

export const integrations = pgTable(
  'integration',
  {
    id: id(),
    organizationId: orgId(),
    connectorKey: text('connector_key').notNull(),
    displayName: text('display_name').notNull(),
    status: integrationStatusEnum('status').notNull().default('configured'),
    /** Non-secret configuration only. Secrets live behind secretRef. */
    config: jsonb('config').notNull().default({}),
    secretRef: text('secret_ref'),
    lastSyncAt: timestamp('last_sync_at', { withTimezone: true }),
    lastError: text('last_error'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [uniqueIndex('integration_org_connector_uq').on(t.organizationId, t.connectorKey)],
)

export const auditLogs = pgTable(
  'audit_log',
  {
    id: id(),
    /**
     * Nullable by design: platform-level events (registration, login before
     * an org exists) have no tenant. All tenant actions must set it.
     */
    organizationId: text('organization_id').references(() => organizations.id, {
      onDelete: 'cascade',
    }),
    actorMembershipId: text('actor_membership_id').references(() => memberships.id, {
      onDelete: 'set null',
    }),
    actorType: actorTypeEnum('actor_type').notNull().default('user'),
    action: text('action').notNull(),
    targetType: text('target_type').notNull(),
    targetId: text('target_id'),
    metadata: jsonb('metadata').notNull().default({}),
    ip: text('ip'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('audit_org_time_idx').on(t.organizationId, t.createdAt),
    index('audit_org_target_idx').on(t.organizationId, t.targetType, t.targetId),
  ],
)
