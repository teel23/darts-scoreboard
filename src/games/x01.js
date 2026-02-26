// X01 game engine (301 / 501 / 701)
// PPD = totalPointsScored / totalDartsThrown (tracked per player)

export function initX01(config) {
  return {
    mode: 'x01',
    variant: config.x01Variant,
    finishRule: config.finishRule,
    players: config.players.map(name => ({
      name,
      score: config.x01Variant,
      history: [],
      totalDartsThrown: 0,
      totalPointsScored: 0,
    })),
    currentPlayer: 0,
    round: 1,
  };
}

export function scoreX01(state, points, dartsUsed) {
  const player = state.players[state.currentPlayer];
  const newScore = player.score - points;

  // Bust conditions
  if (newScore < 0) return { ...state, bust: true, message: `Bust! Score stays at ${player.score}` };
  if (newScore === 0 && state.finishRule === 'double' && points % 2 !== 0)
    return { ...state, bust: true, message: 'Must finish on a double!' };
  if (newScore === 1 && state.finishRule === 'double')
    return { ...state, bust: true, message: 'Bust! Cannot leave 1 on double out.' };

  const darts = dartsUsed || 3;
  const newPlayers = state.players.map((p, i) =>
    i === state.currentPlayer
      ? {
          ...p,
          score: newScore,
          history: [...p.history, points],
          totalDartsThrown: p.totalDartsThrown + darts,
          totalPointsScored: p.totalPointsScored + points,
        }
      : p
  );

  if (newScore === 0) return { ...state, players: newPlayers, winner: state.players[state.currentPlayer].name };

  const next = (state.currentPlayer + 1) % state.players.length;
  return {
    ...state,
    players: newPlayers,
    currentPlayer: next,
    bust: false,
    message: null,
    round: next === 0 ? state.round + 1 : state.round,
  };
}
