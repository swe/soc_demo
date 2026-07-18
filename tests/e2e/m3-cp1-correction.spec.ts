import { expect, test, type Page } from '@playwright/test'

/**
 * M3 Checkpoint 1 correction — dual-theme, accessibility, and stacking smoke
 * plus the component-state screenshot matrix (light + dark evidence).
 *
 * Evidence lands in docs/status/evidence/cp1-correction/<theme>/.
 */

const THEMES = ['light', 'dark'] as const
type Theme = (typeof THEMES)[number]

const EVIDENCE = 'docs/status/evidence/cp1-correction'

async function signIn(page: Page) {
  await page.goto('/signin')
  await page.locator('#email').fill('demo@svalbard.ca')
  await page.locator('#password').fill('Demo123')
  await page.getByRole('button', { name: /Sign In/i }).click()
  await expect(page).toHaveURL(/\/overview$/, { timeout: 30_000 })
}

async function setTheme(page: Page, theme: Theme) {
  await page.addInitScript((t) => {
    window.localStorage.setItem('theme', t)
  }, theme)
}

async function shot(page: Page, theme: Theme, name: string, clip?: { x: number; y: number; width: number; height: number }) {
  await page.screenshot({
    path: `${EVIDENCE}/${theme}/${name}.png`,
    animations: 'disabled',
    ...(clip ? { clip } : { fullPage: false }),
  })
}

/** Tab until the given locator is the focused element (bounded). */
async function tabTo(page: Page, testId: string, maxTabs = 40): Promise<boolean> {
  for (let i = 0; i < maxTabs; i++) {
    await page.keyboard.press('Tab')
    const focused = await page.evaluate(
      (id) => document.activeElement?.getAttribute('data-testid') === id
        || document.activeElement?.closest(`[data-testid="${id}"]`) !== null,
      testId,
    )
    if (focused) return true
  }
  return false
}

