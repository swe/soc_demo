/**
 * Canonical enum values shared by the database schema, API contracts, and UI.
 * The Drizzle schema builds its pg enums from these arrays, so the database
 * and TypeScript can never drift.
 */

export const ROLES = ['admin', 'analyst', 'engineer', 'viewer'] as const
export type Role = (typeof ROLES)[number]

export const MEMBERSHIP_STATUSES = ['invited', 'active', 'suspended'] as const
export type MembershipStatus = (typeof MEMBERSHIP_STATUSES)[number]

export const ASSET_TYPES = ['device', 'cloud_resource', 'application'] as const
export type AssetType = (typeof ASSET_TYPES)[number]

export const CRITICALITIES = ['tier1', 'tier2', 'tier3', 'tier4'] as const
export type Criticality = (typeof CRITICALITIES)[number]

export const ENTITY_STATUSES = [
  'discovered',
  'active',
  'disabled',
  'decommissioned',
  'deprovisioned',
] as const
export type EntityStatus = (typeof ENTITY_STATUSES)[number]

export const IDENTITY_TYPES = ['human', 'service', 'machine'] as const
export type IdentityType = (typeof IDENTITY_TYPES)[number]

export const PRIVILEGE_TIERS = ['standard', 'elevated', 'privileged'] as const
export type PrivilegeTier = (typeof PRIVILEGE_TIERS)[number]

export const SEVERITIES = ['critical', 'high', 'medium', 'low'] as const
export type Severity = (typeof SEVERITIES)[number]

export const ALERT_STATUSES = ['new', 'triaged', 'resolved', 'dismissed'] as const
export type AlertStatus = (typeof ALERT_STATUSES)[number]

export const DISPOSITIONS = ['benign', 'malicious', 'inconclusive'] as const
export type Disposition = (typeof DISPOSITIONS)[number]

export const INVESTIGATION_STATUSES = ['open', 'active', 'closed'] as const
export type InvestigationStatus = (typeof INVESTIGATION_STATUSES)[number]

export const INCIDENT_STATUSES = ['declared', 'contained', 'resolved', 'closed'] as const
export type IncidentStatus = (typeof INCIDENT_STATUSES)[number]

export const VULNERABILITY_STATUSES = ['open', 'in_progress', 'resolved', 'accepted'] as const
export type VulnerabilityStatus = (typeof VULNERABILITY_STATUSES)[number]

export const INTEGRATION_STATUSES = ['configured', 'healthy', 'degraded', 'error', 'paused'] as const
export type IntegrationStatus = (typeof INTEGRATION_STATUSES)[number]

export const ACTOR_TYPES = ['user', 'system', 'api_key'] as const
export type ActorType = (typeof ACTOR_TYPES)[number]

export const EVENT_CATEGORIES = ['auth', 'process', 'network', 'api', 'finding'] as const
export type EventCategory = (typeof EVENT_CATEGORIES)[number]

// Lifecycle transition maps live in ./transitions (single source of truth, ADR-0003).
