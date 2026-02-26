// Golf Darts — 9 holes (numbers 1-9), aim for fewest darts per hole
// Each hole: throw at the number equal to the hole. Score = darts thrown to hit it (max 5 = bogey)
// Lowest total score wins

export function initGolf(config) {
  return {
    mode: 'golf',
    players: config.players.map(name => ({ name, scores: [], totalDarts: 0 })),
    currentPlayer: 0,
    currentHole: 1,
    totalHoles: 9,
    dartsThrown: 0,
    round: 1,
  };
}

export function scoreGolf(state, hit) {
  const pi = state.currentPlayer;
  const player = state.players[pi];
  const hole = state.currentHole;
  const dartsThrown = state.dartsThrown + 1;

  const scored = hit === hole || dartsThrown >= 5;
  const holeScore = scored ? dartsThrown : null;

  if (!scored) {
    return { ...state, dartsThrown, message: `Miss! Dart ${dartsThrown}/5` };
  }

  const newPlayers = state.players.map((p, i) =>
    i === pi ? { ...p, scores: [...p.scores, holeScore], totalDarts: p.totalDarts + holeScore } : p
  );

  const next = (pi + 1) % state.players.length;
  const allDoneHole = next === 0;
  const nextHole = allDoneHole ? hole + 1 : hole;
  const gameOver = allDoneHole && hole >= state.totalHoles;

  let winner = null;
  if (gameOver) {
    const minScore = Math.min(...newPlayers.map(p => p.totalDarts));
    winner = newPlayers.find(p => p.totalDarts === minScore).name;
  }

  return {
    ...state,
    players: newPlayers,
    currentPlayer: next,
    currentHole: nextHole,
    dartsThrown: 0,
    winner,
    message: `Hole ${hole}: ${holeScore} dart${holeScore !== 1 ? 's' : ''}`,
    round: allDoneHole ? state.round + 1 : state.round,
  };
}
