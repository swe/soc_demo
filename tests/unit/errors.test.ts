import { describe, expect, it } from 'vitest'

import { isUniqueViolation } from '@server/services/errors'

describe('isUniqueViolation', () => {
  it('matches a raw postgres 23505 error', () => {
    const err = Object.assign(new Error('duplicate key'), {
      code: '23505',
      constraint_name: 'incident_org_investigation_uq',
    })
    expect(isUniqueViolation(err)).toBe(true)
    expect(isUniqueViolation(err, 'incident_org_investigation_uq')).toBe(true)
    expect(isUniqueViolation(err, 'some_other_constraint')).toBe(false)
  })

  it('matches a wrapped error via cause', () => {
    const cause = Object.assign(new Error('duplicate key'), {
      code: '23505',
      constraint_name: 'incident_org_investigation_uq',
    })
    const wrapped = new Error('Failed query', { cause })
    expect(isUniqueViolation(wrapped, 'incident_org_investigation_uq')).toBe(true)
  })

  it('rejects non-unique-violation errors', () => {
    expect(isUniqueViolation(new Error('boom'))).toBe(false)
    expect(isUniqueViolation(null)).toBe(false)
    expect(isUniqueViolation({ code: '23503' })).toBe(false)
  })
})
