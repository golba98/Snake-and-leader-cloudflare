export interface Position {
  x: number;
  y: number;
}

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface GameState {
  snake: Position[];
  direction: Direction;
  nextDirection: Direction;
  food: Position;
  score: number;
  bestScore: number;
  isPaused: boolean;
  isGameOver: boolean;
  speed: number;
}
