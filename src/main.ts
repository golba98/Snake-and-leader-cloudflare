import './styles/main.css';
import { Game } from './game/Game.ts';
import { Leaderboard } from './leaderboard/Leaderboard.ts';
import { getDOM } from './ui/dom.ts';
import type { Difficulty } from './game/constants.ts';

const dom = getDOM();
const leaderboard = new Leaderboard();

// Initialize the Leaderboard rendering
leaderboard.init(dom.leaderboardBody);

// Initialize and start the Game
const game = new Game(dom.canvas, leaderboard);
game.start();

// Control buttons event wiring
dom.playPauseBtn?.addEventListener('click', () => {
  game.togglePause();
});

dom.restartBtn?.addEventListener('click', () => {
  game.reset();
});

dom.overlayRestartBtn?.addEventListener('click', () => {
  game.reset();
});

// Settings controllers
dom.difficultySelect?.addEventListener('change', (e) => {
  const select = e.target as HTMLSelectElement;
  game.changeDifficulty(select.value as Difficulty);
});

dom.soundBtn?.addEventListener('click', () => {
  game.toggleMute();
});

dom.clearLeaderboardBtn?.addEventListener('click', () => {
  game.playClick();
  const confirmed = confirm('Are you sure you want to clear the local leaderboard? This cannot be undone.');
  if (confirmed) {
    leaderboard.clear();
  }
});

// Score submission form submission handler
dom.submitScoreForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = dom.playerNameInput.value.trim() || 'ANONYMOUS';
  const score = game.getScore();

  await leaderboard.submitScore(name, score);
  game.reset();
  
  // Auto-switch to leaderboard tab so user sees their rank
  const leaderboardTabBtn = document.querySelector('.nav-btn[data-target="tab-leaderboard"]') as HTMLButtonElement;
  leaderboardTabBtn?.click();
});

// Overlay cancel button handler
dom.cancelSubmitBtn?.addEventListener('click', () => {
  game.cancelSubmit();
});

// "Back to Game" action helper for views
document.querySelectorAll('.back-to-game-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    game.playClick();
    const playTabBtn = document.querySelector('.nav-btn[data-target="tab-arcade"]') as HTMLButtonElement;
    playTabBtn?.click();
  });
});

// Mobile/Touch D-pad button bindings
const inputCtrl = game.getInputController();

dom.btnUp?.addEventListener('click', () => { game.playClick(); inputCtrl.setDirection('UP'); });
dom.btnDown?.addEventListener('click', () => { game.playClick(); inputCtrl.setDirection('DOWN'); });
dom.btnLeft?.addEventListener('click', () => { game.playClick(); inputCtrl.setDirection('LEFT'); });
dom.btnRight?.addEventListener('click', () => { game.playClick(); inputCtrl.setDirection('RIGHT'); });

// Prevent delay and zooming on iOS and mobile browsers for immediate response
const dpadMapping = [
  { element: dom.btnUp, dir: 'UP' as const },
  { element: dom.btnDown, dir: 'DOWN' as const },
  { element: dom.btnLeft, dir: 'LEFT' as const },
  { element: dom.btnRight, dir: 'RIGHT' as const }
];

dpadMapping.forEach(({ element, dir }) => {
  element?.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Prevents mobile touch scroll/zoom delay
    game.playClick();
    inputCtrl.setDirection(dir);
  }, { passive: false });
});

// Tab navigation handler
const navButtons = document.querySelectorAll('.nav-btn');
const tabContents = document.querySelectorAll('[data-tab-content]');

navButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const targetId = btn.getAttribute('data-target');
    if (!targetId) return;

    game.playClick();

    navButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    tabContents.forEach(t => t.classList.remove('active'));
    const targetTab = document.getElementById(targetId);
    if (targetTab) {
      targetTab.classList.add('active');
    }

    // Auto-pause game if switching away from the Arcade screen
    if (targetId !== 'tab-arcade') {
      if (!game.isPaused() && !game.isGameOver() && !game.isReady()) {
        game.togglePause();
      }
    }

    // Trigger window resize to align canvas scaling to the new active container
    window.dispatchEvent(new Event('resize'));
  });
});
