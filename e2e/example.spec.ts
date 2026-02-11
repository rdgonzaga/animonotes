import { test, expect } from '@playwright/test';

test.describe('Hase Forum Homepage', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');
    
    // Check that the page title is correct
    await expect(page).toHaveTitle('Hase Forum');
  });

  test('should display the main heading', async ({ page }) => {
    await page.goto('/');
    
    // Check for the main heading
    const heading = page.locator('h1');
    await expect(heading).toContainText('Hase Forum');
  });

  test('should display welcome message', async ({ page }) => {
    await page.goto('/');
    
    // Check for welcome text
    const content = page.locator('main');
    await expect(content).toContainText('Setup complete');
  });
});
