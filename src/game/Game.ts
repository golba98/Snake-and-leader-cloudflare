import { Snake } from './Snake.ts';
import { Food } from './Food.ts';
import { InputController } from './InputController.ts';
import { Renderer } from './Renderer.ts';
import { SoundManager } from './SoundManager.ts';
import { Leaderboard } from '../leaderboard/Leaderboard.ts';
import type { GameState, Difficulty } from './types.ts';
import { 
  DIFFICULTY_SETTINGS,
  STORAGE_BEST_SCORE_KEY,
  STORAGE_DIFFICULTY_KEY 
} from './constants.ts';
import { 
  getDOM, 
  updateScoreDisplay, 
  updateBestScoreDisplay, 
  updatePlayPauseBtnState,
  updateSpeedDisplay,
  updateDifficultyBtn,
  updateSoundBtn
} from '../ui/dom.ts';

export class Game {
  private snake: Snake;
  private food: Food;
  private input: InputController;
  private renderer: Renderer;
  private sound: SoundManager;
  private leaderboard: Leaderboard;

  private state!: GameState;
  private loopId: number | null = null;
  private lastTickTime: number = 0;

  constructor(canvas: HTMLCanvasElement, leaderboard: Leaderboard) {
    this.snake = new Snake();
    this.food = new Food(this.snake);
    this.input = new InputController();
    this.renderer = new Renderer(canvas);
    this.sound = new SoundManager();
    this.leaderboard = leaderboard;

    this.initBestScore();
    this.reset();
    this.bindGlobalKeys();
  }

  private initBestScore(): void {
    let savedDifficulty: Difficulty = 'MEDIUM';
    try {
      const saved = localStorage.getItem(STORAGE_DIFFICULTY_KEY) as Difficulty;
      if (saved === 'EASY' || saved === 'MEDIUM' || saved === 'HARD') {
        savedDifficulty = saved;
      }
    } catch {}

    const bestScoreKey = `${STORAGE_BEST_SCORE_KEY}_${savedDifficulty.toLowerCase()}`;
    let savedBestScore = 0;
    try {
      const saved = localStorage.getItem(bestScoreKey);
      savedBestScore = saved ? parseInt(saved, 10) : 0;
    } catch {}

    this.state = {
      snake: [],
      direction: 'RIGHT',
      nextDirection: 'RIGHT',
      food: { x: 0, y: 0 },
      score: 0,
      bestScore: savedBestScore,
      isPaused: false,
      isGameOver: false,
      isReady: true,
      speed: DIFFICULTY_SETTINGS[savedDifficulty].initialSpeed,
      difficulty: savedDifficulty,
    };

    updateBestScoreDisplay(this.state.bestScore);
    updateSpeedDisplay(1);
    updateDifficultyBtn(
      DIFFICULTY_SETTINGS[savedDifficulty].label,
      DIFFICULTY_SETTINGS[savedDifficulty].color
    );
    updateSoundBtn(this.sound.getMuteState());
    updatePlayPauseBtnState('PLAY');
  }

