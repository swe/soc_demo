import { describe, expect, it } from 'vitest'

import { ROLES } from '@domain/enums'
import { PERMISSIONS, ROLE_PERMISSIONS, roleHasPermission } from '@domain/permissions'

describe('role permission matrix', () => {
  it('defines permissions for every role', () => {
    for (const role of ROLES) {
      expect(ROLE_PERMISSIONS[role]).toBeDefined()
    }
  })

  it('grants admin every permission', () => {
    for (const permission of PERMISSIONS) {
      expect(roleHasPermission('admin', permission)).toBe(true)
    }
  })

  it('grants every role data:read', () => {
    for (const role of ROLES) {
      expect(roleHasPermission(role, 'data:read')).toBe(true)
    }
  })

  it('restricts viewer to read-only', () => {
    expect(ROLE_PERMISSIONS.viewer).toEqual(['data:read'])
    expect(roleHasPermission('viewer', 'alert:triage')).toBe(false)
    expect(roleHasPermission('viewer', 'admin:seed')).toBe(false)
  })

  it('keeps analyst and engineer scoped to their domains', () => {
    expect(roleHasPermission('analyst', 'incident:write')).toBe(true)
    expect(roleHasPermission('analyst', 'integration:manage')).toBe(false)
    expect(roleHasPermission('engineer', 'vulnerability:manage')).toBe(true)
    expect(roleHasPermission('engineer', 'alert:triage')).toBe(false)
    expect(roleHasPermission('analyst', 'admin:members')).toBe(false)
    expect(roleHasPermission('engineer', 'admin:members')).toBe(false)
  })
})
