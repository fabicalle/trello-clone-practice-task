import { test } from '@playwright/test';

test('screenshot boards', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/login');
  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/boards', { timeout: 6000 }).catch(() => {});
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'screenshots/manual/boards-auth.png', fullPage: false });
  
  // click first board if any
  const tiles = page.locator('.neon-board-tile');
  if (await tiles.count() > 0) {
    await tiles.first().click();
    await page.waitForTimeout(1200);
    await page.screenshot({ path: 'screenshots/manual/board-view-auth.png', fullPage: false });
  }
});
