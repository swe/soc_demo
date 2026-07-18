import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'

/**
 * Apply all pending Drizzle migrations. Uses its own single connection so it
 * can run from CLIs (db:migrate, demo:setup) without the app's pooled client.
 */
export async function runMigrations(databaseUrl?: string): Promise<void> {
  const url = databaseUrl ?? process.env.DATABASE_URL ?? 'postgres://soc:soc@localhost:5432/soc'
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
