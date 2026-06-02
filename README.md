# Neon Snake Arcade

A polished, retro-arcade style Snake game featuring a modern theme and a local leaderboard system. Designed to compile cleanly into a static package for deployment on **Cloudflare Pages**.

## Features

- **Grid-Based Classic Snake**: Smooth grid movement, food spawning, and snake growth.
- **Dynamic Difficulty**: Snake speeds up progressively as your score increases.
- **Arcade Aesthetic**: Dark theme, glowing neon elements, digital score panels, and custom visual overlays.
- **Sharp Canvas Rendering**: Handles High-DPI screen displays natively for crisp rendering. Includes direction-aware graphics (e.g., eyes on the snake head looking in the direction of travel).
- **Responsive Controls**: Desktop keyboard support (WASD and Arrow keys) + mobile/touch-friendly virtual D-pad buttons.
- **Local Leaderboard**: Stores and ranks the top 10 scores with players' names and dates. Structured using Promise-based async functions to easily support transition to a backend API (like a Cloudflare Worker) in the future.
- **Fully Static**: Ready for deployment to static web hosts without any database server requirement.

## Project Architecture

The project has a modular, typed structure:

- `src/main.ts` - Application bootstrapper and UI event listeners.
- `src/styles/main.css` - Custom styling (Vanilla CSS) for dark arcade aesthetic.
- `src/game/`
  - `Game.ts` - Main game coordinator and Delta-time based animation loop.
  - `Snake.ts` - Snake body, movement, and collision checking.
  - `Food.ts` - Food spawning logic with full-grid fallback scanner.
  - `InputController.ts` - Input handler (WASD/Arrows/D-pad) with double-press prevention.
  - `Renderer.ts` - Canvas painter with Retina/4K high-DPI scaling.
  - `constants.ts` - Game configuration limits and keys.
  - `types.ts` - Game and state interfaces.
- `src/leaderboard/`
  - `Leaderboard.ts` - Leaderboard table compiler and HTML sanitizer.
  - `leaderboardStorage.ts` - Promise-wrapped localStorage wrapper.
  - `leaderboardTypes.ts` - Scores schema definition.
- `src/ui/`
  - `dom.ts` - Helper utilities for updating scoreboards and overlays.

## Getting Started

### Local Development

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Dev Server**
   ```bash
   npm run dev
   ```
   This will start a Vite local server (usually at `http://localhost:5173`).

### Production Build

To build the static application bundle:
```bash
npm run build
```
This compiles TypeScript and outputs the production bundle into the `dist/` directory.

You can preview the production build locally:
```bash
npm run preview
```

## Cloudflare Pages Deployment

This project is fully static and designed to run natively on Cloudflare Pages.

### Configuration on Cloudflare Pages Dashboard

When creating a new project in the Cloudflare Pages dashboard, link your Git repository and specify the following Build Settings:

- **Framework Preset**: `None`
- **Build Command**: `npm run build`
- **Build Output Directory**: `dist`

No server configuration or database systems are required for this deployment.
