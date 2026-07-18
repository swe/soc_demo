import { test, expect } from '@playwright/test'

function uniqueEmail() {
  return `m2.${Date.now()}.${Math.floor(Math.random() * 1e6)}@example.test`
}

/**
 * M2 acceptance: an admin (who also holds analyst permissions) processes an
 * alert end-to-end — triage → investigation → incident — and the audit trail
 * shows every step.
 */
test.describe('M2 workflow', () => {
  test('alert triage → investigation → promote → incident → audit trail', async ({ page }) => {
    const email = uniqueEmail()
    const password = 'workflow-password'

    // Register, create an org, seed demo data
    await page.goto('/signup')
    await page.locator('#email').fill(email)
    await page.locator('#name').fill('Iris')
    await page.locator('#surname').fill('Delgado')
    await page.locator('#password').fill(password)
    await page.getByRole('button', { name: /Sign Up/i }).click()

    await expect(page).toHaveURL(/\/onboarding/, { timeout: 30_000 })
    await page.locator('#org-name').fill('Meridian Financial Group')
    await page.getByRole('button', { name: /Create organization/i }).click()

    await expect(page.getByRole('button', { name: /Load demo data/i })).toBeVisible({ timeout: 30_000 })
    await page.getByRole('button', { name: /Load demo data/i }).click()
    await expect(page).toHaveURL(/\/overview$/, { timeout: 90_000 })

    // Open the alert queue, filter to NEW, open the first alert
    await page.goto('/overview/alerts')
    await page.getByLabel('Filter by status').selectOption('new')
    await expect(page.locator('table.soc-table tbody tr').first()).toBeVisible({ timeout: 30_000 })
    await page.locator('table.soc-table tbody tr').first().click()

    // Triage it (badge locator: plain text would match the hidden filter <option>)
    await page.getByRole('button', { name: 'Mark triaged', exact: true }).click()
    await expect(page.locator('.soc-badge', { hasText: 'TRIAGED' }).first()).toBeVisible({ timeout: 15_000 })

    // Add an analyst note
    await page.getByPlaceholder('Findings, context, next steps…').fill('Confirmed suspicious; opening a case.')
    await page.getByRole('button', { name: 'Save note' }).click()
    await expect(page.getByText('Note updated').first()).toBeVisible({ timeout: 15_000 })

    // Create an investigation from the alert
    await page.getByRole('button', { name: /Start investigation from this alert/i }).click()
    await expect(page.getByText('This alert is part of an active investigation.')).toBeVisible({ timeout: 15_000 })

    // Promote the investigation to an incident
    await page.getByRole('button', { name: /Promote to incident/i }).click()
    await expect(page.getByText(/Declared INC-\d+ from this investigation\./)).toBeVisible({ timeout: 15_000 })

    // The audit history preview in the modal shows the triage steps
    await expect(page.getByText('History')).toBeVisible()
    await expect(page.getByText('new → triaged').first()).toBeVisible()

    // The new incident is on the incidents page and can be moved to contained
    await page.goto('/overview/incidents')
    await expect(page.getByText(/INC-\d+/).first()).toBeVisible({ timeout: 30_000 })
    await page.getByRole('button', { name: 'Open', exact: true }).first().click()
    await expect(page.getByText('Response timeline')).toBeVisible({ timeout: 15_000 })

    const containButton = page.getByRole('button', { name: 'Mark contained', exact: true })
    if (await containButton.isVisible()) {
      await containButton.click()
      await expect(page.locator('.soc-badge', { hasText: 'CONTAINED' }).first()).toBeVisible({ timeout: 15_000 })
    }

    // The audit trail records the workflow (admin-only page)
    await page.goto('/overview/settings/audit')
    await expect(page.getByText('alert.triage').first()).toBeVisible({ timeout: 30_000 })
    await expect(page.getByText('investigation.create').first()).toBeVisible()
    await expect(page.getByText('incident.declare').first()).toBeVisible()
  })

  test('member invite link is generated from the members page', async ({ page }) => {
    const email = uniqueEmail()
    const password = 'workflow-password'

    await page.goto('/signup')
    await page.locator('#email').fill(email)
    await page.locator('#name').fill('Admin')
    await page.locator('#surname').fill('User')
    await page.locator('#password').fill(password)
    await page.getByRole('button', { name: /Sign Up/i }).click()

    await expect(page).toHaveURL(/\/onboarding/, { timeout: 30_000 })
    await page.locator('#org-name').fill('Invite Test Org')
    await page.getByRole('button', { name: /Create organization/i }).click()
    await expect(page.getByRole('button', { name: /Load demo data/i })).toBeVisible({ timeout: 30_000 })
    await page.getByRole('button', { name: /Start empty/i }).click()
    await expect(page).toHaveURL(/\/overview$/, { timeout: 30_000 })

    await page.goto('/overview/administration/members')
    await expect(page.getByText('INVITE A MEMBER')).toBeVisible({ timeout: 30_000 })
    await page.getByPlaceholder('name@company.com').fill(uniqueEmail())
    await page.getByRole('button', { name: /Create invite link/i }).click()
    await expect(page.getByText(/\/accept-invite\?token=/).first()).toBeVisible({ timeout: 15_000 })
  })
})
