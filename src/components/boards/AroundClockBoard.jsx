import React from 'react';

const TARGETS = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,'B'];

export default function AroundClockBoard({ state, onScore }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Player progress */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(state.players.length, 4)}, 1fr)`, gap: 8 }}>
        {state.players.map((p, i) => (
          <div key={i} style={{ background: i === state.currentPlayer ? 'rgba(59,130,246,0.12)' : 'var(--bg2)', border: `1px solid ${i === state.currentPlayer ? 'var(--blue)' : 'var(--border)'}`, borderRadius: 12, padding: '12px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: i === state.currentPlayer ? 'var(--blue)' : 'var(--text)' }}>
              {p.target === 'B' ? '🎯' : p.target}
            </div>
            <div style={{ fontSize: 10, color: 'var(--muted)' }}>needs</div>
          </div>
        ))}
      </div>

      {/* Current target */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--blue)', borderRadius: 14, padding: '16px', textAlign: 'center' }}>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 6 }}>{state.players[state.currentPlayer]?.name} — aim for</div>
        <div style={{ fontSize: 56, fontWeight: 900, color: 'var(--blue)' }}>
          {state.players[state.currentPlayer]?.target === 'B' ? '🎯 Bull' : state.players[state.currentPlayer]?.target}
        </div>
      </div>

      {/* Hit/Miss buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <button onClick={() => onScore({ hit: state.players[state.currentPlayer]?.target })}
          style={{ padding: '18px', background: 'rgba(16,185,129,0.15)', border: '2px solid var(--green)', borderRadius: 14, color: 'var(--green)', fontSize: 20, fontWeight: 800, cursor: 'pointer' }}>
          ✓ Hit
        </button>
        <button onClick={() => onScore({ hit: -1 })}
          style={{ padding: '18px', background: 'rgba(239,68,68,0.1)', border: '2px solid var(--danger)', borderRadius: 14, color: 'var(--danger)', fontSize: 20, fontWeight: 800, cursor: 'pointer' }}>
          ✗ Miss
        </button>
      </div>

      {/* Progress bar */}
      <div style={{ background: 'var(--bg2)', borderRadius: 10, padding: '10px 14px', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
          {TARGETS.map((t, i) => {
            const current = state.players[state.currentPlayer];
            const currentIdx = current?.target === 'B' ? 20 : (current?.target - 1);
            const done = i < currentIdx;
            const active = i === currentIdx;
            return (
              <div key={t} style={{ width: 26, height: 26, borderRadius: 6, background: done ? 'var(--green)' : active ? 'var(--blue)' : 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: done || active ? '#fff' : 'var(--muted)' }}>
                {t === 'B' ? 'B' : t}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
