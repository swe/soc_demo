import { describe, expect, it } from 'vitest'

// next.config.js is CommonJS; require keeps the test aligned with runtime.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const nextConfig = require('../../next.config.js') as {
  headers: () => Promise<Array<{ source: string; headers: Array<{ key: string; value: string }> }>>
  SECURITY_HEADERS: Array<{ key: string; value: string }>
  CONTENT_SECURITY_POLICY: string
}

describe('security response headers (next.config.js)', () => {
  it('exports the six defensive headers required by M2.6', () => {
    const keys = nextConfig.SECURITY_HEADERS.map((h) => h.key)
    expect(keys).toEqual(
      expect.arrayContaining([
        'Content-Security-Policy',
        'Strict-Transport-Security',
        'X-Frame-Options',
        'X-Content-Type-Options',
        'Referrer-Policy',
        'Permissions-Policy',
      ]),
    )
    expect(keys).toHaveLength(6)
  })

  it('applies headers to every route via headers()', async () => {
    const rules = await nextConfig.headers()
    expect(rules).toHaveLength(1)
    expect(rules[0].source).toBe('/(.*)')
    expect(rules[0].headers).toBe(nextConfig.SECURITY_HEADERS)
  })

  it('uses the pragmatic CSP with Leaflet tile host and without unsafe-eval', () => {
    const csp = nextConfig.CONTENT_SECURITY_POLICY
    expect(csp).toContain("default-src 'self'")
    expect(csp).toContain("script-src 'self' 'unsafe-inline'")
    expect(csp).toContain("style-src 'self' 'unsafe-inline'")
    expect(csp).toContain('https://*.tile.openstreetmap.org')
    expect(csp).toContain("frame-ancestors 'none'")
    expect(csp).toContain("object-src 'none'")
    expect(csp).not.toContain('unsafe-eval')
  })

  it('sets HSTS, clickjacking, MIME, and referrer defenses', () => {
    const byKey = Object.fromEntries(nextConfig.SECURITY_HEADERS.map((h) => [h.key, h.value]))
    expect(byKey['Strict-Transport-Security']).toBe('max-age=63072000; includeSubDomains')
    expect(byKey['X-Frame-Options']).toBe('DENY')
    expect(byKey['X-Content-Type-Options']).toBe('nosniff')
    expect(byKey['Referrer-Policy']).toBe('strict-origin-when-cross-origin')
    expect(byKey['Permissions-Policy']).toBe('camera=(), microphone=(), geolocation=()')
  })
})
