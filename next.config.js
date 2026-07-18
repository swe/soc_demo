const path = require('path')
const { SECURITY_HEADERS } = require('./security-headers')

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
