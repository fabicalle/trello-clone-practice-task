import { test } from '@playwright/test';

const BASE = 'http://localhost:5174';
const OUT = (name: string) => `../screenshots/manual/${name}`;

test('screenshot all redesigned pages', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });

  // 1. Login page
  await page.goto(`${BASE}/login`);
  await page.waitForTimeout(600);
  await page.screenshot({ path: OUT('01-login.png') });

  // 2. Register page
  await page.goto(`${BASE}/register`);
  await page.waitForTimeout(600);
  await page.screenshot({ path: OUT('02-register.png') });

  // 3. Log in via form
  await page.goto(`${BASE}/login`);
  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForURL(`${BASE}/boards`, { timeout: 8000 });
  await page.waitForTimeout(900);

  // 4. Boards page
  await page.screenshot({ path: OUT('03-boards.png') });

  // 5. Board view — click first tile
  await page.locator('.neon-board-tile').first().click();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: OUT('04-board-view.png') });

  // 6. Card modal — click first card
  await page.locator('.neon-card').first().click();
  await page.waitForTimeout(700);
  await page.screenshot({ path: OUT('05-card-modal-top.png') });

  // Scroll modal overlay to show comments section
  await page.evaluate(() => {
    const overlay = document.querySelector('.fixed.overflow-y-auto');
    if (overlay) overlay.scrollTop = overlay.scrollHeight;
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: OUT('05-card-modal.png') });
});
