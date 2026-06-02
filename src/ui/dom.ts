export const getDOM = () => ({
  canvas: document.getElementById('game-canvas') as HTMLCanvasElement,
  score: document.getElementById('score-value') as HTMLSpanElement,
  bestScore: document.getElementById('best-score-value') as HTMLSpanElement,
  playPauseBtn: document.getElementById('play-pause-btn') as HTMLButtonElement,
  restartBtn: document.getElementById('restart-btn') as HTMLButtonElement,
  clearLeaderboardBtn: document.getElementById('clear-leaderboard-btn') as HTMLButtonElement,
  leaderboardBody: document.getElementById('leaderboard-body') as HTMLTableSectionElement,
  
  // Canvas Overlays
  readyOverlay: document.getElementById('ready-overlay') as HTMLDivElement,
  gameOverOverlay: document.getElementById('game-over-overlay') as HTMLDivElement,
  gameOverScore: document.getElementById('game-over-score') as HTMLSpanElement,
  pauseOverlay: document.getElementById('pause-overlay') as HTMLDivElement,
  submitScoreOverlay: document.getElementById('submit-score-overlay') as HTMLDivElement,
  overlayRestartBtn: document.getElementById('overlay-restart-btn') as HTMLButtonElement,
  
  // Submit Score Form details (inside the overlay)
  submitScoreForm: document.getElementById('submit-score-form') as HTMLFormElement,
  playerNameInput: document.getElementById('player-name-input') as HTMLInputElement,
  finalScoreDisplay: document.getElementById('final-score-display') as HTMLSpanElement,
  cancelSubmitBtn: document.getElementById('cancel-submit-btn') as HTMLButtonElement,
  
  // Game settings
  difficultySelect: document.getElementById('difficulty-select') as HTMLSelectElement,
  soundBtn: document.getElementById('sound-btn') as HTMLButtonElement,
  
  // Mobile controls
  btnUp: document.getElementById('ctrl-up') as HTMLButtonElement,
  btnDown: document.getElementById('ctrl-down') as HTMLButtonElement,
  btnLeft: document.getElementById('ctrl-left') as HTMLButtonElement,
  btnRight: document.getElementById('ctrl-right') as HTMLButtonElement,
});

export function updateScoreDisplay(score: number): void {
  const el = document.getElementById('score-value');
  if (el) el.textContent = String(score);
}

export function updateBestScoreDisplay(score: number): void {
  const el = document.getElementById('best-score-value');
  if (el) el.textContent = String(score);
}

export function updateSpeedDisplay(level: number): void {
  const el = document.getElementById('speed-value');
  if (el) el.textContent = `LVL ${level}`;
}

export function togglePlayPauseBtn(isPaused: boolean, isReady: boolean): void {
  const btn = document.getElementById('play-pause-btn');
  if (btn) {
    if (isReady) {
      btn.innerHTML = '<span class="icon">▶</span> Start';
      btn.classList.remove('paused');
    } else {
      btn.innerHTML = isPaused 
        ? '<span class="icon">▶</span> Resume' 
        : '<span class="icon">⏸</span> Pause';
      if (isPaused) {
        btn.classList.add('paused');
      } else {
        btn.classList.remove('paused');
      }
    }
  }
}
