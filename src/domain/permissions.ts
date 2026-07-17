import type { Role } from './enums'

/**
 * Permission strings checked by the service layer via `can(ctx, permission)`.
 * The UI reads the same matrix to hide affordances — hiding is UX, never security.
 *
 * v1 keeps this as a typed constant; swapping in DB-driven custom roles later
 * (enterprise, Phase 5) changes `can()` only.
 */
export const PERMISSIONS = [
  'data:read',
  'alert:triage',
  'investigation:write',
  'incident:write',
  'asset:manage',
  'vulnerability:manage',
  'integration:manage',
  'admin:members',
  'admin:audit',
  'admin:seed',
] as const

export type Permission = (typeof PERMISSIONS)[number]

export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  admin: PERMISSIONS,
  analyst: ['data:read', 'alert:triage', 'investigation:write', 'incident:write'],
  engineer: ['data:read', 'asset:manage', 'vulnerability:manage', 'integration:manage'],
  viewer: ['data:read'],
}

export function roleHasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission)
}
