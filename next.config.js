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
  async redirects() {
    return [
      {
        source: '/overview/unified-preview',
        destination: '/overview',
        permanent: false,
      },
      {
        source: '/overview/assets/identities',
        destination: '/overview/identities',
        permanent: false,
      },
      {
        source: '/overview/administration/user-management',
        destination: '/overview/administration/members',
        permanent: false,
      },
      {
        source: '/overview/assets/devices',
        destination: '/overview/assets',
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig
