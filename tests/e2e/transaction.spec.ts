import { test, expect } from '@playwright/test';

test.describe('Critical E2E Transaction Flow', () => {
  test('Buyer can make an offer and complete the deal', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="email"]', 'priya@pondiuni.ac.in');
    await page.fill('input[type="password"]', 'password123');
    await page.getByRole('button', { name: 'Sign in securely' }).click();
    await expect(page).toHaveURL('http://localhost:5173/dashboard');

    await page.goto('http://localhost:5173/browse');
    await page.click('text=Casio FX-991ES Plus');
    await page.getByLabel('Your offer (₹)').fill('550');
    await page.getByLabel('Campus pickup spot').fill('Main Canteen');
    await page.locator('input[type="date"]').fill('2026-10-10');
    await page.locator('input[type="time"]').fill('18:30');
    await page.getByRole('button', { name: 'Send offer' }).click();
    await expect(page.getByText('Your offer has been sent to the seller.')).toBeVisible();
  });
});
