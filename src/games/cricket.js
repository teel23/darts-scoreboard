// Cricket game engine
// Numbers: 15, 16, 17, 18, 19, 20, Bull

export const CRICKET_NUMBERS = [20, 19, 18, 17, 16, 15, 'B'];

export function initCricket(config) {
  const initMarks = () => Object.fromEntries(CRICKET_NUMBERS.map(n => [n, 0]));
  return {
    mode: 'cricket',
    players: config.players.map(name => ({
      name,
      marks: initMarks(),
      points: 0,
    })),
    currentPlayer: 0,
    round: 1,
  };
}

// scoreCricket: records a single dart hit. Does NOT advance currentPlayer.
// Call advanceCricketPlayer() separately when the player's turn is done.
export function scoreCricket(state, number, hits) {
  // hits = 1 (single), 2 (double), 3 (triple)
  const pi = state.currentPlayer;
  const player = state.players[pi];

  if (!CRICKET_NUMBERS.includes(number)) return state;

  const currentMarks = player.marks[number];
  const newMarks = Math.min(3, currentMarks + hits);
  const scoringHits = Math.max(0, (currentMarks + hits) - 3);

  // Award points only if number is still open for other players
  let pointsToAdd = 0;
  const numVal = number === 'B' ? 25 : number;
  const othersClosed = state.players.every((p, i) => i === pi || p.marks[number] >= 3);

  if (scoringHits > 0 && !othersClosed) {
    pointsToAdd = scoringHits * numVal;
  }

  const newPlayers = state.players.map((p, i) => {
    if (i !== pi) return p;
    return {
      ...p,
      marks: { ...p.marks, [number]: newMarks },
      points: p.points + pointsToAdd,
    };
  });

  // Check win: all numbers closed AND highest or equal points
  const updatedState = { ...state, players: newPlayers };
  const winner = checkCricketWinner(updatedState, pi);

  // Stay on same player — caller advances when turn ends
  return { ...updatedState, winner };
}

// Call this when the player finishes their 3-dart turn
export function advanceCricketPlayer(state) {
  const pi = state.currentPlayer;
  const next = (pi + 1) % state.players.length;
  return { ...state, currentPlayer: next, round: next === 0 ? state.round + 1 : state.round };
}

function checkCricketWinner(state, pi) {
  const player = state.players[pi];
  const allClosed = CRICKET_NUMBERS.every(n => player.marks[n] >= 3);
  if (!allClosed) return null;
  const maxPoints = Math.max(...state.players.map(p => p.points));
  if (player.points >= maxPoints) return player.name;
  return null;
}
