import { afterEach, describe, expect, it, vi } from 'vitest'

describe('runMigrations DATABASE_URL requirement', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('fails fast when DATABASE_URL is missing and no override is passed', async () => {
    delete process.env.DATABASE_URL
    const { runMigrations } = await import('../../src/server/db/migrate')
    await expect(runMigrations()).rejects.toThrow(
      /DATABASE_URL is required to run migrations \(no implicit local fallback\)/,
    )
  })
})
