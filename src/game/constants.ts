export const GRID_WIDTH = 20;
export const GRID_HEIGHT = 20;

export const STORAGE_LEADERBOARD_KEY = 'snake_arcade_leaderboard';
export const STORAGE_BEST_SCORE_KEY = 'snake_arcade_best_score';

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface DifficultySettings {
  initialSpeed: number;
  speedDecrement: number;
  minSpeed: number;
}

export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultySettings> = {
  easy: {
    initialSpeed: 220,
    speedDecrement: 4,
    minSpeed: 90
  },
  medium: {
    initialSpeed: 150,
    speedDecrement: 4,
    minSpeed: 50
  },
  hard: {
    initialSpeed: 100,
    speedDecrement: 4,
    minSpeed: 30
  },
  expert: {
    initialSpeed: 70,
    speedDecrement: 3,
    minSpeed: 15
  }
};
