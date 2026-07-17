import { test, expect } from '@playwright/test'

function uniqueEmail() {
  return `m1.${Date.now()}.${Math.floor(Math.random() * 1e6)}@example.test`
}

test.describe('M1 acceptance', () => {
  test('register → create org → seed → see live Overview / Alerts / Incidents', async ({ page }) => {
    const email = uniqueEmail()
    const password = 'acceptance-password'

    await page.goto('/signup')
    await page.locator('#email').fill(email)
    await page.locator('#name').fill('Maya')
    await page.locator('#surname').fill('Okafor')
    await page.locator('#password').fill(password)
    await page.getByRole('button', { name: /Sign Up/i }).click()

    await expect(page).toHaveURL(/\/onboarding/, { timeout: 30_000 })
    await page.locator('#org-name').fill('Meridian Financial Group')
    await page.getByRole('button', { name: /Create organization/i }).click()

    await expect(page.getByRole('button', { name: /Load demo data/i })).toBeVisible({
      timeout: 30_000,
    })
    await page.getByRole('button', { name: /Load demo data/i }).click()

    await expect(page).toHaveURL(/\/overview$/, { timeout: 90_000 })
    await expect(page.getByText('OPEN ALERTS').first()).toBeVisible({ timeout: 30_000 })
    await expect(page.getByText('OPEN INCIDENTS').first()).toBeVisible()
    await expect(page.getByText('MONITORED ASSETS').first()).toBeVisible()

    await page.goto('/overview/alerts')
    await expect(page.locator('table.soc-table')).toBeVisible({ timeout: 30_000 })
    await expect(page.locator('table.soc-table tbody tr').first()).toBeVisible()

    await page.goto('/overview/incidents')
    await expect(page.getByText(/INC-\d+/).first()).toBeVisible({ timeout: 30_000 })
  })

  test('unauthenticated overview access redirects to sign-in', async ({ page }) => {
    await page.goto('/overview')
    await expect(page).toHaveURL(/\/signin/)
  })
})