  public reset(): void {
    this.snake.reset();
    this.food.spawn(this.snake);
    this.input.reset();

    const settings = DIFFICULTY_SETTINGS[this.state.difficulty];
    const bestScoreKey = `${STORAGE_BEST_SCORE_KEY}_${this.state.difficulty.toLowerCase()}`;
    let savedBestScore = 0;
    try {
      const saved = localStorage.getItem(bestScoreKey);
      savedBestScore = saved ? parseInt(saved, 10) : 0;
    } catch {}

    this.state.snake = this.snake.getBody();
    this.state.direction = this.snake.getDirection();
    this.state.nextDirection = this.snake.getDirection();
    this.state.food = this.food.getPosition();
    this.state.score = 0;
    this.state.bestScore = savedBestScore;
    this.state.isPaused = false;
    this.state.isGameOver = false;
    this.state.isReady = true;
    this.state.speed = settings.initialSpeed;

    updateScoreDisplay(0);
    updateBestScoreDisplay(savedBestScore);
    updateSpeedDisplay(1);
    updatePlayPauseBtnState('PLAY');

    this.lastTickTime = performance.now();
    this.renderer.draw(
      this.snake,
      this.food,
      this.state.isPaused,
      this.state.isGameOver,
      this.state.isReady,
      this.state.score
    );
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

    // Transition from ready state if any keyboard or touch input has been queued
    if (this.state.isReady && this.input.hasInput()) {
      this.state.isReady = false;
      this.lastTickTime = timestamp;
      updatePlayPauseBtnState('PAUSE');
    }

    if (this.state.isGameOver || this.state.isPaused || this.state.isReady) {
      this.renderer.draw(
        this.snake,
        this.food,
        this.state.isPaused,
        this.state.isGameOver,
        this.state.isReady,
        this.state.score
      );
      this.lastTickTime = timestamp; // Prevent time drift while inactive
      this.loopId = requestAnimationFrame((t) => this.loop(t));
      return;
    }

    const elapsed = timestamp - this.lastTickTime;
    if (elapsed >= this.state.speed) {
      this.tick();
      // Adjust timing to preserve fractional remainders, but reset if severely lagged
      if (elapsed > this.state.speed * 2) {
        this.lastTickTime = timestamp;
      } else {
        this.lastTickTime = timestamp - (elapsed % this.state.speed);
      }
    }

    this.renderer.draw(
      this.snake,
      this.food,
      this.state.isPaused,
      this.state.isGameOver,
      this.state.isReady,
      this.state.score
    );
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

      // Play programmatic energy sound
      this.sound.playFood();

      // Decrement frame interval per eaten food, capped at MIN_SPEED (speed ceiling) for selected difficulty
      const settings = DIFFICULTY_SETTINGS[this.state.difficulty];
      const speedFactor = Math.floor(this.state.score / 10);
      this.state.speed = Math.max(settings.minSpeed, settings.initialSpeed - speedFactor * settings.speedDecrement);
      updateSpeedDisplay(speedFactor + 1);

      this.food.spawn(this.snake);
      this.state.food = this.food.getPosition();
    }

    this.state.snake = this.snake.getBody();
  }

  private handleGameOver(): void {
    this.state.isGameOver = true;

    // Play programmatic game over sound
    this.sound.playGameOver();

    const bestScoreKey = `${STORAGE_BEST_SCORE_KEY}_${this.state.difficulty.toLowerCase()}`;
    if (this.state.score > this.state.bestScore) {
      this.state.bestScore = this.state.score;
      try {
        localStorage.setItem(bestScoreKey, String(this.state.bestScore));
      } catch {}
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
    
    if (this.state.isReady) {
      this.state.isReady = false;
      this.lastTickTime = performance.now();
      updatePlayPauseBtnState('PAUSE');
      return;
    }

    this.state.isPaused = !this.state.isPaused;
    if (!this.state.isPaused) {
      this.lastTickTime = performance.now();
    }
    updatePlayPauseBtnState(this.state.isPaused ? 'RESUME' : 'PAUSE');
  }

  public cycleDifficulty(): void {
    // Only allow changing difficulty if game is ready to play or game is over
    if (!this.state.isReady && !this.state.isGameOver) return;

    const current = this.state.difficulty;
    let next: Difficulty = 'MEDIUM';
    if (current === 'EASY') next = 'MEDIUM';
    else if (current === 'MEDIUM') next = 'HARD';
    else if (current === 'HARD') next = 'EASY';

    this.state.difficulty = next;
    try {
      localStorage.setItem(STORAGE_DIFFICULTY_KEY, next);
    } catch {}

    const settings = DIFFICULTY_SETTINGS[next];
    updateDifficultyBtn(settings.label, settings.color);
    
    // Changing difficulty resets the game to set initial speeds and best score
    this.reset();
  }

  public toggleMute(): void {
    const isMuted = this.sound.toggleMute();
    updateSoundBtn(isMuted);
  }

  public isPaused(): boolean {
    return this.state.isPaused;
  }

  public isGameOver(): boolean {
    return this.state.isGameOver;
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
      // Check if user is typing in a form input or textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.key === ' ') {
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

