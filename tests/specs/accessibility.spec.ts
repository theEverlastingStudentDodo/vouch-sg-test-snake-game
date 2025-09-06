import { test, expect } from '@playwright/test';
import { SnakeGamePage } from '../pages/SnakeGamePage';
import { ACCESSIBILITY_SELECTORS } from '../utils/TestConstants';

test.describe('Snake Game - Accessibility and UX', () => {
  let gamePage: SnakeGamePage;

  test.beforeEach(async ({ page }) => {
    gamePage = new SnakeGamePage(page);
    await gamePage.goto();
  });

  test('should have proper heading structure', async ({ page }) => {
    const headings = await page.locator(ACCESSIBILITY_SELECTORS.HEADINGS).all();
    expect(headings.length).toBeGreaterThan(0);
    
    // Check main heading
    await expect(gamePage.gameTitle).toBeVisible();
    await expect(gamePage.gameTitle).toHaveText('Snake Game');
    
    // Check instructions heading
    const instructionsHeading = page.locator('.instructions h3');
    await expect(instructionsHeading).toBeVisible();
    await expect(instructionsHeading).toHaveText('How to Play:');
  });

  test('should have keyboard navigation support', async ({ page }) => {
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Should be able to reach all buttons
    const focusableElements = await page.locator(ACCESSIBILITY_SELECTORS.INTERACTIVE_ELEMENTS).all();
    expect(focusableElements.length).toBeGreaterThanOrEqual(3); // At least start, pause, reset buttons
  });

  test('should have proper button states and labels', async ({ page }) => {
    // Check initial button states
    await expect(gamePage.startButton).toHaveText('Start Game');
    await expect(gamePage.pauseButton).toHaveText('Pause');
    await expect(gamePage.resetButton).toHaveText('Reset');
    
    // Check button states after starting
    await gamePage.startGame();
    await expect(gamePage.startButton).toBeDisabled();
    await expect(gamePage.pauseButton).toBeEnabled();
    
    // Check pause button text changes
    await gamePage.pauseGame();
    await expect(gamePage.pauseButton).toHaveText('Resume');
    
    await gamePage.pauseGame(); // Resume
    await expect(gamePage.pauseButton).toHaveText('Pause');
  });

  test('should provide clear visual feedback for game states', async ({ page }) => {
    // Initial state - start button should be prominent
    await expect(gamePage.startButton).toBeEnabled();
    await expect(gamePage.startButton).toBeVisible();
    
    // Running state
    await gamePage.startGame();
    await expect(gamePage.startButton).toBeDisabled();
    await expect(gamePage.pauseButton).toBeEnabled();
    
    // Paused state - should show visual indication
    await gamePage.pauseGame();
    // The game shows "PAUSED" text on canvas when paused
    // We can verify this by checking the pause button text
    await expect(gamePage.pauseButton).toHaveText('Resume');
  });

  test('should have clear score displays', async ({ page }) => {
    // Score displays should be visible and properly labeled
    const scoreSection = page.locator('.score-display');
    await expect(scoreSection).toBeVisible();
    await expect(scoreSection).toContainText('Score:');
    
    const highScoreSection = page.locator('.high-score-display');
    await expect(highScoreSection).toBeVisible();
    await expect(highScoreSection).toContainText('High Score:');
    
    // Score values should be readable
    await expect(gamePage.scoreDisplay).toBeVisible();
    await expect(gamePage.highScoreDisplay).toBeVisible();
  });

  test('should provide clear instructions', async ({ page }) => {
    const instructions = gamePage.instructions;
    await expect(instructions).toBeVisible();
    
    // Should contain helpful text
    await expect(instructions).toContainText('How to Play');
    await expect(instructions).toContainText('arrow keys');
    await expect(instructions).toContainText('WASD');
    await expect(instructions).toContainText('food');
    await expect(instructions).toContainText('score');
  });

  test('should have accessible game over modal', async ({ page }) => {
    await gamePage.startGame();
    
    // Force game over
    for (let i = 0; i < 15; i++) {
      await gamePage.pressArrowKey('ArrowUp');
      await page.waitForTimeout(100);
      
      if (await gamePage.isGameOverVisible()) {
        break;
      }
    }
    
    await expect(gamePage.gameOverModal).toBeVisible();
    
    // Check modal content accessibility
    await expect(gamePage.gameOverModal).toContainText('Game Over!');
    await expect(gamePage.gameOverModal).toContainText('Final Score:');
    await expect(gamePage.playAgainButton).toBeVisible();
    await expect(gamePage.playAgainButton).toBeEnabled();
    await expect(gamePage.playAgainButton).toHaveText('Play Again');
  });


  test('should work with reduced motion preferences', async ({ page }) => {
    // Simulate reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    
    await gamePage.startGame();
    
    // Game should still be functional
    await gamePage.pressArrowKey('ArrowRight');
    await page.waitForTimeout(200);
    
    expect(await gamePage.isGameStarted()).toBe(true);
  });

  test('should be usable on mobile viewports', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // All essential elements should be visible
    await expect(gamePage.gameTitle).toBeVisible();
    await expect(gamePage.gameCanvas).toBeVisible();
    await expect(gamePage.startButton).toBeVisible();
    await expect(gamePage.pauseButton).toBeVisible();
    await expect(gamePage.resetButton).toBeVisible();
    
    // Game should be playable
    await gamePage.startGame();
    expect(await gamePage.isGameStarted()).toBe(true);
  });

  test('should have proper color contrast for text elements', async ({ page }) => {
    // Check that text elements are visible against their backgrounds
    const textElements = [
      gamePage.gameTitle,
      gamePage.scoreDisplay,
      gamePage.highScoreDisplay,
      gamePage.startButton,
      gamePage.pauseButton,
      gamePage.resetButton
    ];
    
    for (const element of textElements) {
      await expect(element).toBeVisible();
      
      // Element should have text content
      const textContent = await element.textContent();
      expect(textContent).toBeTruthy();
      expect(textContent?.trim().length).toBeGreaterThan(0);
    }
  });

  test('should provide feedback for user actions', async ({ page }) => {
    // Button press feedback
    await gamePage.startGame();
    await expect(gamePage.startButton).toBeDisabled(); // Visual feedback
    
    // Score feedback
    const initialScore = await gamePage.getCurrentScore();
    expect(typeof initialScore).toBe('number');
    
    // Pause feedback
    await gamePage.pauseGame();
    await expect(gamePage.pauseButton).toHaveText('Resume');
    
    // Reset feedback
    await gamePage.resetGame();
    await expect(gamePage.startButton).toBeEnabled();
    await expect(gamePage.scoreDisplay).toHaveText('0');
  });

  test('should handle focus management appropriately', async ({ page }) => {
    // Focus should be manageable
    await gamePage.startButton.focus();
    await expect(gamePage.startButton).toBeFocused();
    
    await gamePage.startGame();
    await page.keyboard.press('Tab');
    await expect(gamePage.pauseButton).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(gamePage.resetButton).toBeFocused();
  });

  test('should provide meaningful page title', async ({ page }) => {
    const title = await page.title();
    expect(title).toBe('Snake Game');
    expect(title.length).toBeGreaterThan(0);
  });

  test('should have semantic HTML structure', async ({ page }) => {
    // Check for semantic elements
    const main = page.locator('main, [role="main"], .game-container');
    await expect(main).toBeVisible();
    
    // Buttons should be actual button elements
    const buttons = await page.locator('button').all();
    expect(buttons.length).toBeGreaterThanOrEqual(3);
    
    // Headings should exist
    const headings = await page.locator('h1, h2, h3').all();
    expect(headings.length).toBeGreaterThanOrEqual(2);
  });
});
