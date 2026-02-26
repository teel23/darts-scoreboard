import React from 'react';

const CONFETTI_COLORS = ['#3B82F6','#f59e0b','#10b981','#ef4444','#8b5cf6','#ec4899'];

function Confetti() {
  const pieces = Array.from({ length: 40 }, (_, i) => i);
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 10 }}>
      {pieces.map(i => (
        <div key={i} style={{
          position: 'absolute',
          left: `${Math.random() * 100}%`,
          top: `-20px`,
          width: `${6 + Math.random() * 8}px`,
          height: `${6 + Math.random() * 8}px`,
          background: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
          borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          animation: `confetti ${2 + Math.random() * 3}s linear ${Math.random() * 2}s forwards`,
          opacity: 0,
        }} />
      ))}
    </div>
  );
}

const MODE_LABELS = { x01: '01 Game', cricket: 'Cricket', bermuda: 'Bermuda / Halve-It', tictactoe: 'Tic Tac Toe' };

function ppd(player) {
  const darts = player.totalDartsThrown || 0;
  const pts = player.totalPointsScored !== undefined ? player.totalPointsScored
    : player.points !== undefined ? player.points
    : 0;
  if (darts === 0) return '—';
  return (pts / darts).toFixed(2);
}

function finalScore(player, mode, data) {
  if (mode === 'x01') return `${player.score} left`;
  if (mode === 'cricket') return `${player.points || 0} pts`;
  if (mode === 'bermuda') return `${player.score} pts`;
  if (mode === 'tictactoe') {
    // Count squares claimed by this player
    const pi = data.players.findIndex(p => p.name === player.name);
    const squares = data.claimed ? data.claimed.filter(c => c === pi).length : 0;
    return `${squares} square${squares !== 1 ? 's' : ''}`;
  }
  return '';
}

export default function Winner({ data, onPlayAgain, onHome }) {
  if (!data) return null;

  // Sort players: winner first, then by score descending
  const sorted = data.players ? [...data.players].sort((a, b) => {
    if (a.name === data.winner) return -1;
    if (b.name === data.winner) return 1;
    // x01: lower score left = better
    if (data.mode === 'x01') return a.score - b.score;
    // cricket / bermuda: higher score = better
    const scoreA = a.points !== undefined ? a.points : a.score || 0;
    const scoreB = b.points !== undefined ? b.points : b.score || 0;
    return scoreB - scoreA;
  }) : [];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', textAlign: 'center' }}>
      <Confetti />

      <div className="fade-in" style={{ zIndex: 20, maxWidth: 420, width: '100%' }}>
        <div style={{ fontSize: 72, marginBottom: 4 }}>{data.draw ? '🤝' : '🏆'}</div>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 2 }}>{MODE_LABELS[data.mode]}</div>
        {data.draw ? (
          <>
            <div style={{ fontSize: 38, fontWeight: 900, color: 'var(--accent)', marginBottom: 2, lineHeight: 1.1 }}>It's a Draw!</div>
            <div style={{ fontSize: 18, color: 'var(--text)', marginBottom: 28 }}>All squares claimed 🎯</div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 38, fontWeight: 900, color: 'var(--blue)', marginBottom: 2, lineHeight: 1.1 }}>{data.winner}</div>
            <div style={{ fontSize: 18, color: 'var(--text)', marginBottom: 28 }}>Wins! 🎯</div>
          </>
        )}

        {/* Final standings with PPD */}
        {sorted.length > 0 && (
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, padding: 16, marginBottom: 28, textAlign: 'left' }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Final Standings</div>

            {/* Header row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 8, paddingBottom: 6, borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
              <div style={{ fontSize: 10, color: 'var(--muted)' }}>Player</div>
              <div style={{ fontSize: 10, color: 'var(--muted)', textAlign: 'right' }}>Score</div>
              <div style={{ fontSize: 10, color: 'var(--muted)', textAlign: 'right', minWidth: 52 }}>PPD</div>
            </div>

            {sorted.map((p, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 8, alignItems: 'center', padding: '9px 0', borderBottom: i < sorted.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16 }}>{p.name === data.winner ? '🥇' : i === 1 ? '🥈' : '🎯'}</span>
                  <span style={{ fontWeight: p.name === data.winner ? 700 : 400, color: p.name === data.winner ? 'var(--blue)' : 'var(--text)', fontSize: 14 }}>{p.name}</span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'right' }}>
                  {finalScore(p, data.mode, data)}
                </div>
                <div style={{ minWidth: 52, textAlign: 'right' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: p.name === data.winner ? 'var(--green)' : 'var(--muted)', background: p.name === data.winner ? 'rgba(16,185,129,0.1)' : 'var(--bg3)', padding: '2px 7px', borderRadius: 8, border: `1px solid ${p.name === data.winner ? 'var(--green)' : 'var(--border)'}` }}>
                    {ppd(p)}
                  </span>
                </div>
              </div>
            ))}

            <div style={{ marginTop: 10, fontSize: 10, color: 'var(--muted)', textAlign: 'center' }}>
              PPD = Points Per Dart
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button onClick={onPlayAgain} style={{ padding: '16px', background: 'var(--blue)', border: 'none', borderRadius: 14, color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>
            🔄 Play Again
          </button>
          <button onClick={onHome} style={{ padding: '16px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, color: 'var(--text)', fontSize: 16, fontWeight: 600, cursor: 'pointer' }}>
            🏠 Home
          </button>
        </div>
      </div>
    </div>
  );
}
