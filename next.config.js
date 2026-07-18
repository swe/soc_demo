const path = require('path')

/**
 * Pragmatic Content-Security-Policy for M2.6.
 *
 * 'unsafe-inline' for script-src / style-src is required by Next.js App Router
 * without a nonce pipeline. A nonce-based CSP (middleware-issued nonces wired
 * through next/script and styled-jsx) is deferred technical debt — see
 * docs/security/csp-nonce-debt.md. Do not tighten script-src until that lands.
 *
 * img-src allows OpenStreetMap tiles used by Leaflet on the overview map.
 */
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.tile.openstreetmap.org",
  "font-src 'self'",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

const SECURITY_HEADERS = [
  { key: 'Content-Security-Policy', value: CONTENT_SECURITY_POLICY },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pin workspace root so a parent package-lock.json (e.g. in ~) does not confuse Turbopack.
  turbopack: {
    root: path.join(__dirname),
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: SECURITY_HEADERS,
      },
    ]
  },
}

module.exports = nextConfig
// Exported for unit tests that assert the header set without booting Next.
module.exports.SECURITY_HEADERS = SECURITY_HEADERS
module.exports.CONTENT_SECURITY_POLICY = CONTENT_SECURITY_POLICY
