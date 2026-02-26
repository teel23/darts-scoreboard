import React, { useState } from 'react';
import { initX01, scoreX01 } from '../games/x01';
import { initCricket, scoreCricket, advanceCricketPlayer } from '../games/cricket';
import { initBermuda } from '../games/bermuda';
import { initTicTacToe, scoreTicTacToe, advanceTTTPlayer } from '../games/tictactoe';
import X01Board from './boards/X01Board';
import CricketBoard from './boards/CricketBoard';
import BermudaBoard from './boards/BermudaBoard';
import TicTacToeBoard from './boards/TicTacToeBoard';

function initGame(config) {
  switch (config.mode) {
    case 'x01':       return initX01(config);
    case 'cricket':   return initCricket(config);
    case 'bermuda':   return initBermuda(config);
    case 'tictactoe': return initTicTacToe(config);
    default:          return null;
  }
}

export default function Game({ config, onEnd, onBack }) {
  const [state, setState] = useState(() => initGame(config));
  const [flash, setFlash] = useState(null);
  const [history, setHistory] = useState([]); // state snapshots for undo

  const pushHistory = (s) => setHistory(h => [...h.slice(-20), s]);

  const showFlash = (msg) => { setFlash(msg); setTimeout(() => setFlash(null), 2000); };

  // x01 scoring
  const handleX01Score = ({ points, darts, forced }) => {
    pushHistory(state);
    const dartsUsed = darts ? darts.filter(d => d.number !== null).length : 3;
    const newState = scoreX01(state, points, dartsUsed);
    if (newState.bust) { showFlash(`💥 Bust! Score stays at ${state.players[state.currentPlayer].score}`); return; }
    if (newState.winner) { onEnd({ winner: newState.winner, players: newState.players, mode: config.mode }); return; }
    setState(newState);
  };

  const handleX01NextPlayer = () => {
    pushHistory(state);
    const next = (state.currentPlayer + 1) % state.players.length;
    setState({ ...state, currentPlayer: next, round: next === 0 ? state.round + 1 : state.round });
  };

  // Cricket — receive full dart list for the turn, process each dart sequentially,
  // stop immediately if a winner is found mid-turn, then advance player.
  const handleCricketSubmitTurn = (dartList) => {
    pushHistory(state);
    let current = state;
    for (const dart of dartList) {
      if (dart.number === null) continue; // miss — no state change
      const next = scoreCricket(current, dart.number, dart.hits || dart.multiplier);
      if (next.winner) {
        onEnd({ winner: next.winner, players: next.players, mode: config.mode });
        return; // stop — don't throw remaining darts or advance
      }
      current = next;
    }
    // No winner — advance to next player
    setState(advanceCricketPlayer(current));
  };

  // Tic Tac Toe — receive full dart list, process sequentially, stop on winner
  const handleTTTSubmitTurn = (dartList) => {
    pushHistory(state);
    let current = state;
    for (const dart of dartList) {
      if (dart.number === null) continue;
      const next = scoreTicTacToe(current, dart.number, dart.multiplier);
      if (next.winner) {
        if (next.winner === 'DRAW') {
          onEnd({ winner: null, draw: true, players: next.players, claimed: next.claimed, mode: config.mode });
        } else {
          onEnd({ winner: next.winner, players: next.players, claimed: next.claimed, mode: config.mode });
        }
        return;
      }
      current = next;
    }
    setState(advanceTTTPlayer(current));
  };

  const handleUndo = () => {
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setHistory(h => h.slice(0, -1));
      setState(prev);
      showFlash('↩ Last throw undone');
    }
  };

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', maxWidth: 500, margin: '0 auto', padding: '8px 14px', overflow: 'hidden' }}>
      {/* Header — felt panel */}
      <div className="felt-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, borderRadius: 12, padding: '6px 12px', flexShrink: 0 }}>
        <button onClick={onBack} style={{ background: 'rgba(192,57,43,0.2)', border: '1px solid var(--danger)', color: '#ff6b6b', fontSize: 13, fontWeight: 800, cursor: 'pointer', padding: '8px 14px', borderRadius: 10, letterSpacing: 0.5 }}>
          ✕ Quit
        </button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: 'var(--felt-muted)', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>Round</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--accent)', textShadow: '0 0 10px rgba(212,160,60,0.6)' }}>{state.round}</div>
        </div>
        <button onClick={handleUndo} disabled={history.length === 0}
          style={{ background: history.length > 0 ? 'rgba(212,160,60,0.15)' : 'none', border: `1px solid ${history.length > 0 ? 'var(--accent)' : 'rgba(255,255,255,0.1)'}`, color: history.length > 0 ? 'var(--accent)' : 'rgba(255,255,255,0.25)', fontSize: 13, fontWeight: 800, cursor: history.length > 0 ? 'pointer' : 'default', padding: '8px 14px', borderRadius: 10, textShadow: history.length > 0 ? '0 0 6px rgba(212,160,60,0.5)' : 'none' }}>
          ↩ Undo
        </button>
      </div>

      {/* Flash message */}
      {flash && (
        <div className="felt-panel" style={{ borderRadius: 10, padding: '10px 14px', marginBottom: 10, textAlign: 'center', fontSize: 14, fontWeight: 700, color: '#d4a03c', textShadow: '0 0 8px rgba(212,160,60,0.5)' }}>
          {flash}
        </div>
      )}

      {config.mode === 'x01' && (
        <X01Board state={state} onScore={handleX01Score} onUndo={handleUndo} onNextPlayer={handleX01NextPlayer} />
      )}
      {config.mode === 'cricket' && (
        <CricketBoard state={state} onSubmitTurn={handleCricketSubmitTurn} onUndo={handleUndo} />
      )}
      {config.mode === 'bermuda' && (
        <BermudaBoard state={state} onStateChange={(s) => { pushHistory(state); setState(s); }} onEnd={onEnd} onUndo={handleUndo} />
      )}
      {config.mode === 'tictactoe' && (
        <TicTacToeBoard state={state} onSubmitTurn={handleTTTSubmitTurn} onUndo={handleUndo} />
      )}
    </div>
  );
}
