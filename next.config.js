const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pin workspace root so a parent package-lock.json (e.g. in ~) does not confuse Turbopack.
  turbopack: {
    root: path.join(__dirname),
  },
}

module.exports = nextConfig
