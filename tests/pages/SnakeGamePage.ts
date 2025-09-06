import { Page, Locator, expect } from '@playwright/test';

export class SnakeGamePage {
  readonly page: Page;
  readonly gameCanvas: Locator;
  readonly startButton: Locator;
  readonly pauseButton: Locator;
  readonly resetButton: Locator;
  readonly playAgainButton: Locator;
  readonly scoreDisplay: Locator;
  readonly highScoreDisplay: Locator;
  readonly gameOverModal: Locator;
  readonly finalScoreDisplay: Locator;
  readonly gameTitle: Locator;
  readonly instructions: Locator;

  constructor(page: Page) {
    this.page = page;
    this.gameCanvas = page.locator('#gameCanvas');
    this.startButton = page.locator('#startBtn');
    this.pauseButton = page.locator('#pauseBtn');
    this.resetButton = page.locator('#resetBtn');
    this.playAgainButton = page.locator('#playAgainBtn');
    this.scoreDisplay = page.locator('#score');
    this.highScoreDisplay = page.locator('#highScore');
    this.gameOverModal = page.locator('#gameOver');
    this.finalScoreDisplay = page.locator('#finalScore');
    this.gameTitle = page.locator('h1');
    this.instructions = page.locator('.instructions');
  }

  async goto() {
    await this.page.goto('/');
  }

  async startGame() {
    await this.startButton.click();
  }

  async pauseGame() {
    await this.pauseButton.click();
  }

  async resetGame() {
    await this.resetButton.click();
  }

  async playAgain() {
    await this.playAgainButton.click();
  }

  async pressKey(key: string) {
    await this.page.keyboard.press(key);
  }

  async pressArrowKey(direction: 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight') {
    await this.page.keyboard.press(direction);
  }

  async pressWASD(key: 'w' | 'a' | 's' | 'd') {
    await this.page.keyboard.press(key);
  }

  async pressSpacebar() {
    await this.page.keyboard.press('Space');
  }

  async getCurrentScore(): Promise<number> {
    const scoreText = await this.scoreDisplay.textContent();
    return parseInt(scoreText || '0');
  }

  async getHighScore(): Promise<number> {
    const highScoreText = await this.highScoreDisplay.textContent();
    return parseInt(highScoreText || '0');
  }

  async getFinalScore(): Promise<number> {
    const finalScoreText = await this.finalScoreDisplay.textContent();
    return parseInt(finalScoreText || '0');
  }

  async isGameOverVisible(): Promise<boolean> {
    return await this.gameOverModal.isVisible();
  }

  async isGameStarted(): Promise<boolean> {
    return await this.startButton.isDisabled();
  }

  async isGamePaused(): Promise<boolean> {
    const pauseButtonText = await this.pauseButton.textContent();
    return pauseButtonText === 'Resume';
  }

  async waitForGameOver(): Promise<void> {
    await this.gameOverModal.waitFor({ state: 'visible', timeout: 30000 });
  }

  async waitForScoreChange(initialScore: number, timeout: number = 10000): Promise<void> {
    await this.page.waitForFunction(
      (score) => {
        const currentScoreElement = document.querySelector('#score');
        return currentScoreElement && parseInt(currentScoreElement.textContent || '0') !== score;
      },
      initialScore,
      { timeout }
    );
  }

  async getCanvasImageData(): Promise<string> {
    return await this.page.evaluate(() => {
      const canvas = document.querySelector('#gameCanvas') as HTMLCanvasElement;
      return canvas.toDataURL();
    });
  }

  async getSnakePosition(): Promise<Array<{x: number, y: number}>> {
    return await this.page.evaluate(() => {
      // Access the game instance from the global scope
      const gameInstance = (window as any).game;
      if (gameInstance && gameInstance.snake) {
        return gameInstance.snake.map((segment: any) => ({ x: segment.x, y: segment.y }));
      }
      return [];
    });
  }

  async getFoodPosition(): Promise<{x: number, y: number}> {
    return await this.page.evaluate(() => {
      const gameInstance = (window as any).game;
      if (gameInstance && gameInstance.food) {
        return { x: gameInstance.food.x, y: gameInstance.food.y };
      }
      return { x: -1, y: -1 };
    });
  }

  async getGameSpeed(): Promise<number> {
    return await this.page.evaluate(() => {
      const gameInstance = (window as any).game;
      return gameInstance ? gameInstance.gameSpeed : 0;
    });
  }

  async isGameRunning(): Promise<boolean> {
    return await this.page.evaluate(() => {
      const gameInstance = (window as any).game;
      return gameInstance ? gameInstance.gameRunning : false;
    });
  }

  async simulateRapidKeyPresses(keys: string[], intervalMs: number = 50) {
    for (const key of keys) {
      await this.page.keyboard.press(key);
      await this.page.waitForTimeout(intervalMs);
    }
  }

  async moveSnakeToPosition(targetX: number, targetY: number) {
    // This is a helper method to move snake to a specific position
    // Useful for testing specific game states
    let attempts = 0;
    const maxAttempts = 100;
    
    while (attempts < maxAttempts) {
      const snakePos = await this.getSnakePosition();
      if (snakePos.length === 0) break;
      
      const head = snakePos[0];
      if (head.x === targetX && head.y === targetY) break;
      
      // Simple pathfinding logic
      if (head.x < targetX) {
        await this.pressArrowKey('ArrowRight');
      } else if (head.x > targetX) {
        await this.pressArrowKey('ArrowLeft');
      } else if (head.y < targetY) {
        await this.pressArrowKey('ArrowDown');
      } else if (head.y > targetY) {
        await this.pressArrowKey('ArrowUp');
      }
      
      await this.page.waitForTimeout(150); // Wait for game loop
      attempts++;
    }
  }

  async exposeGameInstance() {
    // Expose the game instance to the global scope for testing
    await this.page.addInitScript(() => {
      window.addEventListener('DOMContentLoaded', () => {
        // Wait for game to be initialized and expose it
        setTimeout(() => {
          const gameContainer = document.querySelector('.game-container');
          if (gameContainer) {
            // Try to find the game instance
            const scripts = document.querySelectorAll('script');
            scripts.forEach(script => {
              if (script.src.includes('game.js')) {
                // Game should be initialized by now
                (window as any).game = (window as any).game || null;
              }
            });
          }
        }, 1000);
      });
    });
  }
}
