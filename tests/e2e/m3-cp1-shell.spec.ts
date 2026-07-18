import { expect, test } from '@playwright/test'

/**
 * M3 Checkpoint 1 — AppShell / nav shrink visual + behavioral smoke.
 * Requires a signed-in session via demo bootstrap (same as other e2e).
 */
test.describe('M3 Checkpoint 1 — product shell', () => {
  test.beforeAll(async () => {
    const { execSync } = await import('node:child_process')
    execSync('pnpm demo:setup', { stdio: 'inherit' })
  })

  test('primary nav is workflow-shaped; mock areas are gone', async ({ page }) => {
    await page.goto('/signin')
    await page.locator('#email').fill('demo@svalbard.ca')
    await page.locator('#password').fill('Demo123')
    await page.getByRole('button', { name: /Sign In/i }).click()
    await expect(page).toHaveURL(/\/overview$/, { timeout: 30_000 })

    const nav = page.getByRole('navigation', { name: 'Product' })
    await expect(nav.getByRole('link', { name: 'Overview' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Alerts' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Investigations' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Incidents' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Assets' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Identities' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Vulnerabilities' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Members' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Audit log' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Settings' })).toBeVisible()

    await expect(nav.getByText('Threat Hunting')).toHaveCount(0)
    await expect(nav.getByText('Threat Intelligence')).toHaveCount(0)
    await expect(nav.getByText('Knowledge Base')).toHaveCount(0)
    await expect(nav.getByText('Compliance')).toHaveCount(0)
    await expect(nav.getByText('Integrations')).toHaveCount(0)
    await expect(nav.getByText('Heimdall')).toHaveCount(0)
    await expect(page.getByText('Svalbard').first()).toBeVisible()

    await page.screenshot({ path: 'docs/status/evidence/m3-cp1-overview-shell.png', fullPage: true })

    await page.goto('/overview/threat-intelligence/overview')
    await expect(page.getByText('not available in the current product version')).toBeVisible()
    await page.screenshot({ path: 'docs/status/evidence/m3-cp1-unavailable.png', fullPage: true })

    await page.goto('/overview/investigations')
    await expect(page.getByText('Investigations workspace arrives in Checkpoint 4')).toBeVisible()
    await page.screenshot({ path: 'docs/status/evidence/m3-cp1-investigations-placeholder.png', fullPage: true })

    await page.goto('/overview/alerts')
    await expect(page.locator('table.soc-table tbody tr').first()).toBeVisible({ timeout: 30_000 })
    await page.screenshot({ path: 'docs/status/evidence/m3-cp1-alerts.png', fullPage: true })
  })
})
