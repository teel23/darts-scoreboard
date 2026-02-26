// Tic Tac Toe Darts game engine
// 3x3 grid. 8 random singles (1-20, no repeats) assigned to outer squares, Bull in center.
// To claim a square: hit the assigned number 3 times (singles=1, doubles=2, triples=3).
// Once claimed, locked — cannot be stolen.
// First player to get 3 in a row (horizontal, vertical, diagonal) wins.

// Grid positions (0–8), row-major:
//  0 | 1 | 2
//  3 | 4 | 5
//  6 | 7 | 8
// Position 4 is always Bull (25).

export const TTT_WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
  [0, 4, 8], [2, 4, 6],             // diagonals
];

// Generate 8 unique random numbers from 1–20 for the outer squares
function randomTargets() {
  const pool = Array.from({ length: 20 }, (_, i) => i + 1);
  const chosen = [];
  while (chosen.length < 8) {
    const idx = Math.floor(Math.random() * pool.length);
    chosen.push(pool.splice(idx, 1)[0]);
  }
  return chosen;
}

// Returns the target for each grid position (0-8). Position 4 = Bull ('B').
function buildGrid(targets) {
  // targets: 8 numbers for positions 0,1,2,3,5,6,7,8 (skip 4 = center)
  const grid = [];
  let ti = 0;
  for (let i = 0; i < 9; i++) {
    if (i === 4) {
      grid.push('B');
    } else {
      grid.push(targets[ti++]);
    }
  }
  return grid;
}

export function initTicTacToe(config) {
  const targets = randomTargets();
  const grid = buildGrid(targets);

  return {
    mode: 'tictactoe',
    players: config.players.slice(0, 2).map((name, i) => ({
      name,
      symbol: i === 0 ? 'X' : 'O',
    })),
    grid,           // array of 9 targets (numbers or 'B')
    hits: Array(9).fill(0),    // how many hits each square has (0, 1, 2 = progress; 3 = claimed)
    claimed: Array(9).fill(null), // null | 0 | 1 (player index who claimed it)
    currentPlayer: 0,
    round: 1,
    winner: null,
  };
}

// Record a single dart hit on a target number.
// Returns next state (does NOT advance player — caller does that after full turn).
export function scoreTicTacToe(state, number, multiplier) {
  if (state.winner) return state;
  const pi = state.currentPlayer;

  // Find which squares match this number
  const newHits = [...state.hits];
  const newClaimed = [...state.claimed];

  let anyChange = false;
  state.grid.forEach((target, idx) => {
    if (target !== number) return;
    if (newClaimed[idx] !== null) return; // already locked
    newHits[idx] = Math.min(3, newHits[idx] + multiplier);
    if (newHits[idx] >= 3) {
      newClaimed[idx] = pi;
    }
    anyChange = true;
  });

  if (!anyChange) return state;

  const newState = { ...state, hits: newHits, claimed: newClaimed };
  const winner = checkTTTWinner(newState);
  return { ...newState, winner };
}

export function advanceTTTPlayer(state) {
  const next = (state.currentPlayer + 1) % 2;
  return {
    ...state,
    currentPlayer: next,
    round: next === 0 ? state.round + 1 : state.round,
  };
}

function checkTTTWinner(state) {
  for (const line of TTT_WIN_LINES) {
    const [a, b, c] = line;
    if (
      state.claimed[a] !== null &&
      state.claimed[a] === state.claimed[b] &&
      state.claimed[a] === state.claimed[c]
    ) {
      return state.players[state.claimed[a]].name;
    }
  }
  // Check draw: all squares claimed and no winner
  if (state.claimed.every(c => c !== null)) return 'DRAW';
  return null;
}

// Live preview: compute hits/claimed if localDarts were applied to state
export function computeLiveTTT(state, localDarts) {
  let s = state;
  for (const d of localDarts) {
    if (d.number === null) continue;
    s = scoreTicTacToe({ ...s, currentPlayer: state.currentPlayer }, d.number, d.multiplier);
  }
  return { hits: s.hits, claimed: s.claimed, winner: s.winner };
}
