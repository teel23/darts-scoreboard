# AI_CONTEXT — Darts Scoreboard
> For AI assistant use. Read this at the start of every session to get up to speed instantly.
> **Update this file after every meaningful change.**

---

## Project Identity
- **Name:** Darts Scoreboard
- **Type:** Progressive Web App (PWA)
- **Live URL:** https://darts.c2tbuilds.com
- **GitHub:** https://github.com/teel23/darts-scoreboard *(create this repo — see MASTER.md)*
- **Netlify:** Connect GitHub repo to auto-deploy on push
- **Status:** Live / Featured (no beta tag)

---

## Tech Stack
| Layer | Tech |
|---|---|
| Framework | React |
| Language | JavaScript |
| Styling | CSS |
| Build | Create React App or similar |
| PWA | Service Worker, Web App Manifest |
| Deployment | Netlify |

---

## Game Modes
1. **01 Games** — 301, 501, 701 (throw down to zero)
2. **Cricket** — Close numbers 15-20 and bullseye
3. **Tic Tac Toe Darts** — Grid-based darts variant
4. **Bermuda Triangle (Halve-It)** — Miss and your score halves

## Key Features
- Per-player dart tracking (3 darts per turn)
- Undo history
- Auto-advance after 3 darts
- Live dartboard display
- Installable on any device (PWA)

---

## Key File Map
```
src/              ← Main React source
public/           ← Static assets, manifest.json
build/            ← Production build output (gitignored)
```

---

## Deployment Flow
1. Make changes in `/AI/Darts/darts-app/`
2. `npm run build` to verify it builds
3. `git add . && git commit -m "message"`
4. `git push` → Netlify auto-deploys
5. Update this file

---

## Recent Changes (update after each session)
| Date | Change |
|---|---|
| Feb 2026 | Initialized git repo, added docs |

---

## Next Steps
- [ ] Connect GitHub repo to Netlify for auto-deploy
- [ ] Add player name persistence (localStorage)
- [ ] Add match history / stats tracking
- [ ] Sound effects option
- [ ] Multiplayer / shareable game room (stretch goal)
