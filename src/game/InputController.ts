import type { Direction } from './types.ts';

export class InputController {
  private inputQueue: Direction[] = [];
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

  /**
   * Dequeues and returns the next direction to move in.
   * If the queue is empty, returns the last moved direction.
   */
  public getDirection(): Direction {
    if (this.inputQueue.length > 0) {
      this.lastMovedDirection = this.inputQueue.shift()!;
    }
    return this.lastMovedDirection;
  }

  /**
   * Checks if any direction inputs are currently queued.
   */
  public hasInput(): boolean {
    return this.inputQueue.length > 0;
  }

  /**
   * Set the actual direction moved in the last game loop tick.
   */
  public setLastMovedDirection(dir: Direction): void {
    this.lastMovedDirection = dir;
  }

  public setDirection(newDir: Direction): void {
    // Determine the reference direction for 180-degree checks.
    // If the queue has elements, we compare against the last queued move.
    // Otherwise, we compare against the last moved direction.
    const referenceDir = this.inputQueue.length > 0
      ? this.inputQueue[this.inputQueue.length - 1]
      : this.lastMovedDirection;

    if (this.isOpposite(newDir, referenceDir)) return;

    // Limit queue size to 2 moves to keep responses immediate
    if (this.inputQueue.length < 2) {
      this.inputQueue.push(newDir);
    }
  }

  private isOpposite(dir1: Direction, dir2: Direction): boolean {
    return (
      (dir1 === 'UP' && dir2 === 'DOWN') ||
      (dir1 === 'DOWN' && dir2 === 'UP') ||
      (dir1 === 'LEFT' && dir2 === 'RIGHT') ||
      (dir1 === 'RIGHT' && dir2 === 'LEFT')
    );
  }

  private handleKeyDown(e: KeyboardEvent): void {
    // Check if the user is typing in a form input or textarea
    if (
      document.activeElement?.tagName === 'INPUT' ||
      document.activeElement?.tagName === 'TEXTAREA'
    ) {
      return;
    }

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
    this.inputQueue = [];
    this.lastMovedDirection = 'RIGHT';
  }
}

