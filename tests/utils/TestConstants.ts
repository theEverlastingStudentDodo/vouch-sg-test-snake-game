export const GAME_CONFIG = {
  CANVAS_SIZE: 400,
  GRID_SIZE: 20,
  TILE_COUNT: 20,
  INITIAL_SNAKE_LENGTH: 3,
  INITIAL_GAME_SPEED: 100,
  SCORE_PER_FOOD: 10,
  SPEED_INCREASE_THRESHOLD: 50,
  MIN_GAME_SPEED: 50,
  SPEED_DECREASE_AMOUNT: 10
} as const;

export const TEST_TIMEOUTS = {
  SHORT: 1000,
  MEDIUM: 5000,
  LONG: 10000,
  VERY_LONG: 30000
} as const;

export const KEYBOARD_KEYS = {
  ARROW_KEYS: ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'],
  WASD_KEYS: ['w', 'a', 's', 'd'],
  ALL_MOVEMENT_KEYS: ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'],
  INVALID_KEYS: ['Space', 'Enter', 'Escape', 'Tab', '1', 'q', 'e', 'r'],
  SPECIAL_KEYS: ['Space'] // Space for pause
} as const;

export const GAME_STATES = {
  INITIAL: 'initial',
  RUNNING: 'running',
  PAUSED: 'paused',
  GAME_OVER: 'game_over'
} as const;

export const TEST_SCENARIOS = {
  BASIC_GAMEPLAY: {
    description: 'Basic gameplay functionality',
    expectedDuration: 'short'
  },
  COLLISION_DETECTION: {
    description: 'Wall and self-collision detection',
    expectedDuration: 'medium'
  },
  FOOD_CONSUMPTION: {
    description: 'Food eating and score tracking',
    expectedDuration: 'medium'
  },
  RAPID_INPUT: {
    description: 'Rapid key press handling',
    expectedDuration: 'short'
  },
  PERFORMANCE: {
    description: 'Performance and responsiveness',
    expectedDuration: 'long'
  },
  EDGE_CASES: {
    description: 'Edge cases and error handling',
    expectedDuration: 'medium'
  }
} as const;

export const ACCESSIBILITY_SELECTORS = {
  GAME_REGION: '[role="main"], .game-container',
  INTERACTIVE_ELEMENTS: 'button, [tabindex], [role="button"]',
  SCORE_DISPLAYS: '#score, #highScore, #finalScore',
  HEADINGS: 'h1, h2, h3, h4, h5, h6'
} as const;
