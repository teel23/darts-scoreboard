import React, { useState } from 'react';

const MODE_LABELS = { x01: '01 Games', cricket: 'Cricket', tictactoe: 'Tic Tac Toe', aroundclock: 'Around the Clock', golf: 'Golf', bermuda: 'Bermuda' };
const MAX_PLAYERS = { x01: 8, cricket: 4, tictactoe: 2, aroundclock: 8, golf: 8, bermuda: 8 };

const btn = (active) => ({
  padding: '10px 20px', borderRadius: 10, border: active ? '2px solid var(--blue)' : '2px solid var(--border)',
  background: active ? 'rgba(59,130,246,0.15)' : 'var(--bg2)', color: active ? 'var(--blue)' : 'var(--muted)',
  fontWeight: 700, fontSize: 15, cursor: 'pointer', transition: 'all 0.2s',
});

export default function Setup({ config, onStart, onBack }) {
  const mode = config.mode;
  const maxP = MAX_PLAYERS[mode];

  const [players, setPlayers] = useState(['', '']);
  const [x01Variant, setX01Variant] = useState(501);
  const [finishRule, setFinishRule] = useState('straight');

  const addPlayer = () => { if (players.length < maxP) setPlayers([...players, '']); };
  const removePlayer = (i) => { if (players.length > 1) setPlayers(players.filter((_, idx) => idx !== i)); };
  const updatePlayer = (i, v) => { const p = [...players]; p[i] = v; setPlayers(p); };

  const canStart = players.filter(p => p.trim()).length >= (mode === 'cricket' || mode === 'tictactoe' ? 2 : 1);

  const handleStart = () => {
    const names = players.filter(p => p.trim()).map((p, i) => p.trim() || `Player ${i + 1}`);
    onStart({ mode, players: names, x01Variant, finishRule });
  };

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', padding: '12px 16px 16px', maxWidth: 480, margin: '0 auto', overflow: 'hidden' }} className="fade-in">
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 15, marginBottom: 12, alignSelf: 'flex-start', padding: 0 }}>
        ← Back
      </button>

      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 2 }}>{MODE_LABELS[mode]}</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 20, fontSize: 13 }}>Set up your game</p>

      {/* 01 variant picker */}
      {mode === 'x01' && (
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>Starting Score</label>
          <div style={{ display: 'flex', gap: 10 }}>
            {[301, 501, 701].map(v => (
              <button key={v} style={btn(x01Variant === v)} onClick={() => setX01Variant(v)}>{v}</button>
            ))}
          </div>
        </div>
      )}

      {/* Finish rule */}
      {mode === 'x01' && (
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>Finish Rule</label>
          <div style={{ display: 'flex', gap: 10 }}>
            <button style={btn(finishRule === 'straight')} onClick={() => setFinishRule('straight')}>Straight Out</button>
            <button style={btn(finishRule === 'double')} onClick={() => setFinishRule('double')}>Double Out</button>
          </div>
        </div>
      )}

      {/* Players */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>
          Players ({players.length}/{maxP})
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {players.map((p, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                value={p}
                onChange={e => updatePlayer(i, e.target.value)}
                placeholder={`Player ${i + 1}`}
                maxLength={16}
                style={{ flex: 1, padding: '12px 14px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)', fontSize: 15, outline: 'none' }}
              />
              {players.length > 1 && (
                <button onClick={() => removePlayer(i)} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: 8, width: 38, height: 38, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
              )}
            </div>
          ))}
        </div>

        {players.length < maxP && (
          <button onClick={addPlayer} style={{ marginTop: 10, width: '100%', padding: '11px', background: 'none', border: '1px dashed var(--border)', borderRadius: 10, color: 'var(--muted)', fontSize: 14, cursor: 'pointer' }}>
            + Add Player
          </button>
        )}
      </div>

      <div style={{
        marginTop: 'auto',
        padding: '14px',
        borderRadius: 18,
        background: canStart ? 'rgba(59,130,246,0.08)' : 'transparent',
        border: `2px solid ${canStart ? 'rgba(59,130,246,0.4)' : 'var(--border)'}`,
        transition: 'all 0.2s',
      }}>
        <button
          onClick={handleStart}
          disabled={!canStart}
          style={{ width: '100%', padding: '16px', background: canStart ? 'var(--blue)' : 'var(--bg3)', color: canStart ? '#fff' : 'var(--muted)', border: 'none', borderRadius: 12, fontSize: 17, fontWeight: 700, cursor: canStart ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}
        >
          Start Game 🎯
        </button>
      </div>
    </div>
  );
}
