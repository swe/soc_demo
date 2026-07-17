import { z } from 'zod'

/**
 * Validated server environment. Imported by server code only — the app refuses
 * to boot with a malformed environment instead of failing at first query.
 */
const envSchema = z.object({
  DATABASE_URL: z.url().startsWith('postgres'),
  AUTH_SECRET: z.string().min(32, 'AUTH_SECRET must be at least 32 chars (openssl rand -base64 32)'),
  AUTH_URL: z.url().default('http://localhost:3000'),
  AUTH_GOOGLE_ID: z.string().optional(),
  AUTH_GOOGLE_SECRET: z.string().optional(),
  APP_URL: z.url().default('http://localhost:3000'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
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
