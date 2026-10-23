import { expect, test } from '@playwright/test'

test('workspace is gated until Supabase is configured and authenticated', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.backend-screen')).toBeVisible()
  const heading = await page.locator('.backend-card h1').innerText()
  expect(heading).toMatch(/Connect the workspace|Sign in to your workspace|Could not connect to Supabase/)

  if (heading === 'Sign in to your workspace') {
    await expect(page.getByLabel('Email address')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await page.getByRole('button', { name: 'Create an account' }).click()
    await expect(page.getByRole('heading', { name: 'Create your workspace account' })).toBeVisible()
  }
})
