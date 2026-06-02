import type { Direction } from './types.ts';

export class InputController {
  private currentDirection: Direction = 'RIGHT';
  private lastMovedDirection: Direction = 'RIGHT';
  private handleKeyDownBound: (e: KeyboardEvent) => void;

  constructor() {
    this.handleKeyDownBound = this.handleKeyDown.bind(this);
    this.bindEvents();
  }

  private bindEvents(): void {
    window.addEventListener('keydown', this.handleKeyDownBound);
  }

  public destroy(): void {
    window.removeEventListener('keydown', this.handleKeyDownBound);
  }

  public getDirection(): Direction {
    return this.currentDirection;
  }

  /**
   * Set the actual direction moved in the last game loop tick.
   * This is critical to prevent double-keypress self-collisions.
   */
  public setLastMovedDirection(dir: Direction): void {
    this.lastMovedDirection = dir;
  }

  public setDirection(newDir: Direction): void {
    // Prevent 180-degree instant turns based on the last tick's actual movement
    if (newDir === 'UP' && this.lastMovedDirection === 'DOWN') return;
    if (newDir === 'DOWN' && this.lastMovedDirection === 'UP') return;
    if (newDir === 'LEFT' && this.lastMovedDirection === 'RIGHT') return;
    if (newDir === 'RIGHT' && this.lastMovedDirection === 'LEFT') return;

    this.currentDirection = newDir;
  }

  private handleKeyDown(e: KeyboardEvent): void {
    let newDir: Direction | null = null;

    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        newDir = 'UP';
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        newDir = 'DOWN';
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        newDir = 'LEFT';
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        newDir = 'RIGHT';
        break;
    }

    if (newDir) {
      // Prevent default page scrolling when using arrow keys
      e.preventDefault();
      this.setDirection(newDir);
    }
  }

  public reset(): void {
    this.currentDirection = 'RIGHT';
    this.lastMovedDirection = 'RIGHT';
  }
}
