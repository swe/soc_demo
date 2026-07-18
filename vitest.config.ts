import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@server': path.resolve(__dirname, 'src/server'),
      '@domain': path.resolve(__dirname, 'src/domain'),
      '@ui': path.resolve(__dirname, 'src/components/ui'),
      '@lib': path.resolve(__dirname, 'src/lib'),
      // next-auth's ESM build imports 'next/server' extensionless, which Node
      // module resolution inside vitest cannot resolve; pin it to the file.
      'next/server': path.resolve(__dirname, 'node_modules/next/server.js'),
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    setupFiles: ['tests/setup.ts'],
    testTimeout: 30_000,
    // Integration tests share one database; keep them sequential
    fileParallelism: false,
    server: {
      deps: {
        // Process next-auth through vite so the 'next/server' alias above
        // applies to its extensionless ESM import as well.
        inline: ['next-auth', '@auth/core'],
      },
    },
  },
})
