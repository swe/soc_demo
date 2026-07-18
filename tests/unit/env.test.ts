import { describe, expect, it } from 'vitest'

import { envSchema } from '../../src/env'

const base = {
  DATABASE_URL: 'postgres://soc:soc@localhost:5432/soc',
  AUTH_SECRET: 'test-only-secret-test-only-secret-test-only',
}

describe('env validation', () => {
  it('fails fast when ENABLE_DEMO_DATA is missing (no implicit default)', () => {
    const result = envSchema.safeParse(base)
    expect(result.success).toBe(false)
    const paths = result.success ? [] : result.error.issues.map((i) => i.path.join('.'))
    expect(paths).toContain('ENABLE_DEMO_DATA')
  })

  it('rejects values other than "true" or "false"', () => {
    expect(envSchema.safeParse({ ...base, ENABLE_DEMO_DATA: '1' }).success).toBe(false)
    expect(envSchema.safeParse({ ...base, ENABLE_DEMO_DATA: 'yes' }).success).toBe(false)
  })

  it('accepts explicit true and false', () => {
    expect(envSchema.safeParse({ ...base, ENABLE_DEMO_DATA: 'true' }).success).toBe(true)
    expect(envSchema.safeParse({ ...base, ENABLE_DEMO_DATA: 'false' }).success).toBe(true)
  })

  it('does not derive demo behavior from NODE_ENV', () => {
    // Production with demo enabled (public demo host) and development with
    // demo disabled are both legal — the flag alone decides.
    expect(
      envSchema.safeParse({ ...base, NODE_ENV: 'production', ENABLE_DEMO_DATA: 'true' }).success,
    ).toBe(true)
    expect(
      envSchema.safeParse({ ...base, NODE_ENV: 'development', ENABLE_DEMO_DATA: 'false' }).success,
    ).toBe(true)
  })
})
