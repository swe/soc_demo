import { z } from 'zod'

/**
 * Validated server environment. Imported by server code only — the app refuses
 * to boot with a malformed environment instead of failing at first query.
 */
export const envSchema = z.object({
  DATABASE_URL: z.url().startsWith('postgres'),
  AUTH_SECRET: z.string().min(32, 'AUTH_SECRET must be at least 32 chars (openssl rand -base64 32)'),
  AUTH_URL: z.url().default('http://localhost:3000'),
  AUTH_GOOGLE_ID: z.string().optional(),
  AUTH_GOOGLE_SECRET: z.string().optional(),
  APP_URL: z.url().default('http://localhost:3000'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  /**
   * Explicit, required switch for the Meridian demo dataset. Deliberately NOT
   * derived from NODE_ENV: the public demo host and customer deployments both
   * run production builds, so the behavior must be environment-controlled.
   * true  → demo bootstrap (pnpm demo:setup) and the in-app seed API work
   * false → both refuse; no Meridian data can reach this deployment
   */
  ENABLE_DEMO_DATA: z.enum(['true', 'false'], {
    error: 'ENABLE_DEMO_DATA is required and must be "true" or "false" (no implicit default)',
  }),
})

export type Env = z.infer<typeof envSchema>

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env)
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  ${i.path.join('.')}: ${i.message}`)
      .join('\n')
    throw new Error(`Invalid environment configuration:\n${issues}`)
  }
  return parsed.data
}

export const env = loadEnv()

export const googleAuthEnabled = Boolean(env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET)

export const demoDataEnabled = env.ENABLE_DEMO_DATA === 'true'
