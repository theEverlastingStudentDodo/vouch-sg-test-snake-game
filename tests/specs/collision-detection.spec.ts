import { test, expect } from '@playwright/test';
import { SnakeGamePage } from '../pages/SnakeGamePage';
import { GAME_CONFIG, TEST_TIMEOUTS } from '../utils/TestConstants';

test.describe('Snake Game - Collision Detection', () => {
  let gamePage: SnakeGamePage;

  test.beforeEach(async ({ page }) => {
    gamePage = new SnakeGamePage(page);
    await gamePage.goto();
  });

  test('should detect wall collision - top wall', async ({ page }) => {
    await gamePage.startGame();
    
    // Move snake up repeatedly to hit top wall
    for (let i = 0; i < 15; i++) {
      await gamePage.pressArrowKey('ArrowUp');
      await page.waitForTimeout(150);
      
      // Check if game ended
      if (await gamePage.isGameOverVisible()) {
        break;
      }
    }
    
    // Game should end due to wall collision
    await expect(gamePage.gameOverModal).toBeVisible({ timeout: TEST_TIMEOUTS.MEDIUM });
    expect(await gamePage.isGameStarted()).toBe(false);
  });

  test('should detect wall collision - bottom wall', async ({ page }) => {
    await gamePage.startGame();
    
    // Move snake down repeatedly to hit bottom wall
    for (let i = 0; i < 15; i++) {
      await gamePage.pressArrowKey('ArrowDown');
      await page.waitForTimeout(150);
      
      if (await gamePage.isGameOverVisible()) {
        break;
      }
    }
    
    await expect(gamePage.gameOverModal).toBeVisible({ timeout: TEST_TIMEOUTS.MEDIUM });
  });

  test('should detect wall collision - left wall', async ({ page }) => {
    await gamePage.startGame();
    
    // First move up to change direction, then left
    await gamePage.pressArrowKey('ArrowUp');
    await page.waitForTimeout(200);
    
    for (let i = 0; i < 15; i++) {
      await gamePage.pressArrowKey('ArrowLeft');
      await page.waitForTimeout(150);
      
      if (await gamePage.isGameOverVisible()) {
        break;
      }
    }
    
    await expect(gamePage.gameOverModal).toBeVisible({ timeout: TEST_TIMEOUTS.MEDIUM });
  });

  test('should detect wall collision - right wall', async ({ page }) => {
    await gamePage.startGame();
    
    // Snake starts moving right by default
    for (let i = 0; i < 15; i++) {
      await gamePage.pressArrowKey('ArrowRight');
      await page.waitForTimeout(150);
      
      if (await gamePage.isGameOverVisible()) {
        break;
      }
    }
    
    await expect(gamePage.gameOverModal).toBeVisible({ timeout: TEST_TIMEOUTS.MEDIUM });
  });

  test('should show proper game over screen', async ({ page }) => {
    await gamePage.startGame();
    
    // Force a collision quickly
    for (let i = 0; i < 15; i++) {
      await gamePage.pressArrowKey('ArrowUp');
      await page.waitForTimeout(100);
      
      if (await gamePage.isGameOverVisible()) {
        break;
      }
    }
    
    // Verify game over modal content
    await expect(gamePage.gameOverModal).toBeVisible();
    await expect(gamePage.gameOverModal).toContainText('Game Over!');
    await expect(gamePage.finalScoreDisplay).toBeVisible();
    await expect(gamePage.playAgainButton).toBeVisible();
    await expect(gamePage.playAgainButton).toBeEnabled();
  });

  test('should reset game state after collision', async ({ page }) => {
    await gamePage.startGame();
    
    // Force collision
    for (let i = 0; i < 15; i++) {
      await gamePage.pressArrowKey('ArrowUp');
      await page.waitForTimeout(100);
      
      if (await gamePage.isGameOverVisible()) {
        break;
      }
    }
    
    // Wait for game over
    await expect(gamePage.gameOverModal).toBeVisible();
    
    // Play again should reset everything
    await gamePage.playAgain();
    
    // Verify reset state
    await expect(gamePage.gameOverModal).toBeHidden();
    expect(await gamePage.isGameStarted()).toBe(true);
    await expect(gamePage.startButton).toBeDisabled();
    await expect(gamePage.pauseButton).toBeEnabled();
  });

  test('should handle collision at exact boundary', async ({ page }) => {
    await gamePage.startGame();
    
    // Move exactly to the edge and verify collision detection
    let collisionDetected = false;
    
    for (let i = 0; i < 20; i++) {
      await gamePage.pressArrowKey('ArrowUp');
      await page.waitForTimeout(120);
      
      if (await gamePage.isGameOverVisible()) {
        collisionDetected = true;
        break;
      }
    }
    
    expect(collisionDetected).toBe(true);
  });

  test('should maintain collision detection across different speeds', async ({ page }) => {
    await gamePage.startGame();
    
    // Try to trigger collision with rapid inputs
    const rapidMoves = async () => {
      for (let i = 0; i < 25; i++) {
        await gamePage.pressArrowKey('ArrowUp');
        await page.waitForTimeout(50);
        
        if (await gamePage.isGameOverVisible()) {
          return true;
        }
      }
      return false;
    };
    
    const collisionDetected = await rapidMoves();
    expect(collisionDetected).toBe(true);
  });

  test('should show correct final score on game over', async ({ page }) => {
    await gamePage.startGame();
    const initialScore = await gamePage.getCurrentScore();
    
    // Force collision
    for (let i = 0; i < 15; i++) {
      await gamePage.pressArrowKey('ArrowDown');
      await page.waitForTimeout(100);
      
      if (await gamePage.isGameOverVisible()) {
        break;
      }
    }
    
    await expect(gamePage.gameOverModal).toBeVisible();
    
    const finalScore = await gamePage.getFinalScore();
    const currentScore = await gamePage.getCurrentScore();
    
    // Final score should match current score
    expect(finalScore).toEqual(currentScore);
    expect(finalScore).toBeGreaterThanOrEqual(initialScore);
  });

  test('should handle corner collisions correctly', async ({ page }) => {
    await gamePage.startGame();
    
    // Try to reach a corner by alternating directions
    const cornerSequence = ['ArrowUp', 'ArrowLeft', 'ArrowUp', 'ArrowLeft', 'ArrowUp', 'ArrowLeft'];
    
    for (const direction of cornerSequence) {
      for (let i = 0; i < 5; i++) {
        await gamePage.pressArrowKey(direction as any);
        await page.waitForTimeout(150);
        
        if (await gamePage.isGameOverVisible()) {
          return; // Test passed - collision detected
        }
      }
    }
    
    // Additional moves to ensure collision
    for (let i = 0; i < 10; i++) {
      await gamePage.pressArrowKey('ArrowUp');
      await page.waitForTimeout(150);
      
      if (await gamePage.isGameOverVisible()) {
        break;
      }
    }
    
    await expect(gamePage.gameOverModal).toBeVisible();
  });

  test('should reset button work after collision', async ({ page }) => {
    await gamePage.startGame();
    
    // Force collision
    for (let i = 0; i < 15; i++) {
      await gamePage.pressArrowKey('ArrowUp');
      await page.waitForTimeout(100);
      
      if (await gamePage.isGameOverVisible()) {
        break;
      }
    }
    
    await expect(gamePage.gameOverModal).toBeVisible();
    
    // Use reset button instead of play again
    await gamePage.resetGame();
    
    // Verify game is reset
    await expect(gamePage.gameOverModal).toBeHidden();
    await expect(gamePage.startButton).toBeEnabled();
    await expect(gamePage.pauseButton).toBeDisabled();
    await expect(gamePage.scoreDisplay).toHaveText('0');
  });
});
