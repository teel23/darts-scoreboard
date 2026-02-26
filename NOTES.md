# Darts Scoreboard — Project Notes
> Your reference for jumping back into this project anytime.
> **Update the Recent Changes section after every session.**

---

## What It Is
A mobile-first darts scoring PWA. Supports four game modes: 01 Games (301/501/701), Cricket, Tic Tac Toe Darts, and Bermuda Triangle (Halve-It). Installable on any phone or tablet like a native app.

## Live URL
🌐 **https://darts.c2tbuilds.com**

## GitHub
📁 **https://github.com/teel23/darts-scoreboard** *(needs to be created — see MASTER.md)*

---

## Current Features
- 4 game modes
- Per-player dart tracking (3 darts per turn)
- Undo last throw
- Auto-advance after 3 darts
- Live dartboard visual
- Install to home screen (PWA)

## Status
✅ Live and working | ⭐ Featured

---

## How to Deploy Changes
1. Open terminal in `/AI/Darts/darts-app/`
2. `npm run build` (verify it builds clean)
3. `git add .`
4. `git commit -m "describe what changed"`
5. `git push`
6. Netlify auto-deploys (takes ~1-2 min)

---

## Recent Changes (keep updated)
| Date | What Changed |
|---|---|
| Feb 2026 | Initialized git repo, created project docs |

---

## Next Steps
- [ ] Connect GitHub → Netlify auto-deploy
- [ ] Player name persistence
- [ ] Match history and stats
- [ ] Optional sound effects

---

## Future Feature Plan — Connectivity + Stats

### Auth
- Magic link via email (Supabase Auth)
- No passwords — works seamlessly across all devices

### Groups
- Create a group, invite friends via code or link
- Small scale — personal friend groups only

### Stats
- Per-player stats: games played, win %, favourite mode
- Head-to-head records between friends
- Game history with date, mode, players, winner
- Stats persist and sync cross-device via Supabase

### Admin / Commissioner Mode (Carson only)
- `is_admin` flag on users table
- Private dashboard showing all flagged games
- Ability to edit individual scores or delete games
- Soft delete only — data never permanently lost
- Flagged games show ⚠️ in group stats until reviewed

### Data Model (Supabase)
| Table | Key Columns |
|---|---|
| `users` | id, username, email, is_admin |
| `groups` | id, name, created_by, invite_code |
| `group_members` | group_id, user_id, joined_at |
| `games` | id, group_id, mode, played_at, is_flagged, flag_reason, deleted |
| `game_players` | game_id, user_id, final_score, rank, won |
| `game_events` | game_id, round, player_id, dart data |
