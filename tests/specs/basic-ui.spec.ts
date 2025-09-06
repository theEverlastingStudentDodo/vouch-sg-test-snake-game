import { test, expect } from '@playwright/test';
import { SnakeGamePage } from '../pages/SnakeGamePage';
import { GAME_CONFIG, TEST_TIMEOUTS } from '../utils/TestConstants';

test.describe('Snake Game - Basic UI and Functionality', () => {
  let gamePage: SnakeGamePage;

  test.beforeEach(async ({ page }) => {
    gamePage = new SnakeGamePage(page);
    await gamePage.goto();
  });

  test('should load the game page with all UI elements', async () => {
    // Verify page title
    await expect(gamePage.gameTitle).toBeVisible();
    await expect(gamePage.gameTitle).toHaveText('Snake Game');

    // Verify game canvas
    await expect(gamePage.gameCanvas).toBeVisible();
    await expect(gamePage.gameCanvas).toHaveAttribute('width', GAME_CONFIG.CANVAS_SIZE.toString());
    await expect(gamePage.gameCanvas).toHaveAttribute('height', GAME_CONFIG.CANVAS_SIZE.toString());

    // Verify control buttons
    await expect(gamePage.startButton).toBeVisible();
    await expect(gamePage.startButton).toBeEnabled();
    await expect(gamePage.pauseButton).toBeVisible();
    await expect(gamePage.pauseButton).toBeDisabled();
    await expect(gamePage.resetButton).toBeVisible();
    await expect(gamePage.resetButton).toBeEnabled();

    // Verify score displays
    await expect(gamePage.scoreDisplay).toBeVisible();
    await expect(gamePage.highScoreDisplay).toBeVisible();
    await expect(gamePage.scoreDisplay).toHaveText('0');

    // Verify instructions
    await expect(gamePage.instructions).toBeVisible();
    await expect(gamePage.instructions).toContainText('How to Play');

    // Verify game over modal is hidden
    await expect(gamePage.gameOverModal).toBeHidden();
  });

  test('should start the game when start button is clicked', async () => {
    await gamePage.startGame();

    // Verify game state changes
    await expect(gamePage.startButton).toBeDisabled();
    await expect(gamePage.pauseButton).toBeEnabled();
    expect(await gamePage.isGameStarted()).toBe(true);
  });

  test('should reset the game to initial state', async () => {
    // Start the game first
    await gamePage.startGame();
    await expect(gamePage.startButton).toBeDisabled();

    // Reset the game
    await gamePage.resetGame();

    // Verify reset state
    await expect(gamePage.startButton).toBeEnabled();
    await expect(gamePage.pauseButton).toBeDisabled();
    await expect(gamePage.scoreDisplay).toHaveText('0');
    expect(await gamePage.isGameStarted()).toBe(false);
  });

  test('should pause and resume the game', async () => {
    await gamePage.startGame();
    
    // Pause the game
    await gamePage.pauseGame();
    expect(await gamePage.isGamePaused()).toBe(true);
    await expect(gamePage.pauseButton).toHaveText('Resume');

    // Resume the game
    await gamePage.pauseGame();
    expect(await gamePage.isGamePaused()).toBe(false);
    await expect(gamePage.pauseButton).toHaveText('Pause');
  });

  test('should maintain score display format', async () => {
    const score = await gamePage.getCurrentScore();
    expect(typeof score).toBe('number');
    expect(score).toBeGreaterThanOrEqual(0);

    const highScore = await gamePage.getHighScore();
    expect(typeof highScore).toBe('number');
    expect(highScore).toBeGreaterThanOrEqual(0);
  });

  test('should handle multiple quick start/reset cycles', async () => {
    for (let i = 0; i < 5; i++) {
      await gamePage.startGame();
      await expect(gamePage.startButton).toBeDisabled();
      
      await gamePage.resetGame();
      await expect(gamePage.startButton).toBeEnabled();
      await expect(gamePage.scoreDisplay).toHaveText('0');
    }
  });

  test('should preserve high score across resets', async () => {
    const initialHighScore = await gamePage.getHighScore();
    
    // Reset multiple times
    for (let i = 0; i < 3; i++) {
      await gamePage.resetGame();
      const currentHighScore = await gamePage.getHighScore();
      expect(currentHighScore).toEqual(initialHighScore);
    }
  });

  test('should have proper button states during game flow', async () => {
    // Initial state
    await expect(gamePage.startButton).toBeEnabled();
    await expect(gamePage.pauseButton).toBeDisabled();
    await expect(gamePage.resetButton).toBeEnabled();

    // After starting
    await gamePage.startGame();
    await expect(gamePage.startButton).toBeDisabled();
    await expect(gamePage.pauseButton).toBeEnabled();
    await expect(gamePage.resetButton).toBeEnabled();

    // After pausing
    await gamePage.pauseGame();
    await expect(gamePage.startButton).toBeDisabled();
    await expect(gamePage.pauseButton).toBeEnabled();
    await expect(gamePage.resetButton).toBeEnabled();

    // After resetting
    await gamePage.resetGame();
    await expect(gamePage.startButton).toBeEnabled();
    await expect(gamePage.pauseButton).toBeDisabled();
    await expect(gamePage.resetButton).toBeEnabled();
  });
});
