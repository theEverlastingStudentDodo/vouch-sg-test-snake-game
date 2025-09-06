import { test, expect } from '@playwright/test';
import { SnakeGamePage } from '../pages/SnakeGamePage';
import { KEYBOARD_KEYS, TEST_TIMEOUTS } from '../utils/TestConstants';
import { GameTestUtils } from '../utils/GameTestUtils';

test.describe('Snake Game - Performance and Edge Cases', () => {
  let gamePage: SnakeGamePage;

  test.beforeEach(async ({ page }) => {
    gamePage = new SnakeGamePage(page);
    await gamePage.goto();
  });

  test('should handle rapid button clicking without breaking', async ({ page }) => {
    // Rapidly click start/pause/reset buttons
    for (let i = 0; i < 10; i++) {
      await gamePage.startGame();
      await page.waitForTimeout(50);
      await gamePage.pauseGame();
      await page.waitForTimeout(50);
      await gamePage.resetGame();
      await page.waitForTimeout(50);
    }
    
    // Game should still be functional
    await gamePage.startGame();
    expect(await gamePage.isGameStarted()).toBe(true);
  });

  test('should maintain performance under extended gameplay', async ({ page }) => {
    await gamePage.startGame();
    
    const performanceMonitor = GameTestUtils.createPerformanceMonitor();
    const testDuration = 5000; // 5 seconds
    const startTime = Date.now();
    
    while (Date.now() - startTime < testDuration) {
      const operationStart = performance.now();
      
      // Perform game actions
      const direction = ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'][Math.floor(Math.random() * 4)];
      await gamePage.pressArrowKey(direction as any);
      await page.waitForTimeout(100);
      
      const operationEnd = performance.now();
      performanceMonitor.record('gameAction', operationEnd - operationStart);
      
      // Check if game ended
      if (await gamePage.isGameOverVisible()) {
        await gamePage.playAgain();
      }
    }
    
    // Verify average performance was acceptable
    const averageActionTime = performanceMonitor.getAverageMetric('gameAction');
    expect(averageActionTime).toBeLessThan(200); // Should be responsive
  });

  test('should handle window resize during gameplay', async ({ page }) => {
    await gamePage.startGame();
    
    // Get initial viewport
    const initialViewport = page.viewportSize();
    
    // Resize window multiple times during gameplay
    const viewports = [
      { width: 800, height: 600 },
      { width: 1200, height: 800 },
      { width: 600, height: 400 },
      initialViewport
    ];
    
    for (const viewport of viewports) {
      if (viewport) {
        await page.setViewportSize(viewport);
        await page.waitForTimeout(100);
        
        // Continue playing
        await gamePage.pressArrowKey('ArrowRight');
        await page.waitForTimeout(50);
        
        // Verify game elements are still functional
        await expect(gamePage.gameCanvas).toBeVisible();
        expect(await gamePage.isGameStarted()).toBe(true);
      }
    }
  });

  test('should handle memory stress with multiple game sessions', async ({ page }) => {
    const sessionCount = 5;
    
    for (let session = 0; session < sessionCount; session++) {
      await gamePage.startGame();
      
      // Play a short session
      for (let i = 0; i < 20; i++) {
        const direction = ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'][i % 4];
        await gamePage.pressArrowKey(direction as any);
        await page.waitForTimeout(50);
        
        if (await gamePage.isGameOverVisible()) {
          await gamePage.playAgain();
          break;
        }
      }
      
      await gamePage.resetGame();
      await page.waitForTimeout(100);
    }
    
    // After multiple sessions, game should still work
    await gamePage.startGame();
    expect(await gamePage.isGameStarted()).toBe(true);
  });

  test('should handle extremely rapid input without crashes', async ({ page }) => {
    await gamePage.startGame();
    
    // Stress test with very rapid inputs
    const rapidTest = async () => {
      const keys = GameTestUtils.generateRandomKeySequence(100);
      await gamePage.simulateRapidKeyPresses(keys, 50);
    };
    
    const { duration } = await GameTestUtils.measurePerformance(rapidTest);
    
    // Should handle rapid input without crashing
    expect(await gamePage.isGameStarted()).toBe(true);
    expect(duration).toBeLessThan(1000); // Should complete quickly
  });

  test('should maintain state consistency after errors', async ({ page }) => {
    await gamePage.startGame();
    
    // Try to cause potential errors
    try {
      // Rapid state changes
      for (let i = 0; i < 5; i++) {
        await gamePage.pauseGame();
        await gamePage.pauseGame(); // Resume
        await page.waitForTimeout(10);
      }
      
      // Multiple rapid resets
      for (let i = 0; i < 3; i++) {
        await gamePage.resetGame();
        await gamePage.startGame();
        await page.waitForTimeout(50);
      }
    } catch (error) {
      // Errors might occur, but game should recover
    }
    
    // Verify game is in a consistent state
    await gamePage.resetGame();
    await expect(gamePage.startButton).toBeEnabled();
    await expect(gamePage.pauseButton).toBeDisabled();
    await expect(gamePage.scoreDisplay).toHaveText('0');
  });

  test('should handle page refresh during gameplay', async ({ page }) => {
    await gamePage.startGame();
    await page.waitForTimeout(500);
    
    // Refresh the page
    await page.reload();
    
    // Verify game loads correctly after refresh
    await expect(gamePage.gameTitle).toBeVisible();
    await expect(gamePage.gameCanvas).toBeVisible();
    await expect(gamePage.startButton).toBeEnabled();
    await expect(gamePage.scoreDisplay).toHaveText('0');
    
    // Should be able to start new game
    await gamePage.startGame();
    expect(await gamePage.isGameStarted()).toBe(true);
  });

  test('should handle simultaneous key presses', async ({ page }) => {
    await gamePage.startGame();
    
    // Test holding multiple keys simultaneously
    await page.keyboard.down('ArrowUp');
    await page.keyboard.down('ArrowRight');
    await page.waitForTimeout(200);
    await page.keyboard.up('ArrowUp');
    await page.keyboard.up('ArrowRight');
    
    // Test overlapping key presses
    await page.keyboard.down('ArrowDown');
    await page.waitForTimeout(100);
    await page.keyboard.down('ArrowLeft');
    await page.waitForTimeout(100);
    await page.keyboard.up('ArrowDown');
    await page.waitForTimeout(100);
    await page.keyboard.up('ArrowLeft');
    
    // Game should handle this gracefully
    expect(await gamePage.isGameStarted()).toBe(true);
  });


  test('should handle focus changes during gameplay', async ({ page }) => {
    await gamePage.startGame();
    
    // Change focus to different elements
    await gamePage.resetButton.focus();
    await page.waitForTimeout(100);
    await gamePage.pauseButton.focus();
    await page.waitForTimeout(100);
    
    // Game should still respond to keyboard input
    await gamePage.pressArrowKey('ArrowUp');
    await page.waitForTimeout(200);
    
    expect(await gamePage.isGameStarted()).toBe(true);
  });
});
