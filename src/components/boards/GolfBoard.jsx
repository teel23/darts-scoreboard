import React from 'react';

export default function GolfBoard({ state, onScore }) {
  const hole = state.currentHole;
  const current = state.players[state.currentPlayer];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Hole info */}
      <div style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid var(--blue)', borderRadius: 14, padding: '16px', textAlign: 'center' }}>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 4 }}>Hole {hole} of {state.totalHoles}</div>
        <div style={{ fontSize: 52, fontWeight: 900, color: 'var(--blue)' }}>⛳ {hole}</div>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>{current?.name} — Dart {state.dartsThrown + 1} of 5</div>
      </div>

      {/* Scorecard */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: `80px repeat(${state.totalHoles}, 1fr) 50px`, background: 'var(--bg3)', padding: '8px 10px', fontSize: 10, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', gap: 2 }}>
          <div>Player</div>
          {Array.from({ length: state.totalHoles }, (_, i) => <div key={i} style={{ textAlign: 'center' }}>{i + 1}</div>)}
          <div style={{ textAlign: 'center' }}>Tot</div>
        </div>
        {state.players.map((p, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: `80px repeat(${state.totalHoles}, 1fr) 50px`, padding: '8px 10px', borderTop: '1px solid var(--border)', gap: 2, background: i === state.currentPlayer ? 'rgba(59,130,246,0.05)' : 'transparent' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: i === state.currentPlayer ? 'var(--blue)' : 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
            {Array.from({ length: state.totalHoles }, (_, h) => (
              <div key={h} style={{ textAlign: 'center', fontSize: 12, fontWeight: 600, color: p.scores[h] !== undefined ? (p.scores[h] <= 2 ? 'var(--green)' : p.scores[h] === 5 ? 'var(--danger)' : 'var(--text)') : 'var(--muted)' }}>
                {p.scores[h] !== undefined ? p.scores[h] : h < hole - 1 ? '-' : ''}
              </div>
            ))}
            <div style={{ textAlign: 'center', fontSize: 13, fontWeight: 800, color: 'var(--text)' }}>{p.totalDarts || '-'}</div>
          </div>
        ))}
      </div>

      {/* Hit/Miss */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <button onClick={() => onScore({ hit: hole })}
          style={{ padding: '18px', background: 'rgba(16,185,129,0.15)', border: '2px solid var(--green)', borderRadius: 14, color: 'var(--green)', fontSize: 20, fontWeight: 800, cursor: 'pointer' }}>
          ✓ Hit {hole}
        </button>
        <button onClick={() => onScore({ hit: -1 })}
          style={{ padding: '18px', background: 'rgba(239,68,68,0.1)', border: '2px solid var(--danger)', borderRadius: 14, color: 'var(--danger)', fontSize: 20, fontWeight: 800, cursor: 'pointer' }}>
          ✗ Miss
        </button>
      </div>
    </div>
  );
}
