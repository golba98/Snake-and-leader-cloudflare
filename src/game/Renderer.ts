import { Snake } from './Snake.ts';
import { Food } from './Food.ts';
import { GRID_WIDTH, GRID_HEIGHT } from './constants.ts';

export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private displayWidth: number = 400;
  private displayHeight: number = 400;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get 2D rendering context');
    }
    this.ctx = context;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  public resize(): void {
    const parent = this.canvas.parentElement;
    const size = parent ? Math.min(parent.clientWidth - 32, 400) : 400;
    this.displayWidth = size;
    this.displayHeight = size;

    // Apply high-DPI scaling
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.displayWidth * dpr;
    this.canvas.height = this.displayHeight * dpr;
    
    this.canvas.style.width = `${this.displayWidth}px`;
    this.canvas.style.height = `${this.displayHeight}px`;

    this.ctx.resetTransform();
    this.ctx.scale(dpr, dpr);
  }

  public draw(snake: Snake, food: Food, isPaused: boolean, isGameOver: boolean): void {
    // 1. Clear background
    this.ctx.fillStyle = '#0f111a'; // Dark arcade background
    this.ctx.fillRect(0, 0, this.displayWidth, this.displayHeight);

    // 2. Draw grid lines
    const cellWidth = this.displayWidth / GRID_WIDTH;
    const cellHeight = this.displayHeight / GRID_HEIGHT;

    this.ctx.strokeStyle = '#1e2235';
    this.ctx.lineWidth = 0.5;
    for (let x = 0; x <= GRID_WIDTH; x++) {
      this.ctx.beginPath();
      this.ctx.moveTo(x * cellWidth, 0);
      this.ctx.lineTo(x * cellWidth, this.displayHeight);
      this.ctx.stroke();
    }
    for (let y = 0; y <= GRID_HEIGHT; y++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y * cellHeight);
      this.ctx.lineTo(this.displayWidth, y * cellHeight);
      this.ctx.stroke();
    }

    // 3. Draw food (glowing red apple/sphere)
    const foodPos = food.getPosition();
    const foodX = foodPos.x * cellWidth + cellWidth / 2;
    const foodY = foodPos.y * cellHeight + cellHeight / 2;
    const foodRadius = Math.min(cellWidth, cellHeight) / 2.5;

    this.ctx.save();
    this.ctx.shadowBlur = 12;
    this.ctx.shadowColor = '#ef4444';
    this.ctx.fillStyle = '#f87171'; // Glowing red-pink
    this.ctx.beginPath();
    this.ctx.arc(foodX, foodY, foodRadius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();

    // 4. Draw snake (neon green)
    const snakeBody = snake.getBody();
    this.ctx.save();
    this.ctx.shadowBlur = 8;
    this.ctx.shadowColor = '#10b981';

    snakeBody.forEach((segment, index) => {
      const isHead = index === 0;
      
      if (isHead) {
        this.ctx.fillStyle = '#10b981'; // Primary emerald
      } else {
        const alpha = Math.max(0.3, 1 - index / (snakeBody.length + 2));
        this.ctx.fillStyle = `rgba(52, 211, 153, ${alpha})`; // Fading neon green-teal
      }

      const padding = 1.5;
      const x = segment.x * cellWidth + padding;
      const y = segment.y * cellHeight + padding;
      const w = cellWidth - padding * 2;
      const h = cellHeight - padding * 2;
      const r = isHead ? 5 : 3; // rounded corner radius

      this.ctx.beginPath();
      if (typeof this.ctx.roundRect === 'function') {
        this.ctx.roundRect(x, y, w, h, r);
      } else {
        this.ctx.rect(x, y, w, h);
      }
      this.ctx.fill();

      // Draw eyes on the snake head
      if (isHead) {
        const dir = snake.getDirection();
        this.ctx.fillStyle = '#ffffff';
        const eyeSize = 2.5;
        let eye1 = { x: 0, y: 0 };
        let eye2 = { x: 0, y: 0 };

        if (dir === 'RIGHT') {
          eye1 = { x: x + w - 4, y: y + 3 };
          eye2 = { x: x + w - 4, y: y + h - 3 - eyeSize };
        } else if (dir === 'LEFT') {
          eye1 = { x: x + 4, y: y + 3 };
          eye2 = { x: x + 4, y: y + h - 3 - eyeSize };
        } else if (dir === 'UP') {
          eye1 = { x: x + 3, y: y + 4 };
          eye2 = { x: x + w - 3 - eyeSize, y: y + 4 };
        } else if (dir === 'DOWN') {
          eye1 = { x: x + 3, y: y + h - 4 };
          eye2 = { x: x + w - 3 - eyeSize, y: y + h - 4 };
        }

        this.ctx.fillRect(eye1.x, eye1.y, eyeSize, eyeSize);
        this.ctx.fillRect(eye2.x, eye2.y, eyeSize, eyeSize);
      }
    });
    this.ctx.restore();

    // 5. Draw status overlays
    if (isGameOver) {
      this.drawTextOverlay('GAME OVER', 'Press Space or Click Restart', '#ef4444');
    } else if (isPaused) {
      this.drawTextOverlay('PAUSED', 'Press Space or Resume', '#3b82f6');
    }
  }

  private drawTextOverlay(title: string, subtitle: string, titleColor: string): void {
    // 1. Semi-transparent black background
    this.ctx.fillStyle = 'rgba(10, 11, 16, 0.85)';
    this.ctx.fillRect(0, 0, this.displayWidth, this.displayHeight);

    // 2. Draw CRT scanlines
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.025)';
    for (let y = 0; y < this.displayHeight; y += 4) {
      this.ctx.fillRect(0, y, this.displayWidth, 1.5);
    }

    // 3. Central glowing panel
    const boxW = this.displayWidth * 0.8;
    const boxH = 120;
    const boxX = (this.displayWidth - boxW) / 2;
    const boxY = (this.displayHeight - boxH) / 2;

    this.ctx.save();
    this.ctx.fillStyle = 'rgba(21, 23, 38, 0.8)';
    this.ctx.strokeStyle = titleColor;
    this.ctx.lineWidth = 1.5;
    this.ctx.shadowBlur = 15;
    this.ctx.shadowColor = titleColor;
    
    this.ctx.beginPath();
    if (typeof this.ctx.roundRect === 'function') {
      this.ctx.roundRect(boxX, boxY, boxW, boxH, 8);
    } else {
      this.ctx.rect(boxX, boxY, boxW, boxH);
    }
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.restore();

    // 4. Title Text
    this.ctx.save();
    this.ctx.font = "bold 24px 'Orbitron', 'Courier New', monospace";
    this.ctx.fillStyle = titleColor;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.shadowBlur = 8;
    this.ctx.shadowColor = titleColor;
    this.ctx.fillText(title, this.displayWidth / 2, this.displayHeight / 2 - 16);
    this.ctx.restore();
    
    // 5. Subtitle Text
    this.ctx.font = "500 12px 'Inter', sans-serif";
    this.ctx.fillStyle = '#94a3b8';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(subtitle, this.displayWidth / 2, this.displayHeight / 2 + 24);
  }
}
