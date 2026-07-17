import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import { env } from '../../env'

import * as schema from './schema'

/**
 * Raw database client. Intentionally NOT re-exported from the db barrel —
 * services must go through the tenant-scoped helpers in `scoped.ts`.
 * (Import boundary lint rule lands in M3; the convention holds until then.)
 */
const globalForDb = globalThis as unknown as { __socSql?: ReturnType<typeof postgres> }

const sql =
  globalForDb.__socSql ??
  postgres(env.DATABASE_URL, {
    max: env.NODE_ENV === 'production' ? 10 : 5,
    onnotice: () => {},
  })

if (env.NODE_ENV !== 'production') globalForDb.__socSql = sql

export const db = drizzle(sql, { schema, casing: 'snake_case' })
export type Db = typeof db
export { schema }
