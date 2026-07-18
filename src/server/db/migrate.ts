import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'

/**
 * Apply all pending Drizzle migrations. Uses its own single connection so it
 * can run from CLIs (db:migrate, demo:setup) without the app's pooled client.
 *
 * DATABASE_URL is required — there is no hardcoded local fallback. A missing
 * URL must fail loudly so a misconfigured environment cannot silently migrate
 * the wrong database.
 */
export async function runMigrations(databaseUrl?: string): Promise<void> {
  const url = databaseUrl ?? process.env.DATABASE_URL
  if (!url) {
    throw new Error(
      'DATABASE_URL is required to run migrations (no implicit local fallback)',
    )
  }
  const sql = postgres(url, { max: 1, onnotice: () => {} })
  try {
    await migrate(drizzle(sql), { migrationsFolder: './drizzle' })
  } finally {
    await sql.end()
  }
}

// CLI entry: pnpm db:migrate
if (process.argv[1]?.endsWith('migrate.ts')) {
  console.log('Applying migrations…')
  runMigrations()
    .then(() => console.log('Migrations applied.'))
    .catch((err) => {
      console.error(err)
      process.exit(1)
    })
}
