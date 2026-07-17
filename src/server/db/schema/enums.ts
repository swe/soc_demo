import { pgEnum } from 'drizzle-orm/pg-core'

import {
  ACTOR_TYPES,
  ALERT_STATUSES,
  ASSET_TYPES,
  CRITICALITIES,
  DISPOSITIONS,
  ENTITY_STATUSES,
  EVENT_CATEGORIES,
  IDENTITY_TYPES,
  INCIDENT_STATUSES,
  INTEGRATION_STATUSES,
  INVESTIGATION_STATUSES,
  MEMBERSHIP_STATUSES,
  PRIVILEGE_TIERS,
  ROLES,
  SEVERITIES,
  VULNERABILITY_STATUSES,
} from '../../../domain/enums'

// pg enums are built from the canonical domain arrays — one source of truth.
export const roleEnum = pgEnum('role', ROLES)
export const membershipStatusEnum = pgEnum('membership_status', MEMBERSHIP_STATUSES)
export const assetTypeEnum = pgEnum('asset_type', ASSET_TYPES)
export const criticalityEnum = pgEnum('criticality', CRITICALITIES)
export const entityStatusEnum = pgEnum('entity_status', ENTITY_STATUSES)
export const identityTypeEnum = pgEnum('identity_type', IDENTITY_TYPES)
export const privilegeTierEnum = pgEnum('privilege_tier', PRIVILEGE_TIERS)
export const severityEnum = pgEnum('severity', SEVERITIES)
export const alertStatusEnum = pgEnum('alert_status', ALERT_STATUSES)
export const dispositionEnum = pgEnum('disposition', DISPOSITIONS)
export const investigationStatusEnum = pgEnum('investigation_status', INVESTIGATION_STATUSES)
export const incidentStatusEnum = pgEnum('incident_status', INCIDENT_STATUSES)
export const vulnerabilityStatusEnum = pgEnum('vulnerability_status', VULNERABILITY_STATUSES)
export const integrationStatusEnum = pgEnum('integration_status', INTEGRATION_STATUSES)
export const actorTypeEnum = pgEnum('actor_type', ACTOR_TYPES)
export const eventCategoryEnum = pgEnum('event_category', EVENT_CATEGORIES)
