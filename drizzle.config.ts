import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/server/db/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    // drizzle-kit runs outside Next.js, so read process.env directly
    url: process.env.DATABASE_URL ?? 'postgres://soc:soc@localhost:5432/soc',
  },
  strict: true,
  verbose: true,
})
