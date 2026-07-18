import { describe, expect, it } from 'vitest'

// CommonJS source of truth — same module next.config.js requires.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { SECURITY_HEADERS, CONTENT_SECURITY_POLICY } = require('../../security-headers.js') as {
  SECURITY_HEADERS: Array<{ key: string; value: string }>
  CONTENT_SECURITY_POLICY: string
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const nextConfig = require('../../next.config.js') as {
  headers: () => Promise<Array<{ source: string; headers: Array<{ key: string; value: string }> }>>
}

describe('security response headers (next.config.js)', () => {
  it('exports the six defensive headers required by M2.6', () => {
    const keys = SECURITY_HEADERS.map((h) => h.key)
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
    expect(rules[0].headers).toEqual(SECURITY_HEADERS)
  })

  it('uses the pragmatic CSP with Leaflet tile host and without unsafe-eval', () => {
    expect(CONTENT_SECURITY_POLICY).toContain("default-src 'self'")
    expect(CONTENT_SECURITY_POLICY).toContain("script-src 'self' 'unsafe-inline'")
    expect(CONTENT_SECURITY_POLICY).toContain("style-src 'self' 'unsafe-inline'")
    expect(CONTENT_SECURITY_POLICY).toContain('https://*.tile.openstreetmap.org')
    expect(CONTENT_SECURITY_POLICY).toContain("frame-ancestors 'none'")
    expect(CONTENT_SECURITY_POLICY).toContain("object-src 'none'")
    expect(CONTENT_SECURITY_POLICY).not.toContain('unsafe-eval')
  })

  it('sets HSTS, clickjacking, MIME, and referrer defenses', () => {
    const byKey = Object.fromEntries(SECURITY_HEADERS.map((h) => [h.key, h.value]))
    expect(byKey['Strict-Transport-Security']).toBe('max-age=63072000; includeSubDomains')
    expect(byKey['X-Frame-Options']).toBe('DENY')
    expect(byKey['X-Content-Type-Options']).toBe('nosniff')
    expect(byKey['Referrer-Policy']).toBe('strict-origin-when-cross-origin')
    expect(byKey['Permissions-Policy']).toBe('camera=(), microphone=(), geolocation=()')
  })
})
