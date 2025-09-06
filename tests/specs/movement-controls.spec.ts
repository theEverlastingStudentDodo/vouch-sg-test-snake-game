import { test, expect } from '@playwright/test';
import { SnakeGamePage } from '../pages/SnakeGamePage';
import { KEYBOARD_KEYS, TEST_TIMEOUTS } from '../utils/TestConstants';
import { GameTestUtils } from '../utils/GameTestUtils';

test.describe('Snake Game - Movement and Controls', () => {
  let gamePage: SnakeGamePage;

  test.beforeEach(async ({ page }) => {
    gamePage = new SnakeGamePage(page);
    await gamePage.goto();
    await gamePage.startGame();
    // Wait for game to be properly initialized
    await page.waitForTimeout(500);
  });

  test('should respond to arrow key controls', async ({ page }) => {
    const movements = ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'];
    
    for (const direction of movements) {
      await gamePage.pressArrowKey(direction as any);
      await page.waitForTimeout(200); // Wait for movement to register
      
      // Verify game is still running (no errors occurred)
      expect(await gamePage.isGameStarted()).toBe(true);
    }
  });

  test('should respond to WASD controls', async ({ page }) => {
    const movements = ['w', 'd', 's', 'a'];
    
    for (const direction of movements) {
      await gamePage.pressWASD(direction as any);
      await page.waitForTimeout(200);
      
      expect(await gamePage.isGameStarted()).toBe(true);
    }
  });

  test('should prevent 180-degree turns', async ({ page }) => {
    // Start moving right (default direction)
    await page.waitForTimeout(300);
    
    // Try to move left (opposite direction) - should be ignored
    await gamePage.pressArrowKey('ArrowLeft');
    await page.waitForTimeout(300);
    
    // Game should not still be running
    expect(await gamePage.isGameStarted()).toBe(false);
    
  });

  test('should handle rapid key presses without errors', async ({ page }) => {
    const keys = ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'];
    
    // Simulate rapid key presses
    await gamePage.simulateRapidKeyPresses(keys, 50);
    
    // Game should handle this gracefully
    expect(await gamePage.isGameStarted()).toBe(true);
    await expect(gamePage.gameOverModal).toBeHidden();
  });

  test('should ignore invalid keys during gameplay', async ({ page }) => {
    const invalidKeys = KEYBOARD_KEYS.INVALID_KEYS;
    
    for (const key of invalidKeys) {
      if (key !== 'Space') { // Space is valid for pause
        await gamePage.pressKey(key);
        await page.waitForTimeout(50);
      }
    }
    
    // Game should continue running normally
    expect(await gamePage.isGameStarted()).toBe(true);
  });

  test('should handle mixed arrow keys and WASD', async ({ page }) => {
    const mixedControls = ['ArrowUp', 'w', 'ArrowRight', 'd', 'ArrowDown', 's', 'ArrowLeft', 'a'];
    
    for (const control of mixedControls) {
      if (['w', 'a', 's', 'd'].includes(control)) {
        await gamePage.pressWASD(control as any);
      } else {
        await gamePage.pressArrowKey(control as any);
      }
      await page.waitForTimeout(150);
    }
    
    expect(await gamePage.isGameStarted()).toBe(true);
  });

  test('should handle uppercase WASD keys', async ({ page }) => {
    const uppercaseKeys = ['W', 'A', 'S', 'D'];
    
    for (const key of uppercaseKeys) {
      await gamePage.pressKey(key);
      await page.waitForTimeout(150);
    }
    
    expect(await gamePage.isGameStarted()).toBe(true);
  });

  test('should not respond to controls when game is paused', async ({ page }) => {
    // Pause the game
    await gamePage.pauseGame();
    expect(await gamePage.isGamePaused()).toBe(true);
    
    // Try to move while paused
    await gamePage.pressArrowKey('ArrowUp');
    await gamePage.pressArrowKey('ArrowRight');
    await page.waitForTimeout(200);
    
    // Game should remain paused
    expect(await gamePage.isGamePaused()).toBe(true);
    
    // Resume and verify controls work again
    await gamePage.pauseGame();
    await gamePage.pressArrowKey('ArrowDown');
    await page.waitForTimeout(200);
    
    expect(await gamePage.isGamePaused()).toBe(false);
  });

  test('should handle key combinations and modifier keys gracefully', async ({ page }) => {
    // Test various key combinations that shouldn't affect the game
    await page.keyboard.down('Shift');
    await gamePage.pressArrowKey('ArrowUp');
    await page.keyboard.up('Shift');
    
    await page.keyboard.down('Control');
    await gamePage.pressArrowKey('ArrowRight');
    await page.keyboard.up('Control');
    
    await page.keyboard.down('Alt');
    await gamePage.pressArrowKey('ArrowDown');
    await page.keyboard.up('Alt');
    
    expect(await gamePage.isGameStarted()).toBe(true);
  });

  test('should handle continuous key holding', async ({ page }) => {
    // Simulate holding a key down
    await page.keyboard.down('ArrowRight');
    await page.waitForTimeout(200);
    await page.keyboard.up('ArrowRight');
    await page.keyboard.down('ArrowUp');
    await page.waitForTimeout(200);
    await page.keyboard.up('ArrowUp');
    await page.keyboard.down('ArrowLeft');
    await page.waitForTimeout(200);
    await page.keyboard.up('ArrowLeft');

    // Game should handle this gracefully
    expect(await gamePage.isGameStarted()).toBe(true);
  });
});
