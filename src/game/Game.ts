import { Snake } from './Snake.ts';
import { Food } from './Food.ts';
import { InputController } from './InputController.ts';
import { Renderer } from './Renderer.ts';
import { Leaderboard } from '../leaderboard/Leaderboard.ts';
import { SoundEffects } from './Sound.ts';
import type { GameState } from './types.ts';
import { 
  DIFFICULTY_CONFIGS, 
  type Difficulty, 
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
  private sound: SoundEffects;

  private state!: GameState;
  private loopId: number | null = null;
  private lastTickTime: number = 0;

  private difficulty: Difficulty = 'medium';
  private isReadyState: boolean = true;
  private isSubmittingScore: boolean = false;

  constructor(canvas: HTMLCanvasElement, leaderboard: Leaderboard) {
    this.snake = new Snake();
    this.food = new Food(this.snake);
    this.input = new InputController();
    this.renderer = new Renderer(canvas);
    this.leaderboard = leaderboard;
    this.sound = new SoundEffects();

    // Load difficulty preference
    try {
      const savedDiff = localStorage.getItem('snake_arcade_difficulty') as Difficulty;
      if (savedDiff && DIFFICULTY_CONFIGS[savedDiff]) {
        this.difficulty = savedDiff;
      }
    } catch {
      this.difficulty = 'medium';
    }

    this.initBestScore();
    this.reset();
    this.bindGlobalKeys();
    this.updateSoundButtonUI();

    // Sync dropdown value on load
    const dom = getDOM();
    if (dom.difficultySelect) {
      dom.difficultySelect.value = this.difficulty;
    }
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
      speed: DIFFICULTY_CONFIGS[this.difficulty].initialSpeed,
    };
    updateBestScoreDisplay(this.state.bestScore);
    updateSpeedDisplay(1);
  }

  public reset(): void {
    this.snake.reset();
    this.food.spawn(this.snake);
    this.input.reset();

    this.isReadyState = true;
    this.isSubmittingScore = false;

    this.state.snake = this.snake.getBody();
    this.state.direction = this.snake.getDirection();
    this.state.nextDirection = this.snake.getDirection();
    this.state.food = this.food.getPosition();
    this.state.score = 0;
    this.state.isPaused = false;
    this.state.isGameOver = false;
    
    // Set initial speed based on current difficulty
    this.state.speed = DIFFICULTY_CONFIGS[this.difficulty].initialSpeed;

    updateScoreDisplay(0);
    updateSpeedDisplay(1);
    togglePlayPauseBtn(false, true); // paused=false, ready=true

    this.updateOverlays();

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

  public startGame(): void {
    if (!this.isReadyState) return;
    this.isReadyState = false;
    this.state.isPaused = false;
    this.state.isGameOver = false;
    togglePlayPauseBtn(false, false);
    this.updateOverlays();
    this.sound.playClick();
  }

  private loop(timestamp: number): void {
    if (!this.loopId) return;

    if (this.state.isGameOver || this.state.isPaused || this.isReadyState) {
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
      this.sound.playEat();
      
      this.state.score += 10;
      updateScoreDisplay(this.state.score);

      // Decrement tick speed per score, capped at current difficulty minSpeed limit
      const speedFactor = Math.floor(this.state.score / 10);
      const config = DIFFICULTY_CONFIGS[this.difficulty];
      this.state.speed = Math.max(
        config.minSpeed, 
        config.initialSpeed - speedFactor * config.speedDecrement
      );
      updateSpeedDisplay(speedFactor + 1);

      this.food.spawn(this.snake);
      this.state.food = this.food.getPosition();
    }

    this.state.snake = this.snake.getBody();
  }

  private handleGameOver(): void {
    this.state.isGameOver = true;
    this.sound.playGameOver();

    if (this.state.score > this.state.bestScore) {
      this.state.bestScore = this.state.score;
      localStorage.setItem(STORAGE_BEST_SCORE_KEY, String(this.state.bestScore));
      updateBestScoreDisplay(this.state.bestScore);
    }

    this.leaderboard.getStorage().qualifiesForLeaderboard(this.state.score).then(qualifies => {
      if (qualifies) {
        this.isSubmittingScore = true;
        this.showSubmitScoreModal();
      } else {
        this.isSubmittingScore = false;
      }
      this.updateOverlays();
    });
  }

  public togglePause(): void {
    if (this.state.isGameOver) return;
    
    if (this.isReadyState) {
      this.startGame();
      return;
    }

    this.state.isPaused = !this.state.isPaused;
    togglePlayPauseBtn(this.state.isPaused, false);
    this.sound.playPause();
    this.updateOverlays();
  }

  public isPaused(): boolean {
    return this.state.isPaused;
  }

  public isGameOver(): boolean {
    return this.state.isGameOver;
  }

  public isReady(): boolean {
    return this.isReadyState;
  }

  public getInputController(): InputController {
    return this.input;
  }

  public getScore(): number {
    return this.state.score;
  }

  public changeDifficulty(newDiff: Difficulty): void {
    if (DIFFICULTY_CONFIGS[newDiff]) {
      this.difficulty = newDiff;
      try {
        localStorage.setItem('snake_arcade_difficulty', newDiff);
      } catch (e) {
        console.warn('Could not save difficulty:', e);
      }
      this.reset();
    }
  }

  public toggleMute(): boolean {
    const isMuted = this.sound.toggleMute();
    this.sound.playClick();
    this.updateSoundButtonUI();
    return isMuted;
  }

  public cancelSubmit(): void {
    this.isSubmittingScore = false;
    this.sound.playClick();
    this.updateOverlays();
  }

  public playClick(): void {
    this.sound.playClick();
  }

  private updateSoundButtonUI(): void {
    const dom = getDOM();
    if (dom.soundBtn) {
      const isMuted = this.sound.isMuted();
      dom.soundBtn.innerHTML = isMuted 
        ? '<span class="icon">🔇</span> MUTED' 
        : '<span class="icon">🔊</span> SOUND';
      if (isMuted) {
        dom.soundBtn.classList.add('muted');
      } else {
        dom.soundBtn.classList.remove('muted');
      }
    }
  }

  private showSubmitScoreModal(): void {
    const dom = getDOM();
    if (dom.finalScoreDisplay && dom.playerNameInput) {
      dom.finalScoreDisplay.textContent = String(this.state.score);
      dom.playerNameInput.value = '';
      
      // Auto focus input
      setTimeout(() => {
        dom.playerNameInput.focus();
      }, 50);
    }
  }

  private updateOverlays(): void {
    const dom = getDOM();
    
    // Remove visible from all overlays
    dom.readyOverlay?.classList.remove('visible');
    dom.pauseOverlay?.classList.remove('visible');
    dom.gameOverOverlay?.classList.remove('visible');
    dom.submitScoreOverlay?.classList.remove('visible');

    if (this.state.isGameOver) {
      if (this.isSubmittingScore) {
        dom.submitScoreOverlay?.classList.add('visible');
      } else {
        if (dom.gameOverScore) {
          dom.gameOverScore.textContent = String(this.state.score);
        }
        dom.gameOverOverlay?.classList.add('visible');
      }
    } else if (this.state.isPaused) {
      dom.pauseOverlay?.classList.add('visible');
    } else if (this.isReadyState) {
      dom.readyOverlay?.classList.add('visible');
    }
  }

  private bindGlobalKeys(): void {
    window.addEventListener('keydown', (e) => {
      // Spacebar bindings
      if (e.key === ' ' && document.activeElement !== getDOM().playerNameInput) {
        e.preventDefault();
        if (this.state.isGameOver) {
          this.reset();
        } else if (this.isReadyState) {
          this.startGame();
        } else {
          this.togglePause();
        }
      }

      // Movement keys start the game if in Ready state
      if (this.isReadyState && [
        'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 
        'w', 'W', 's', 'S', 'a', 'A', 'd', 'D'
      ].includes(e.key)) {
        this.startGame();
      }
    });
  }
}
