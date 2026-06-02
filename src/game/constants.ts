import type { Difficulty } from './types.ts';

export const GRID_WIDTH = 20;
export const GRID_HEIGHT = 20;

export const STORAGE_LEADERBOARD_KEY = 'snake_arcade_leaderboard';
export const STORAGE_BEST_SCORE_KEY = 'snake_arcade_best_score';
export const STORAGE_DIFFICULTY_KEY = 'snake_arcade_difficulty';

export interface DifficultyConfig {
  initialSpeed: number;
  minSpeed: number;
  speedDecrement: number;
  label: string;
  color: string;
}

export const DIFFICULTY_SETTINGS: Record<Difficulty, DifficultyConfig> = {
  EASY: {
    initialSpeed: 200,
    minSpeed: 95,
    speedDecrement: 3,
    label: 'Easy',
    color: '#10b981' // Accent Green
  },
  MEDIUM: {
    initialSpeed: 155,
    minSpeed: 55,
    speedDecrement: 4,
    label: 'Medium',
    color: '#06b6d4' // Accent Cyan
  },
  HARD: {
    initialSpeed: 95,
    minSpeed: 35,
    speedDecrement: 5,
    label: 'Hard',
    color: '#ef4444' // Accent Red
  }
};

