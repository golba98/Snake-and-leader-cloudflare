export interface Position {
  x: number;
  y: number;
}

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface GameState {
  snake: Position[];
  direction: Direction;
  nextDirection: Direction;
  food: Position;
  score: number;
  bestScore: number;
  isPaused: boolean;
  isGameOver: boolean;
  isReady: boolean;
  speed: number;
  difficulty: Difficulty;
}

