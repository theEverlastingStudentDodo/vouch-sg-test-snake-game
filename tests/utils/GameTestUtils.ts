export class GameTestUtils {
  static wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async waitForCondition(
    condition: () => Promise<boolean>,
    timeoutMs: number = 5000,
    intervalMs: number = 100
  ): Promise<boolean> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
      if (await condition()) {
        return true;
      }
      await this.wait(intervalMs);
    }
    
    return false;
  }

  static generateRandomKeySequence(length: number): string[] {
    const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    const sequence: string[] = [];
    
    for (let i = 0; i < length; i++) {
      sequence.push(keys[Math.floor(Math.random() * keys.length)]);
    }
    
    return sequence;
  }

  static calculateDistance(pos1: {x: number, y: number}, pos2: {x: number, y: number}): number {
    return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
  }

  static isValidDirection(current: string, next: string): boolean {
    const opposites: Record<string, string> = {
      'ArrowUp': 'ArrowDown',
      'ArrowDown': 'ArrowUp',
      'ArrowLeft': 'ArrowRight',
      'ArrowRight': 'ArrowLeft'
    };
    
    return opposites[current] !== next;
  }

  static async measurePerformance<T>(operation: () => Promise<T>): Promise<{result: T, duration: number}> {
    const startTime = performance.now();
    const result = await operation();
    const duration = performance.now() - startTime;
    
    return { result, duration };
  }

  static createPerformanceMonitor() {
    const metrics: Array<{timestamp: number, metric: string, value: number}> = [];
    
    return {
      record: (metric: string, value: number) => {
        metrics.push({ timestamp: Date.now(), metric, value });
      },
      
      getMetrics: () => [...metrics],
      
      getAverageMetric: (metricName: string) => {
        const filtered = metrics.filter(m => m.metric === metricName);
        if (filtered.length === 0) return 0;
        return filtered.reduce((sum, m) => sum + m.value, 0) / filtered.length;
      },
      
      clear: () => {
        metrics.length = 0;
      }
    };
  }

  static async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        if (attempt < maxRetries) {
          await this.wait(delayMs);
        }
      }
    }
    
    throw lastError!;
  }
}
