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
    if (!parent) return;

    const width  = parent.clientWidth;
    const height = parent.clientHeight;
    const size   = Math.max(200, Math.min(width, height, 640));

    this.displayWidth  = size;
    this.displayHeight = size;

    const dpr = window.devicePixelRatio || 1;
    this.canvas.width  = this.displayWidth * dpr;
    this.canvas.height = this.displayHeight * dpr;

    this.canvas.style.width  = `${this.displayWidth}px`;
    this.canvas.style.height = `${this.displayHeight}px`;

    this.ctx.resetTransform();
    this.ctx.scale(dpr, dpr);
  }

  public draw(snake: Snake, food: Food, _isPaused: boolean, _isGameOver: boolean): void {
    const W = this.displayWidth;
    const H = this.displayHeight;
    const cw = W / GRID_WIDTH;
    const ch = H / GRID_HEIGHT;

    // ── 1. Board background ──────────────────────────────────────────────────
    // Deep space fill
    this.ctx.fillStyle = '#060810';
    this.ctx.fillRect(0, 0, W, H);

    // Subtle radial centre glow — gives depth without clutter
    const cx = W / 2;
    const cy = H / 2;
    const glow = this.ctx.createRadialGradient(cx, cy, 0, cx, cy, W * 0.72);
    glow.addColorStop(0,   'rgba(6, 16, 38, 0.55)');
    glow.addColorStop(0.5, 'rgba(4, 8, 20, 0.2)');
    glow.addColorStop(1,   'rgba(0, 0, 0, 0)');
    this.ctx.fillStyle = glow;
    this.ctx.fillRect(0, 0, W, H);

    // ── 2. Grid ──────────────────────────────────────────────────────────────
    this.ctx.strokeStyle = 'rgba(30, 40, 72, 0.55)';
    this.ctx.lineWidth = 0.5;

    for (let x = 0; x <= GRID_WIDTH; x++) {
      this.ctx.beginPath();
      this.ctx.moveTo(Math.round(x * cw) + 0.5, 0);
      this.ctx.lineTo(Math.round(x * cw) + 0.5, H);
      this.ctx.stroke();
    }
    for (let y = 0; y <= GRID_HEIGHT; y++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, Math.round(y * ch) + 0.5);
      this.ctx.lineTo(W, Math.round(y * ch) + 0.5);
      this.ctx.stroke();
    }

    // ── 3. Food ──────────────────────────────────────────────────────────────
    const foodPos = food.getPosition();
    const fx = foodPos.x * cw + cw / 2;
    const fy = foodPos.y * ch + ch / 2;
    const fr = Math.min(cw, ch) / 2.6;

    this.ctx.save();

    // Outer glow pulse via layered shadows
    this.ctx.shadowBlur = 20;
    this.ctx.shadowColor = '#f04545';
    this.ctx.fillStyle = '#f04545';
    this.ctx.beginPath();
    this.ctx.arc(fx, fy, fr, 0, Math.PI * 2);
    this.ctx.fill();

    // Inner bright core
    this.ctx.shadowBlur = 0;
    const foodGrad = this.ctx.createRadialGradient(fx - fr * 0.3, fy - fr * 0.3, 0, fx, fy, fr);
    foodGrad.addColorStop(0, '#ffa0a0');
    foodGrad.addColorStop(0.5, '#f87171');
    foodGrad.addColorStop(1, '#c42020');
    this.ctx.fillStyle = foodGrad;
    this.ctx.beginPath();
    this.ctx.arc(fx, fy, fr, 0, Math.PI * 2);
    this.ctx.fill();

    // Specular highlight
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    this.ctx.beginPath();
    this.ctx.arc(fx - fr * 0.28, fy - fr * 0.28, fr * 0.28, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();

    // ── 4. Snake ─────────────────────────────────────────────────────────────
    const snakeBody = snake.getBody();
    const len = snakeBody.length;

    this.ctx.save();

    snakeBody.forEach((segment, index) => {
      const isHead = index === 0;
      const pad = isHead ? 1 : 1.5;
      const x = segment.x * cw + pad;
      const y = segment.y * ch + pad;
      const w = cw - pad * 2;
      const h = ch - pad * 2;
      const r = isHead ? 5 : 3;

      // Fade body towards tail
      const alpha = isHead ? 1 : Math.max(0.25, 1 - (index / (len + 3)) * 0.85);

      if (isHead) {
        // Head: bright emerald with glow
        this.ctx.shadowBlur  = 14;
        this.ctx.shadowColor = 'rgba(15, 186, 129, 0.8)';
        this.ctx.fillStyle   = '#0fba81';
      } else {
        // Body: fading teal-green
        this.ctx.shadowBlur  = 6;
        this.ctx.shadowColor = `rgba(15, 186, 129, ${alpha * 0.5})`;
        this.ctx.fillStyle   = `rgba(16, 200, 150, ${alpha})`;
      }

      // Rounded rect path
      this.ctx.beginPath();
      if (typeof this.ctx.roundRect === 'function') {
        this.ctx.roundRect(x, y, w, h, r);
      } else {
        this.ctx.rect(x, y, w, h);
      }
      this.ctx.fill();

      // Inner highlight stripe on body segments
      if (!isHead && alpha > 0.4) {
        this.ctx.shadowBlur = 0;
        this.ctx.fillStyle  = `rgba(255, 255, 255, ${alpha * 0.06})`;
        this.ctx.beginPath();
        if (typeof this.ctx.roundRect === 'function') {
          this.ctx.roundRect(x + 1, y + 1, w - 2, Math.min(3, h * 0.3), 1);
        } else {
          this.ctx.rect(x + 1, y + 1, w - 2, Math.min(3, h * 0.3));
        }
        this.ctx.fill();
      }

      // Snake eyes on head
      if (isHead) {
        const dir = snake.getDirection();
        this.ctx.shadowBlur = 0;
        this.ctx.fillStyle  = '#ffffff';
        const es = 2.2; // eye size
        let e1 = { x: 0, y: 0 };
        let e2 = { x: 0, y: 0 };

        if (dir === 'RIGHT') {
          e1 = { x: x + w - 5,      y: y + 3.5       };
          e2 = { x: x + w - 5,      y: y + h - 3.5 - es };
        } else if (dir === 'LEFT') {
          e1 = { x: x + 5 - es,     y: y + 3.5       };
          e2 = { x: x + 5 - es,     y: y + h - 3.5 - es };
        } else if (dir === 'UP') {
          e1 = { x: x + 3.5,        y: y + 5 - es    };
          e2 = { x: x + w - 3.5 - es, y: y + 5 - es  };
        } else { // DOWN
          e1 = { x: x + 3.5,        y: y + h - 5     };
          e2 = { x: x + w - 3.5 - es, y: y + h - 5   };
        }

        this.ctx.fillRect(e1.x, e1.y, es, es);
        this.ctx.fillRect(e2.x, e2.y, es, es);
      }
    });

    this.ctx.restore();

    // ── 5. Edge vignette ─────────────────────────────────────────────────────
    const vig = this.ctx.createRadialGradient(cx, cy, W * 0.35, cx, cy, W * 0.75);
    vig.addColorStop(0, 'transparent');
    vig.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
    this.ctx.fillStyle = vig;
    this.ctx.fillRect(0, 0, W, H);
  }
}
