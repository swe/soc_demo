import {
  boolean,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  type AnyPgColumn,
} from 'drizzle-orm/pg-core'
import { uuidv7 } from 'uuidv7'

import {
  alertStatusEnum,
  assetTypeEnum,
  criticalityEnum,
  dispositionEnum,
  entityStatusEnum,
  eventCategoryEnum,
  identityTypeEnum,
  incidentStatusEnum,
  investigationStatusEnum,
  privilegeTierEnum,
  severityEnum,
  vulnerabilityStatusEnum,
} from './enums'
import { memberships, organizations } from './tenancy'

const id = () => text('id').primaryKey().$defaultFn(uuidv7)
const orgId = () =>
  text('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' })
const createdAt = () => timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
const updatedAt = () =>
  timestamp('updated_at', { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date())

/** Lightweight reference from a signal to a graph entity. */
export type EntityRef = { type: 'asset' | 'identity'; id: string; label?: string }

/** Append-only analyst note on an investigation, written by the service layer only. */
export type InvestigationNote = { at: string; membershipId: string; text: string }

export const identities = pgTable(
  'identity',
  {
    id: id(),
    organizationId: orgId(),
    principal: text('principal').notNull(),
    displayName: text('display_name').notNull(),
    type: identityTypeEnum('type').notNull().default('human'),
    source: text('source').notNull().default('seed'),
    privilegeTier: privilegeTierEnum('privilege_tier').notNull().default('standard'),
    mfaEnabled: boolean('mfa_enabled').notNull().default(false),
    riskScore: integer('risk_score').notNull().default(0),
    status: entityStatusEnum('status').notNull().default('active'),
    attributes: jsonb('attributes').notNull().default({}),
    firstSeen: timestamp('first_seen', { withTimezone: true }).notNull().defaultNow(),
    lastSeen: timestamp('last_seen', { withTimezone: true }).notNull().defaultNow(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex('identity_org_principal_uq').on(t.organizationId, t.principal),
    index('identity_org_risk_idx').on(t.organizationId, t.riskScore),
  ],
)

export const assets = pgTable(
  'asset',
  {
    id: id(),
    organizationId: orgId(),
    type: assetTypeEnum('type').notNull(),
    name: text('name').notNull(),
    externalIds: jsonb('external_ids').notNull().default({}),
    criticality: criticalityEnum('criticality').notNull().default('tier3'),
    ownerIdentityId: text('owner_identity_id').references(() => identities.id, {
      onDelete: 'set null',
    }),
    status: entityStatusEnum('status').notNull().default('active'),
    riskScore: integer('risk_score').notNull().default(0),
    attributes: jsonb('attributes').notNull().default({}),
    firstSeen: timestamp('first_seen', { withTimezone: true }).notNull().defaultNow(),
    lastSeen: timestamp('last_seen', { withTimezone: true }).notNull().defaultNow(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index('asset_org_type_idx').on(t.organizationId, t.type),
    index('asset_org_risk_idx').on(t.organizationId, t.riskScore),
  ],
)

export const events = pgTable(
  'event',
  {
    id: id(),
    organizationId: orgId(),
    occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull(),
    source: text('source').notNull(),
    category: eventCategoryEnum('category').notNull(),
    actor: jsonb('actor').notNull().default({}),
    target: jsonb('target').notNull().default({}),
    entityRefs: jsonb('entity_refs').$type<EntityRef[]>().notNull().default([]),
    payload: jsonb('payload').notNull().default({}),
    createdAt: createdAt(),
  },
  (t) => [
    index('event_org_time_idx').on(t.organizationId, t.occurredAt),
    index('event_org_category_time_idx').on(t.organizationId, t.category, t.occurredAt),
  ],
)

export const investigations = pgTable(
  'investigation',
  {
    id: id(),
    organizationId: orgId(),
    title: text('title').notNull(),
    status: investigationStatusEnum('status').notNull().default('open'),
    hypothesis: text('hypothesis'),
    assigneeMembershipId: text('assignee_membership_id').references(() => memberships.id, {
      onDelete: 'set null',
    }),
    disposition: dispositionEnum('disposition'),
    aiSummary: text('ai_summary'),
    /**
     * Provenance for alert-initiated investigations. Circular FK with
     * alert.investigation_id is intentional; both sides are `set null`,
     * so deletes cannot cascade in a loop (see docs/m2/migration-review.md).
     */
    createdFromAlertId: text('created_from_alert_id').references((): AnyPgColumn => alerts.id, {
      onDelete: 'set null',
    }),
    notes: jsonb('notes').$type<InvestigationNote[]>().notNull().default([]),
    createdBy: text('created_by'),
    closedAt: timestamp('closed_at', { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index('investigation_org_status_idx').on(t.organizationId, t.status),
    index('investigation_assignee_idx').on(t.assigneeMembershipId),
  ],
)

export const alerts = pgTable(
  'alert',
  {
    id: id(),
    organizationId: orgId(),
    title: text('title').notNull(),
    description: text('description').notNull().default(''),
    severity: severityEnum('severity').notNull(),
    status: alertStatusEnum('status').notNull().default('new'),
    disposition: dispositionEnum('disposition'),
    source: text('source').notNull(),
    ruleKey: text('rule_key').notNull().default('manual'),
    mitreTechniques: text('mitre_techniques').array().notNull().default([]),
    entityRefs: jsonb('entity_refs').$type<EntityRef[]>().notNull().default([]),
    investigationId: text('investigation_id').references(() => investigations.id, {
      onDelete: 'set null',
    }),
    assignedMembershipId: text('assigned_membership_id').references(() => memberships.id, {
      onDelete: 'set null',
    }),
    analystNote: text('analyst_note'),
    /** Lifecycle timestamps set by the service on the matching transition (ADR-0003). */
    triagedAt: timestamp('triaged_at', { withTimezone: true }),
    resolvedAt: timestamp('resolved_at', { withTimezone: true }),
    dismissedReason: text('dismissed_reason'),
    raw: jsonb('raw').notNull().default({}),
    detectedAt: timestamp('detected_at', { withTimezone: true }).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index('alert_org_status_time_idx').on(t.organizationId, t.status, t.detectedAt),
    index('alert_org_severity_idx').on(t.organizationId, t.severity),
    index('alert_investigation_idx').on(t.investigationId),
    index('alert_assigned_membership_idx').on(t.assignedMembershipId),
  ],
)

export type IncidentTimelineEntry = {
  at: string
  kind: 'declared' | 'status_change' | 'note' | 'evidence' | 'action'
  summary: string
  actor?: string
}

export const incidents = pgTable(
  'incident',
  {
    id: id(),
    organizationId: orgId(),
    /** Per-org sequential number; rendered as INC-<number>. */
    number: integer('number').notNull(),
    title: text('title').notNull(),
    severity: severityEnum('severity').notNull(),
    status: incidentStatusEnum('status').notNull().default('declared'),
    ownerMembershipId: text('owner_membership_id').references(() => memberships.id, {
      onDelete: 'set null',
    }),
    investigationId: text('investigation_id').references(() => investigations.id, {
      onDelete: 'set null',
    }),
    impactSummary: text('impact_summary').notNull().default(''),
    timeline: jsonb('timeline').$type<IncidentTimelineEntry[]>().notNull().default([]),
    slaDueAt: timestamp('sla_due_at', { withTimezone: true }),
    declaredAt: timestamp('declared_at', { withTimezone: true }).notNull().defaultNow(),
    resolvedAt: timestamp('resolved_at', { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex('incident_org_number_uq').on(t.organizationId, t.number),
    index('incident_org_status_severity_idx').on(t.organizationId, t.status, t.severity),
  ],
)

export const vulnerabilities = pgTable(
  'vulnerability',
  {
    id: id(),
    organizationId: orgId(),
    assetId: text('asset_id')
      .notNull()
      .references(() => assets.id, { onDelete: 'cascade' }),
    cveId: text('cve_id'),
    ruleKey: text('rule_key'),
    title: text('title').notNull(),
    cvss: doublePrecision('cvss'),
    epss: doublePrecision('epss'),
    exploitedInWild: boolean('exploited_in_wild').notNull().default(false),
    severity: severityEnum('severity').notNull(),
    status: vulnerabilityStatusEnum('status').notNull().default('open'),
    fixAvailable: boolean('fix_available').notNull().default(false),
    detectedAt: timestamp('detected_at', { withTimezone: true }).notNull(),
    resolvedAt: timestamp('resolved_at', { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index('vulnerability_org_status_severity_idx').on(t.organizationId, t.status, t.severity),
    index('vulnerability_asset_idx').on(t.assetId),
    index('vulnerability_org_cve_idx').on(t.organizationId, t.cveId),
  ],
)
