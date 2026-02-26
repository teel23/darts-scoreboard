import React from 'react';

const MODES = [
  { id: 'x01',       label: '01 Games',    icon: '🎯', desc: '301 · 501 · 701  |  1–8 players' },
  { id: 'cricket',   label: 'Cricket',     icon: '🏏', desc: '1–4 players' },
  { id: 'tictactoe', label: 'Tic Tac Toe', icon: '#️⃣', desc: '2 players · hit 3 to claim · 3 in a row wins' },
  { id: 'bermuda',   label: 'Bermuda',     icon: '🔺', desc: '1–8 players · bar machine rules' },
];

export default function Home({ onSelectMode, theme, onToggleTheme }) {
  const [hovered, setHovered] = React.useState(null);
  const isDark = theme === 'dark';

  return (
    <div className="fade-in" style={{ height: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 16px', overflow: 'hidden' }}>

      {/* Theme toggle */}
      <div style={{ position: 'absolute', top: 'max(18px, env(safe-area-inset-top, 18px))', right: 18 }}>
        <button
          onClick={onToggleTheme}
          style={{
            background: isDark ? 'rgba(212,160,60,0.1)' : 'rgba(139,90,30,0.12)',
            border: `1px solid ${isDark ? 'rgba(212,160,60,0.3)' : 'rgba(139,90,30,0.3)'}`,
            borderRadius: 20,
            padding: '6px 14px',
            display: 'flex', alignItems: 'center', gap: 6,
            cursor: 'pointer',
            color: 'var(--accent)',
            fontSize: 13, fontWeight: 700,
            transition: 'all 0.2s',
          }}
        >
          {isDark ? '☀️ Light' : '🌙 Dark'}
        </button>
      </div>

      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ fontSize: 52, fontWeight: 900, letterSpacing: '-1px', color: 'var(--text)' }}>
          🎯 Darts
        </div>
        <div style={{ color: 'var(--text2)', fontSize: 15, marginTop: 4 }}>Pick a game mode to get started</div>
      </div>

      {/* Mode cards */}
      <div style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {MODES.map(m => (
          <button
            key={m.id}
            className="felt-panel"
            onMouseEnter={() => setHovered(m.id)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onSelectMode(m.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '18px 20px',
              borderRadius: 16,
              cursor: 'pointer',
              textAlign: 'left', width: '100%',
              border: `2px solid ${hovered === m.id ? 'var(--accent)' : 'var(--felt-border)'}`,
              transform: hovered === m.id ? 'translateX(4px)' : 'none',
              transition: 'all 0.18s',
            }}
          >
            <span style={{ fontSize: 30, minWidth: 38, textAlign: 'center' }}>{m.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--felt-text)' }}>{m.label}</div>
              <div style={{ fontSize: 12, color: 'var(--felt-muted)', marginTop: 2 }}>{m.desc}</div>
            </div>
            <span style={{ color: 'var(--accent)', fontSize: 22, fontWeight: 900 }}>›</span>
          </button>
        ))}
      </div>
    </div>
  );
}
