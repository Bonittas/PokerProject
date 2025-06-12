import { test, expect } from '@playwright/test';

test('play a complete poker hand', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Start the game
  const startButton = page.getByRole('button', { name: /start/i });
  await startButton.click();

  // Confirm log initialized
  await expect(page.locator('text=Dealer:')).toBeVisible();

  // Play Fold for all players until hand ends
  const foldButton = page.getByRole('button', { name: /fold/i });
  for (let i = 0; i < 6; i++) {
    await foldButton.click();
  }

  // Expect "Hand complete" to appear in log
  await expect(page.locator('text=Hand complete')).toBeVisible();

  // Check that a hand appears in the hand history
  await expect(page.getByText(/Hand ID:/)).toBeVisible();
});
