import type { Position, Direction } from './types.ts';
import { GRID_WIDTH, GRID_HEIGHT } from './constants.ts';

export class Snake {
  private body: Position[] = [];
  private direction: Direction = 'RIGHT';

  constructor() {
    this.reset();
  }

  reset(): void {
    // Initial position in the middle, facing right, 3 segments long
    const startX = Math.floor(GRID_WIDTH / 2);
    const startY = Math.floor(GRID_HEIGHT / 2);
    this.body = [
      { x: startX, y: startY },
      { x: startX - 1, y: startY },
      { x: startX - 2, y: startY }
    ];
    this.direction = 'RIGHT';
  }

  getBody(): Position[] {
    return this.body;
  }

  getHead(): Position {
    return this.body[0];
  }

  getDirection(): Direction {
    return this.direction;
  }

  move(newDirection: Direction, grow: boolean): void {
    this.direction = newDirection;
    const head = this.getHead();
    const nextHead: Position = { x: head.x, y: head.y };

    switch (newDirection) {
      case 'UP':
        nextHead.y -= 1;
        break;
      case 'DOWN':
        nextHead.y += 1;
        break;
      case 'LEFT':
        nextHead.x -= 1;
        break;
      case 'RIGHT':
        nextHead.x += 1;
        break;
    }

    this.body.unshift(nextHead);
    if (!grow) {
      this.body.pop();
    }
  }

  checkSelfCollision(): boolean {
    const head = this.getHead();
    // Check collision with body parts (exclude index 0 which is the head itself)
    for (let i = 1; i < this.body.length; i++) {
      if (this.body[i].x === head.x && this.body[i].y === head.y) {
        return true;
      }
    }
    return false;
  }

  checkWallCollision(): boolean {
    const head = this.getHead();
    return (
      head.x < 0 ||
      head.x >= GRID_WIDTH ||
      head.y < 0 ||
      head.y >= GRID_HEIGHT
    );
  }

  contains(pos: Position, includeHead: boolean = true): boolean {
    const startIdx = includeHead ? 0 : 1;
    return this.body.slice(startIdx).some(segment => segment.x === pos.x && segment.y === pos.y);
  }
}
