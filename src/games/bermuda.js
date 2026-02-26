// Bermuda / Halve-It — 13-round bar machine rules
//
// Rounds & targets:
//  1: 12         2: 13         3: 14
//  4: Any Double 5: 15         6: 16
//  7: 17         8: Any Triple 9: 18
// 10: 19        11: 20        12: Bull (25/50)
// 13: Any Double or Triple
//
// Scoring per round:
//   - Hit the target: score += hit value (single=face, double=2x, triple=3x)
//   - Miss ALL three darts: total accumulated score is halved (floor)
//   - Hit at least one dart: no penalty, even if other darts miss
// After 13 rounds the player with the highest score wins.

export const ROUNDS = [
  { id: 1,  label: '12',              type: 'number',  value: 12  },
  { id: 2,  label: '13',              type: 'number',  value: 13  },
  { id: 3,  label: '14',              type: 'number',  value: 14  },
  { id: 4,  label: 'Any Double',      type: 'double'              },
  { id: 5,  label: '15',              type: 'number',  value: 15  },
  { id: 6,  label: '16',              type: 'number',  value: 16  },
  { id: 7,  label: '17',              type: 'number',  value: 17  },
  { id: 8,  label: 'Any Triple',      type: 'triple'              },
  { id: 9,  label: '18',              type: 'number',  value: 18  },
  { id: 10, label: '19',              type: 'number',  value: 19  },
  { id: 11, label: '20',              type: 'number',  value: 20  },
  { id: 12, label: 'Bull',            type: 'bull'                },
  { id: 13, label: 'Double or Triple',type: 'doubleOrTriple'      },
];

export const TOTAL_ROUNDS = ROUNDS.length; // 13

// Does a dart count as a hit for the current round?
export function isValidHit(round, dartNumber, dartMultiplier) {
  switch (round.type) {
    case 'number':
      return dartNumber === round.value;
    case 'double':
      return dartMultiplier === 2;
    case 'triple':
      return dartMultiplier === 3;
    case 'bull':
      return dartNumber === 'B' || dartNumber === 25;
    case 'doubleOrTriple':
      return dartMultiplier === 2 || dartMultiplier === 3;
    default:
      return false;
  }
}

// Points scored for a single valid dart hit
export function dartPoints(round, dartNumber, dartMultiplier) {
  switch (round.type) {
    case 'number':
      return round.value * dartMultiplier;
    case 'double':
      return dartNumber === 'B' ? 50 : dartNumber * 2;
    case 'triple':
      return dartNumber * 3;
    case 'bull':
      return dartMultiplier === 2 ? 50 : 25;
    case 'doubleOrTriple':
      return dartNumber === 'B'
        ? (dartMultiplier === 2 ? 50 : 0)
        : dartNumber * dartMultiplier;
    default:
      return 0;
  }
}

export function initBermuda(config) {
  return {
    mode: 'bermuda',
    players: config.players.map(name => ({
      name,
      score: 0,
      totalDartsThrown: 0, // for PPD
      totalPointsScored: 0,
    })),
    currentPlayer: 0,
    currentRound: 0,     // index into ROUNDS (0–12)
    dartsThrown: [],     // current turn: [{number, multiplier, hit, points}]
    roundScored: 0,      // points earned so far this turn
    hitThisTurn: false,  // true if any dart hit this turn
    gameOver: false,
    winner: null,
  };
}

// Record a single dart. Returns new state — does NOT advance player/round.
export function recordBermudaDart(state, dartNumber, dartMultiplier) {
  if (state.gameOver) return state;
  const round = ROUNDS[state.currentRound];
  const hit = isValidHit(round, dartNumber, dartMultiplier);
  const pts = hit ? dartPoints(round, dartNumber, dartMultiplier) : 0;

  const dart = { number: dartNumber, multiplier: dartMultiplier, hit, points: pts };
  const newDarts = [...state.dartsThrown, dart];

  return {
    ...state,
    dartsThrown: newDarts,
    roundScored: state.roundScored + pts,
    hitThisTurn: state.hitThisTurn || hit,
  };
}

// Finalize the current player's turn (call after 3 darts or manual Next).
// Applies scoring / halve penalty, then advances currentPlayer or round.
export function endBermudaTurn(state) {
  const pi = state.currentPlayer;
  const player = state.players[pi];

  // Apply penalty: if NO dart hit the target this turn, halve accumulated score
  let newScore;
  if (!state.hitThisTurn) {
    newScore = Math.floor(player.score / 2);
  } else {
    newScore = player.score + state.roundScored;
  }

  const dartsUsedThisTurn = state.dartsThrown.length;
  const newTotalDarts = player.totalDartsThrown + dartsUsedThisTurn;
  const newTotalPoints = player.totalPointsScored + (state.hitThisTurn ? state.roundScored : 0);

  const newPlayers = state.players.map((p, i) =>
    i === pi
      ? { ...p, score: newScore, totalDartsThrown: newTotalDarts, totalPointsScored: newTotalPoints }
      : p
  );

  const numPlayers = state.players.length;
  const nextPlayer = (pi + 1) % numPlayers;

  // Advance round when all players have thrown
  const newRound = nextPlayer === 0 ? state.currentRound + 1 : state.currentRound;
  const gameOver = newRound >= TOTAL_ROUNDS;

  // Find winner: highest score
  let winner = null;
  if (gameOver) {
    const maxScore = Math.max(...newPlayers.map(p => p.score));
    const winners = newPlayers.filter(p => p.score === maxScore);
    winner = winners.map(p => p.name).join(' & '); // handle ties
  }

  return {
    ...state,
    players: newPlayers,
    currentPlayer: gameOver ? pi : nextPlayer,
    currentRound: gameOver ? state.currentRound : newRound,
    dartsThrown: [],
    roundScored: 0,
    hitThisTurn: false,
    gameOver,
    winner,
  };
}
