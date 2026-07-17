import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

/** @type {import('eslint').Linter.Config[]} */
const config = [
  ...nextVitals,
  ...nextTs,
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      '.pnpm-store/**',
      'drizzle/meta/**',
      'playwright-report/**',
      'test-results/**',
    ],
  },
]

export default config
