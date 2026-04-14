import { test } from '@playwright/test';

const BASE = 'http://localhost:5174';
const OUT = (name: string) => `../screenshots/manual/${name}`;

test('screenshot dark and light themes', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });

  // ── DARK MODE (default) ──────────────────────────────────────────────────
  // Log in
  await page.goto(`${BASE}/login`);
  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForURL(`${BASE}/boards`, { timeout: 8000 });
  await page.waitForTimeout(800);
  await page.screenshot({ path: OUT('dark-boards.png') });

  await page.locator('.neon-board-tile').first().click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: OUT('dark-board-view.png') });

  // ── LIGHT MODE ───────────────────────────────────────────────────────────
  // Click the theme toggle button
  await page.locator('button.theme-toggle').click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: OUT('light-board-view.png') });

  // Go to boards
  await page.goto(`${BASE}/boards`);
  await page.waitForTimeout(600);
  await page.screenshot({ path: OUT('light-boards.png') });

  // Open card modal
  await page.locator('.neon-board-tile').first().click();
  await page.waitForTimeout(1000);
  await page.locator('.neon-card').first().click();
  await page.waitForTimeout(700);
  await page.screenshot({ path: OUT('light-card-modal.png') });

  // Login page in light mode
  await page.goto(`${BASE}/login`);
  await page.waitForTimeout(500);
  await page.screenshot({ path: OUT('light-login.png') });
});
