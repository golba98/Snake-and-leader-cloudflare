import { Snake } from './Snake.ts';
import { Food } from './Food.ts';
import { InputController } from './InputController.ts';
import { Renderer } from './Renderer.ts';
import { Leaderboard } from '../leaderboard/Leaderboard.ts';
import type { GameState } from './types.ts';
import { 
  INITIAL_SPEED, 
  MIN_SPEED, 
  SPEED_DECREMENT, 
  STORAGE_BEST_SCORE_KEY 
} from './constants.ts';
import { 
  getDOM, 
  updateScoreDisplay, 
  updateBestScoreDisplay, 
  togglePlayPauseBtn,
  updateSpeedDisplay
} from '../ui/dom.ts';

export class Game {
  private snake: Snake;
  private food: Food;
  private input: InputController;
  private renderer: Renderer;
  private leaderboard: Leaderboard;

  private state!: GameState;
  private loopId: number | null = null;
  private lastTickTime: number = 0;

  constructor(canvas: HTMLCanvasElement, leaderboard: Leaderboard) {
    this.snake = new Snake();
    this.food = new Food(this.snake);
    this.input = new InputController();
    this.renderer = new Renderer(canvas);
    this.leaderboard = leaderboard;

    this.initBestScore();
    this.reset();
    this.bindGlobalKeys();
  }

  private initBestScore(): void {
    const saved = localStorage.getItem(STORAGE_BEST_SCORE_KEY);
    this.state = {
      snake: [],
      direction: 'RIGHT',
      nextDirection: 'RIGHT',
      food: { x: 0, y: 0 },
      score: 0,
      bestScore: saved ? parseInt(saved, 10) : 0,
      isPaused: false,
      isGameOver: false,
      speed: INITIAL_SPEED,
    };
    updateBestScoreDisplay(this.state.bestScore);
    updateSpeedDisplay(1);
  }

  public reset(): void {
    this.snake.reset();
    this.food.spawn(this.snake);
    this.input.reset();

    this.state.snake = this.snake.getBody();
    this.state.direction = this.snake.getDirection();
    this.state.nextDirection = this.snake.getDirection();
    this.state.food = this.food.getPosition();
    this.state.score = 0;
    this.state.isPaused = false;
    this.state.isGameOver = false;
    this.state.speed = INITIAL_SPEED;

    updateScoreDisplay(0);
    updateSpeedDisplay(1);
    togglePlayPauseBtn(false);

    this.lastTickTime = performance.now();
    this.renderer.draw(this.snake, this.food, this.state.isPaused, this.state.isGameOver);
  }

  public start(): void {
    if (this.loopId !== null) return;
    this.lastTickTime = performance.now();
    this.loopId = requestAnimationFrame((t) => this.loop(t));
  }

  public stop(): void {
    if (this.loopId !== null) {
      cancelAnimationFrame(this.loopId);
      this.loopId = null;
    }
  }

  private loop(timestamp: number): void {
    if (!this.loopId) return;

    if (this.state.isGameOver || this.state.isPaused) {
      this.renderer.draw(this.snake, this.food, this.state.isPaused, this.state.isGameOver);
      this.loopId = requestAnimationFrame((t) => this.loop(t));
      return;
    }

    const elapsed = timestamp - this.lastTickTime;
    if (elapsed >= this.state.speed) {
      this.tick();
      this.lastTickTime = timestamp;
    }

    this.renderer.draw(this.snake, this.food, this.state.isPaused, this.state.isGameOver);
    this.loopId = requestAnimationFrame((t) => this.loop(t));
  }

  private tick(): void {
    const nextDir = this.input.getDirection();
    this.state.direction = nextDir;

    const head = this.snake.getHead();
    let eatsFood = false;

    let nextX = head.x;
    let nextY = head.y;
    switch (nextDir) {
      case 'UP': nextY -= 1; break;
      case 'DOWN': nextY += 1; break;
      case 'LEFT': nextX -= 1; break;
      case 'RIGHT': nextX += 1; break;
    }

    const foodPos = this.food.getPosition();
    if (nextX === foodPos.x && nextY === foodPos.y) {
      eatsFood = true;
    }

    this.snake.move(nextDir, eatsFood);
    this.input.setLastMovedDirection(nextDir);

    if (this.snake.checkWallCollision() || this.snake.checkSelfCollision()) {
      this.handleGameOver();
      return;
    }

    if (eatsFood) {
      this.state.score += 10;
      updateScoreDisplay(this.state.score);

      // Decrement frame interval per eaten food, capped at MIN_SPEED (speed ceiling)
      const speedFactor = Math.floor(this.state.score / 10);
      this.state.speed = Math.max(MIN_SPEED, INITIAL_SPEED - speedFactor * SPEED_DECREMENT);
      updateSpeedDisplay(speedFactor + 1);

      this.food.spawn(this.snake);
      this.state.food = this.food.getPosition();
    }

    this.state.snake = this.snake.getBody();
  }

  private handleGameOver(): void {
    this.state.isGameOver = true;

    if (this.state.score > this.state.bestScore) {
      this.state.bestScore = this.state.score;
      localStorage.setItem(STORAGE_BEST_SCORE_KEY, String(this.state.bestScore));
      updateBestScoreDisplay(this.state.bestScore);
    }

    this.leaderboard.getStorage().qualifiesForLeaderboard(this.state.score).then(qualifies => {
      if (qualifies) {
        this.showSubmitScoreModal();
      }
    });
  }

  public togglePause(): void {
    if (this.state.isGameOver) return;
    this.state.isPaused = !this.state.isPaused;
    togglePlayPauseBtn(this.state.isPaused);
  }

  public getInputController(): InputController {
    return this.input;
  }

  public getScore(): number {
    return this.state.score;
  }

  private showSubmitScoreModal(): void {
    const dom = getDOM();
    if (dom.submitScoreModal && dom.finalScoreDisplay && dom.playerNameInput) {
      dom.finalScoreDisplay.textContent = String(this.state.score);
      dom.playerNameInput.value = '';
      dom.submitScoreModal.classList.add('visible');
      dom.playerNameInput.focus();
    }
  }

  private bindGlobalKeys(): void {
    window.addEventListener('keydown', (e) => {
      if (e.key === ' ' && document.activeElement !== getDOM().playerNameInput) {
        e.preventDefault();
        if (this.state.isGameOver) {
          this.reset();
        } else {
          this.togglePause();
        }
      }
    });
  }
}
