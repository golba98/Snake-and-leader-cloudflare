export const getDOM = () => ({
  canvas: document.getElementById('game-canvas') as HTMLCanvasElement,
  score: document.getElementById('score-value') as HTMLSpanElement,
  bestScore: document.getElementById('best-score-value') as HTMLSpanElement,
  playPauseBtn: document.getElementById('play-pause-btn') as HTMLButtonElement,
  restartBtn: document.getElementById('restart-btn') as HTMLButtonElement,
  difficultyBtn: document.getElementById('difficulty-btn') as HTMLButtonElement,
  soundBtn: document.getElementById('sound-btn') as HTMLButtonElement,
  clearLeaderboardBtn: document.getElementById('clear-leaderboard-btn') as HTMLButtonElement,
  leaderboardBody: document.getElementById('leaderboard-body') as HTMLTableSectionElement,
  
  // Submit Score Modal
  submitScoreModal: document.getElementById('submit-score-modal') as HTMLDivElement,
  submitScoreForm: document.getElementById('submit-score-form') as HTMLFormElement,
  playerNameInput: document.getElementById('player-name-input') as HTMLInputElement,
  finalScoreDisplay: document.getElementById('final-score-display') as HTMLSpanElement,
  cancelSubmitBtn: document.getElementById('cancel-submit-btn') as HTMLButtonElement,
  
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

export function updatePlayPauseBtnState(state: 'PLAY' | 'PAUSE' | 'RESUME'): void {
  const btn = document.getElementById('play-pause-btn');
  if (!btn) return;
  
  if (state === 'PLAY') {
    btn.innerHTML = '<span class="icon">▶</span> Play';
    btn.className = 'arcade-btn primary-btn';
  } else if (state === 'PAUSE') {
    btn.innerHTML = '<span class="icon">⏸</span> Pause';
    btn.className = 'arcade-btn primary-btn';
  } else if (state === 'RESUME') {
    btn.innerHTML = '<span class="icon">▶</span> Resume';
    btn.className = 'arcade-btn primary-btn paused';
  }
}

export function togglePlayPauseBtn(isPaused: boolean): void {
  updatePlayPauseBtnState(isPaused ? 'RESUME' : 'PAUSE');
}

export function updateDifficultyBtn(label: string, color: string): void {
  const btn = document.getElementById('difficulty-btn');
  if (btn) {
    btn.innerHTML = `⚙️ ${label}`;
    btn.style.setProperty('--btn-glow', color);
  }
}

export function updateSoundBtn(isMuted: boolean): void {
  const btn = document.getElementById('sound-btn');
  if (btn) {
    btn.innerHTML = isMuted 
      ? '<span class="icon">🔇</span> Muted' 
      : '<span class="icon">🔊</span> Sound';
    if (isMuted) {
      btn.className = 'arcade-btn sound-btn muted';
    } else {
      btn.className = 'arcade-btn sound-btn';
    }
  }
}

