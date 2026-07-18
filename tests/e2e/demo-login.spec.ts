import { execSync } from 'node:child_process'

import { test, expect } from '@playwright/test'

/**
 * M2.5 acceptance: a prospect signs in with the built-in demo account and
 * lands directly in the seeded Meridian tenant — no registration, no org
 * creation, no manual seeding.
 */
test.describe('demo account', () => {
  test.beforeAll(() => {
    execSync('pnpm demo:setup', { stdio: 'inherit' })
  })

  test('demo@svalbard.ca logs in and lands in the seeded Meridian tenant', async ({ page }) => {
    await page.goto('/signin')
    await page.locator('#email').fill('demo@svalbard.ca')
    await page.locator('#password').fill('Demo123')
    await page.getByRole('button', { name: /Sign In/i }).click()

    // Straight to the dashboard — no onboarding / org selection friction
    await expect(page).toHaveURL(/\/overview$/, { timeout: 30_000 })
    await expect(page.getByText('OPEN ALERTS').first()).toBeVisible({ timeout: 30_000 })
    await expect(page.getByText('OPEN INCIDENTS').first()).toBeVisible()

    // Seeded data is present
    await page.goto('/overview/alerts')
    await expect(page.locator('table.soc-table tbody tr').first()).toBeVisible({ timeout: 30_000 })

    await page.goto('/overview/incidents')
    await expect(page.getByText(/INC-\d+/).first()).toBeVisible({ timeout: 30_000 })
  })
})