test.describe('M3 CP1 correction — behavior', () => {
  test.beforeAll(async () => {
    const { execSync } = await import('node:child_process')
    execSync('pnpm demo:setup', { stdio: 'inherit' })
  })

  test('skip link is hidden until keyboard focus, then moves focus to main', async ({ page }) => {
    await signIn(page)

    const skipLink = page.locator('.soc-skip-link')
    await expect(skipLink).toHaveCount(1)

    // Visually hidden by default: sr-only box collapses to 1x1.
    const hiddenBox = await skipLink.boundingBox()
    expect(hiddenBox).not.toBeNull()
    expect(hiddenBox!.width).toBeLessThanOrEqual(1)
    expect(hiddenBox!.height).toBeLessThanOrEqual(1)

    // First Tab lands on the skip link and reveals it.
    await page.keyboard.press('Tab')
    await expect(skipLink).toBeFocused()
    const focusedBox = await skipLink.boundingBox()
    expect(focusedBox!.width).toBeGreaterThan(40)
    expect(focusedBox!.height).toBeGreaterThan(10)

    // Activating it moves focus into the main content region.
    await page.keyboard.press('Enter')
    await expect(page.locator('#main-content')).toBeFocused()

    // After focus leaves, the link collapses again.
    await page.keyboard.press('Tab')
    const collapsedBox = await skipLink.boundingBox()
    expect(collapsedBox!.width).toBeLessThanOrEqual(1)
  })

  test('theme toggle switches html class and header stays readable', async ({ page }) => {
    await setTheme(page, 'light')
    await signIn(page)

    await expect(page.locator('html')).toHaveClass(/light/)
    const header = page.locator('header').first()
    const lightBg = await header.evaluate((el) => getComputedStyle(el).backgroundColor)

    await page.getByTestId('theme-toggle').click()
    await expect(page.locator('html')).toHaveClass(/dark/)
    const darkBg = await header.evaluate((el) => getComputedStyle(el).backgroundColor)
    expect(darkBg).not.toBe(lightBg)

    // Org/profile trigger text must contrast with the header in both themes.
    const trigger = page.getByTestId('profile-menu').locator('button').first()
    const colorDark = await trigger.evaluate((el) => getComputedStyle(el).color)
    await page.getByTestId('theme-toggle').click()
    await expect(page.locator('html')).toHaveClass(/light/)
    const colorLight = await trigger.evaluate((el) => getComputedStyle(el).color)
    expect(colorLight).not.toBe(colorDark)

    // Choice persists.
    expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe('light')
  })

  test('profile and org menus render professionally and close each other', async ({ page }) => {
    await signIn(page)

    const profileItems = page.getByRole('menu', { name: /^Account:/ })
    const orgMenu = page.getByRole('menu', { name: /^Organization:/ })

    // Profile menu: identity header, Settings, destructive Sign out.
    await page.getByTestId('profile-menu').locator('button').first().click()
    await expect(profileItems).toBeVisible()
    await expect(profileItems.getByText('demo@svalbard.ca')).toBeVisible()
    await expect(profileItems.getByRole('menuitem', { name: 'Settings' })).toBeVisible()
    await expect(profileItems.getByRole('menuitem', { name: 'Sign out' })).toBeVisible()

    // Clicking the org trigger must not leave both menus open. force: true —
    // the open menu's pointer guard intercepts hit-testing, which is exactly
    // the interaction under test (outside pointerdown dismisses the menu).
    await page.getByTestId('org-menu').locator('button').first().click({ force: true })
    await expect(profileItems).toHaveCount(0)

    // Org menu opens (retry once — first click may only dismiss the other menu).
    if (!(await orgMenu.isVisible().catch(() => false))) {
      await page.getByTestId('org-menu').locator('button').first().click()
    }
    await expect(orgMenu).toBeVisible()
    await expect(orgMenu.getByRole('menuitem', { name: 'New organization' })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(orgMenu).toHaveCount(0)
  })

  test('overlay stacking: menu above sticky header, modal above everything', async ({ page }) => {
    await signIn(page)
    await page.goto('/overview/alerts')
    await expect(page.locator('table.soc-table tbody tr').first()).toBeVisible({ timeout: 30_000 })

    // Open profile menu and verify its center is the topmost element (no
    // header, filter control, or table content covering it).
    await page.getByTestId('profile-menu').locator('button').first().click()
    const menu = page.getByRole('menu')
    await expect(menu).toBeVisible()
    const menuOnTop = await menu.evaluate((el) => {
      const r = el.getBoundingClientRect()
      const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
      return el.contains(top)
    })
    expect(menuOnTop).toBe(true)
    await page.keyboard.press('Escape')

    // Modal sits above the sticky header. (The dialog root is a zero-size
    // positioning wrapper — assert on its heading, which has a box.)
    await page.locator('table.soc-table tbody tr').first().click()
    const dialog = page.getByRole('dialog')
    await expect(dialog.getByRole('heading').first()).toBeVisible()
    const dialogOnTop = await dialog.evaluate(() => {
      const header = document.querySelector('header')
      if (!header) return true
      const r = header.getBoundingClientRect()
      const top = document.elementFromPoint(r.left + r.width / 2, Math.max(1, r.top + r.height / 2))
      return !header.contains(top)
    })
    expect(dialogOnTop).toBe(true)
    await page.keyboard.press('Escape')
    await expect(dialog).toHaveCount(0)
  })
})

for (const theme of THEMES) {
  test.describe(`M3 CP1 correction — state matrix (${theme})`, () => {
    test(`captures component states in ${theme}`, async ({ page }) => {
      await setTheme(page, theme)
      await signIn(page)
      await expect(page.locator('html')).toHaveClass(new RegExp(theme))

      const headerClip = { x: 0, y: 0, width: 1280, height: 56 }
      const headerMenuClip = { x: 640, y: 0, width: 640, height: 360 }
      const sidebarClip = { x: 0, y: 0, width: 240, height: 720 }

      const orgMenu = page.getByRole('menu', { name: /^Organization:/ })
      const profileMenu = page.getByRole('menu', { name: /^Account:/ })

      /* ── Header ── */
      await shot(page, theme, '01-header-default', headerClip)

      await page.getByTestId('org-menu').locator('button').first().click()
      await expect(orgMenu.getByRole('menuitem', { name: 'New organization' })).toBeVisible()
      await expect(orgMenu).not.toHaveAttribute('data-closed')
      await shot(page, theme, '02-header-org-menu-open', headerMenuClip)
      await page.keyboard.press('Escape')
      await expect(orgMenu).toHaveCount(0)

      await page.getByTestId('profile-menu').locator('button').first().click()
      await expect(profileMenu.getByRole('menuitem', { name: 'Sign out' })).toBeVisible()
      await expect(profileMenu).not.toHaveAttribute('data-closed')
      await shot(page, theme, '03-header-profile-menu-open', headerMenuClip)

      /* ── Menus: hovered / focused / destructive rows ── */
      const menu = profileMenu
      await menu.getByRole('menuitem', { name: 'Settings' }).hover()
      await shot(page, theme, '04-menu-item-hovered', headerMenuClip)
      await page.keyboard.press('ArrowDown')
      await shot(page, theme, '05-menu-item-focused', headerMenuClip)
      await menu.getByRole('menuitem', { name: 'Sign out' }).hover()
      await shot(page, theme, '06-menu-item-destructive-hover', headerMenuClip)
      await page.keyboard.press('Escape')
      await expect(profileMenu).toHaveCount(0)

      /* ── Header keyboard focus on triggers ── */
      if (await tabTo(page, 'theme-toggle')) {
        await shot(page, theme, '07-header-theme-toggle-focus', headerClip)
      }
      if (await tabTo(page, 'org-menu', 3)) {
        await shot(page, theme, '08-header-org-trigger-focus', headerClip)
      }

      /* ── Sidebar: default, hover, active, keyboard focus, headings ── */
      await shot(page, theme, '09-sidebar-default-active-headings', sidebarClip)
      await page.getByRole('navigation', { name: 'Product' }).getByRole('link', { name: 'Incidents' }).hover()
      await shot(page, theme, '10-sidebar-item-hover', sidebarClip)
      await page.getByRole('navigation', { name: 'Product' }).getByRole('link', { name: 'Alerts' }).focus()
      await page.keyboard.press('Shift+Tab')
      await page.keyboard.press('Tab')
      await shot(page, theme, '11-sidebar-item-keyboard-focus', sidebarClip)

      /* ── Alerts page: controls + hierarchy ── */
      await page.goto('/overview/alerts')
      await expect(page.locator('table.soc-table tbody tr').first()).toBeVisible({ timeout: 30_000 })
      await shot(page, theme, '12-alerts-page')
      await page.screenshot({ path: `${EVIDENCE}/${theme}/13-alerts-page-full.png`, fullPage: true, animations: 'disabled' })

      const search = page.getByLabel('Search alerts')
      const controlsClip = { x: 0, y: 0, width: 1280, height: 260 }
      await search.focus()
      await shot(page, theme, '14-search-focus', controlsClip)
      await search.fill('login')
      await shot(page, theme, '15-search-typed', controlsClip)
      await search.fill('')
      await search.evaluate((el) => (el as HTMLInputElement).setAttribute('disabled', ''))
      await shot(page, theme, '16-search-disabled', controlsClip)
      await search.evaluate((el) => (el as HTMLInputElement).removeAttribute('disabled'))

      const severity = page.getByLabel('Filter by severity')
      await shot(page, theme, '17-filter-select-closed', controlsClip)
      await severity.focus()
      await shot(page, theme, '18-filter-select-focus', controlsClip)
      await severity.selectOption('critical')
      await shot(page, theme, '19-filter-select-selected', controlsClip)
      await severity.selectOption('')

      /* ── Accessibility: skip link ── */
      await page.goto('/overview')
      await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 30_000 })
      await shot(page, theme, '20-skip-link-hidden', headerClip)
      await page.keyboard.press('Tab')
      await expect(page.locator('.soc-skip-link')).toBeFocused()
      await shot(page, theme, '21-skip-link-focused', { x: 0, y: 0, width: 640, height: 120 })
      await page.keyboard.press('Enter')
      await expect(page.locator('#main-content')).toBeFocused()
      await shot(page, theme, '22-main-focused-after-skip', headerClip)

      /* ── Narrow viewport: header + menu ── */
      await page.setViewportSize({ width: 375, height: 812 })
      await page.getByTestId('profile-menu').locator('button').first().click()
      await expect(profileMenu).toBeVisible()
      await shot(page, theme, '23-narrow-profile-menu')
      await page.keyboard.press('Escape')
    })
  })
}
