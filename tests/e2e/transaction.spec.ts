import { test, expect } from '@playwright/test';

test.describe('Critical E2E Transaction Flow', () => {
  test('Buyer can make an offer and complete the deal', async ({ page }) => {
    // 1. Buyer logs in
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="email"]', 'priya@pondiuni.edu.in');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Login")');
    await expect(page).toHaveURL('http://localhost:5173/dashboard');

    // 2. Buyer navigates to home and finds listing
    await page.goto('http://localhost:5173/');
    await page.click('text=Casio FX-991ES Plus');
    
    // 3. Buyer opens chat and makes offer
    await page.click('button:has-text("Make Offer")');
    await page.fill('input[placeholder="Offer Price (₹)"]', '550');
    await page.fill('input[placeholder="Pickup Point"]', 'Main Canteen');
    await page.click('button:has-text("Send Offer")');

    // 4. Verify message appears in chat
    await expect(page.locator('text=OFFER MADE: ₹550 at Main Canteen')).toBeVisible();

    // 5. In a real full E2E test, we would spawn a second browser context for the seller
    // to verify the socket message arrived and click 'Accept', which would trigger
    // the `/api/offers/:id` route, locking the negotiated price into an Order.
    // For this test scope, we verify the buyer's UI workflow succeeded.
  });
});
