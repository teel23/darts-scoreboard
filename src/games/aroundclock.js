// Around the Clock — hit 1 through 20 in order, then bullseye to win
export function initAroundClock(config) {
  return {
    mode: 'aroundclock',
    players: config.players.map(name => ({ name, target: 1 })),
    currentPlayer: 0,
    round: 1,
  };
}

export function scoreAroundClock(state, hit) {
  const pi = state.currentPlayer;
  const player = state.players[pi];
  const target = player.target;

  let newTarget = target;
  let winner = null;

  if (hit === target) {
    if (target === 20) {
      newTarget = 'B'; // next is bullseye
    } else if (target === 'B') {
      winner = player.name;
      newTarget = 'B';
    } else {
      newTarget = target + 1;
    }
  }

  const newPlayers = state.players.map((p, i) =>
    i === pi ? { ...p, target: newTarget } : p
  );

  const next = (pi + 1) % state.players.length;
  return {
    ...state,
    players: newPlayers,
    currentPlayer: next,
    winner,
    hit: hit === target,
    round: next === 0 ? state.round + 1 : state.round,
  };
}
