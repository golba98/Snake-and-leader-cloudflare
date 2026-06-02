import type { Position } from './types.ts';
import { Snake } from './Snake.ts';
import { GRID_WIDTH, GRID_HEIGHT } from './constants.ts';

export class Food {
  private position: Position = { x: 0, y: 0 };

  constructor(snake: Snake) {
    this.spawn(snake);
  }

  getPosition(): Position {
    return this.position;
  }

  spawn(snake: Snake): void {
    let newPos: Position;
    let attempts = 0;
    const maxAttempts = GRID_WIDTH * GRID_HEIGHT * 2;

    do {
      newPos = {
        x: Math.floor(Math.random() * GRID_WIDTH),
        y: Math.floor(Math.random() * GRID_HEIGHT),
      };
      attempts++;
    } while (snake.contains(newPos) && attempts < maxAttempts);

    // Fallback: If random attempts fail (grid is almost full), scan the grid for empty cells
    if (snake.contains(newPos)) {
      const emptyCells: Position[] = [];
      for (let x = 0; x < GRID_WIDTH; x++) {
        for (let y = 0; y < GRID_HEIGHT; y++) {
          const pos = { x, y };
          if (!snake.contains(pos)) {
            emptyCells.push(pos);
          }
        }
      }
      if (emptyCells.length > 0) {
        const randomIndex = Math.floor(Math.random() * emptyCells.length);
        newPos = emptyCells[randomIndex];
      }
    }

    this.position = newPos;
  }
}
