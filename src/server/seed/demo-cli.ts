import { runMigrations } from '../db/migrate'

/**
 * CLI: pnpm demo:setup [--reset]
 *
 * One-command demo bootstrap: migrations → demo org → demo user → membership
 * → Meridian dataset (seed-if-missing) → integrity check → summary.
 * Safe to run repeatedly; --reset restores the pristine deterministic dataset.
 */
async function main() {
  const reset = process.argv.includes('--reset')

  // Fail fast before touching the database. Env validation also rejects a
  // missing ENABLE_DEMO_DATA outright (no implicit default).
  const { demoDataEnabled } = await import('../../env')
  if (!demoDataEnabled) {
    console.error(
      'demo:setup refused: ENABLE_DEMO_DATA=false on this deployment. ' +
        'Customer environments must never receive Meridian demo data.',
    )
    process.exit(1)
  }

  console.log('Applying migrations…')
  await runMigrations()

  // Import after migrations so the env-validated app client boots against a
  // fully migrated schema.
  const { ensureDemoTenant, DEMO_USER_EMAIL } = await import('./demo')

  const report = await ensureDemoTenant({ reset })

  const mark = (created: boolean, freshLabel: string, existingLabel: string) =>
    created ? freshLabel : existingLabel
  const seedLabel = {
    seeded: 'loaded ✓',
    reset: 'reset to pristine dataset ✓',
    skipped: 'already present ✓ (modifications preserved — use --reset to restore)',
  }[report.seed.action]

  console.log('')
  console.log(`Demo organization: ${report.organization.name} ${mark(report.organization.created, '✓ (created)', '✓')}`)
  console.log(`Demo user: ${DEMO_USER_EMAIL} ${mark(report.user.created, '✓ (created)', '✓')}`)
  console.log(`Membership: ${report.membership.role} (${report.membership.status}) ✓`)
  console.log(`Seed data: ${seedLabel}`)
  console.log('')
  console.log(`Alerts: ${report.counts.alerts}`)
  console.log(`Incidents: ${report.counts.incidents}`)
  console.log(`Investigations: ${report.counts.investigations}`)
  console.log(`Assets: ${report.counts.assets}`)
  console.log(`Identities: ${report.counts.identities}`)
  console.log(`Vulnerabilities: ${report.counts.vulnerabilities}`)
  console.log(`Events: ${report.counts.events}`)
  console.log('')
  console.log(`Sign in at ${process.env.APP_URL ?? 'http://localhost:3000'}/signin`)

  process.exit(0)
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
