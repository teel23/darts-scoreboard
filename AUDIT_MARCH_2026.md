# Darts Scoreboard — Audit Report
*Generated: March 2026*

## Current State
- Live URL: https://darts.c2tbuilds.com
- GitHub Repo: https://github.com/teel23/darts-scoreboard
- Hosting Platform: Vercel ✅
- Auto-Deploy: Yes (push to main → Vercel builds)
- Status: Live / Featured

## Tech Stack
- Framework: React 18.2
- Build Tool: Vite 5.4 + @vitejs/plugin-react 4.3
- Key Libraries: React, React DOM
- Node Version: Not pinned (no .nvmrc, no engines field)
- Deprecated Tech: None — pure Vite/React, no CRA

> NOTE: A `build/` directory exists in the project root alongside the correct `dist/` directory. The `build/` folder contains CRA-style output (asset-manifest.json, sw.js) and appears to be a leftover from a previous version of the project when it may have used react-scripts. It is NOT produced by the current Vite build and is dead waste.

## Deployment Health
- Vercel config: ✅ Created this session (`vercel.json` with buildCommand, outputDirectory: dist, framework: vite, SPA rewrites)
- Netlify files removed: ✅ `.netlify/` directory deleted this session
- Portfolio links correct: ✅ darts.c2tbuilds.com confirmed correct in Portfolio

## Dead Code & Waste
- Unused files: `build/` directory — entire folder is dead (CRA-era leftover). Safe to delete.
- Unused components: None identified — all game boards are wired to game mode selection
- Unused assets: None
- Console.logs in prod: None
- Other waste:
  - `dist/` directory committed to git (build artifact — should be in .gitignore if not already)

## Completion Assessment
**Percent complete: 85%**

### What's done:
- 4 complete game modes: 501/301/701, Cricket, Tic Tac Toe, Bermuda Triangle
- Per-player dart tracking (3 darts/turn)
- Undo last throw
- Auto-advance after 3 darts
- Live dartboard visual
- PWA installable
- Deployed on Vercel with custom domain

### What's missing to call this finished:
- Player name persistence (currently lost on refresh — needs localStorage)
- Around the Clock game mode exists as a file (aroundclock.js, AroundClockBoard.jsx) but was not visible in game selection — verify it is wired up or remove if abandoned
- Match history / stats

## Next Phase Plan
### Phase: Persistence + Stats
**Goal:** Make the app feel complete for regular players
**Features:**
- Player name persistence via localStorage
- Match history: date, mode, players, winner
- Basic stats: win %, games played per mode
**Estimated effort:** 1-2 sessions

## Quick Fixes Done This Session
- Deleted `.netlify/` directory
- Created `vercel.json` (Vite SPA config with rewrites)
