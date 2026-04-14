import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

// Login
await page.goto('http://localhost:5174/login');
await page.fill('input[type="email"]', 'test@example.com');
await page.fill('input[type="password"]', 'password123');
await page.click('button[type="submit"]');

try {
  await page.waitForURL('**/boards', { timeout: 5000 });
} catch {}

await page.waitForTimeout(900);
await page.screenshot({ path: 'screenshots/manual/boards-redesign.png' });

// Try to click a board
const boards = page.locator('[class*="neon-board-tile"]');
const count = await boards.count();
if (count > 0) {
  await boards.first().click();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: 'screenshots/manual/board-view-redesign.png' });
}

await browser.close();
