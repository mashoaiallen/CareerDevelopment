import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.route('**/rest/v1/portfolio_public**', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: '[]',
  }))
})

test('public visitors enter the portfolio without an account and cannot edit records', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Welcome to my engineering portfolio.' })).toBeVisible()
  await expect(page.getByText('INSIDE THE PORTFOLIO')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Projects & technical work' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Administrator sign in' })).toBeVisible()
  await expect(page.getByText(/Create an account|Create account/i)).toHaveCount(0)

  await page.getByRole('link', { name: 'Enter the portfolio' }).click()
  await expect(page.getByRole('heading', { name: /Building toward/ })).toBeVisible()
  await page.getByRole('link', { name: 'Career roadmap', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Career roadmap' })).toBeVisible()
  await expect(page.locator('.stage-dates input')).toHaveCount(0)

  await page.getByRole('link', { name: 'Technical skills', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Technical skills' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Add skill' })).toHaveCount(0)
  await expect(page.locator('.skill-card .icon-button')).toHaveCount(0)

  await page.getByRole('link', { name: 'Projects', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Projects', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'New project' })).toHaveCount(0)
  await page.getByRole('button', { name: 'Open project details' }).first().click()
  await expect(page.getByRole('button', { name: 'Edit project' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Add report' })).toHaveCount(0)

  await page.getByRole('link', { name: 'Learning & research' }).click()
  await expect(page.getByRole('heading', { name: 'Learning & research' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Add learning record' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'New report' })).toHaveCount(0)

  await page.getByRole('link', { name: 'Leadership', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Leadership development' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Edit reflection' })).toHaveCount(0)

  await page.getByRole('link', { name: 'About', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'About Allen' })).toBeVisible()
  await expect(page.locator('.about-grid input, .about-grid textarea')).toHaveCount(0)

  await page.getByRole('link', { name: 'My work' }).click()
  await expect(page.getByRole('heading', { name: 'My work' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Add task' })).toHaveCount(0)
})
