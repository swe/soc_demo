import { test, expect } from '@playwright/test'

/**
 * M2.6: next.config.js headers() must apply the defensive header set to
 * every response. Auth pages and the overview shell are covered; Playwright
 * flows also exercise Chart.js + Leaflet under the pragmatic CSP.
 */
const REQUIRED = [
  'content-security-policy',
  'strict-transport-security',
  'x-frame-options',
  'x-content-type-options',
  'referrer-policy',
  'permissions-policy',
] as const

test.describe('security response headers', () => {
  for (const path of ['/signin', '/']) {
    test(`${path} carries the M2.6 defensive header set`, async ({ request }) => {
      const response = await request.get(path)
      expect(response.ok() || response.status() === 307 || response.status() === 308).toBeTruthy()

      for (const name of REQUIRED) {
        expect(response.headers()[name], `${name} missing on ${path}`).toBeTruthy()
      }

      expect(response.headers()['x-frame-options']).toBe('DENY')
      expect(response.headers()['x-content-type-options']).toBe('nosniff')
      expect(response.headers()['content-security-policy']).toContain("default-src 'self'")
      expect(response.headers()['content-security-policy']).toContain(
        'https://*.tile.openstreetmap.org',
      )
    })
  }
})
