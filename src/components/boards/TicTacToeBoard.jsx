import React, { useState } from 'react';
import { computeLiveTTT } from '../../games/tictactoe';

const PLAYER_COLORS = ['#d4a03c', '#4fc3f7'];
const PLAYER_SYMBOLS = ['X', 'O'];

export default function TicTacToeBoard({ state, onSubmitTurn, onUndo }) {
  const [darts, setDarts] = useState([]);
  const [selectedNum, setSelectedNum] = useState(null);
  const [feedbackLine, setFeedbackLine] = useState('');

  const pi = state.currentPlayer;
  const player = state.players[pi];
  const dartsUsed = darts.length;

  const live = computeLiveTTT(state, darts);
  const liveHits = live.hits;
  const liveClaimed = live.claimed;

  const resetTurn = () => {
    setDarts([]);
    setSelectedNum(null);
    setFeedbackLine('');
  };

  const submitTurn = (dartList) => {
    onSubmitTurn(dartList);
    resetTurn();
  };

  const recordHit = (number, multiplier) => {
    if (dartsUsed >= 3) return;
    const dart = { number, multiplier };
    const newDarts = [...darts, dart];
    setDarts(newDarts);
    setSelectedNum(null);

    const prevLive = computeLiveTTT(state, darts);
    const nextLive = computeLiveTTT(state, newDarts);
    const newlyClaimed = nextLive.claimed.findIndex((c, i) => c !== null && prevLive.claimed[i] === null);
    const multLabel = multiplier === 3 ? 'Triple' : multiplier === 2 ? 'Double' : 'Single';
    const numLabel = number === 'B' ? 'Bull' : number;

    if (newlyClaimed !== -1) {
      setFeedbackLine(`✅ ${multLabel} ${numLabel} — Claimed!`);
    } else {
      const hitOpen = state.grid.some((t, i) => t === number && state.claimed[i] === null);
      setFeedbackLine(hitOpen ? `🎯 ${multLabel} ${numLabel}` : `❌ ${multLabel} ${numLabel} — No target`);
    }

    if (newDarts.length >= 3) {
      setTimeout(() => submitTurn(newDarts), 700);
    }
  };

  const recordMiss = () => {
    if (dartsUsed >= 3) return;
    const newDarts = [...darts, { number: null, multiplier: 0 }];
    setDarts(newDarts);
    setSelectedNum(null);
    setFeedbackLine('❌ Miss');
    if (newDarts.length >= 3) {
      setTimeout(() => submitTurn(newDarts), 700);
    }
  };

  const handleUndo = () => {
    if (darts.length > 0) {
      setDarts(d => d.slice(0, -1));
      setFeedbackLine('');
      setSelectedNum(null);
    } else {
      onUndo && onUndo();
    }
  };

  const handleNext = () => {
    if (darts.length > 0) submitTurn(darts);
  };

  const playerColor = PLAYER_COLORS[pi];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden' }}>

      {/* ── Player header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: `${playerColor}22`,
            border: `2px solid ${playerColor}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 900, color: playerColor,
            textShadow: `0 0 12px ${playerColor}`,
          }}>
            {PLAYER_SYMBOLS[pi]}
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--felt-muted)', textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 700 }}>Now Throwing</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--felt-text)', lineHeight: 1 }}>{player.name}</div>
          </div>
        </div>

        {/* Dart slots */}
        <div style={{ display: 'flex', gap: 4 }}>
          {[0, 1, 2].map(i => {
            const d = darts[i];
            const slotColors = ['#d4a03c', '#e74c3c', '#2ecc71'];
            return (
              <div key={i} style={{
                width: 30, height: 30, borderRadius: 8,
                background: d ? `${slotColors[i]}22` : 'rgba(0,0,0,0.3)',
                border: `2px solid ${d ? slotColors[i] : 'rgba(255,255,255,0.12)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, fontWeight: 900,
                color: d ? slotColors[i] : 'rgba(255,255,255,0.25)',
              }}>
                {d ? (d.number === null ? '✗' : `${d.multiplier === 3 ? 'T' : d.multiplier === 2 ? 'D' : 'S'}${d.number === 'B' ? 'B' : d.number}`) : (i + 1)}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── TTT board (compact, standalone) ── */}
      <div style={{ flexShrink: 0 }}>
        {/* Player key */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          {state.players.map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{
                fontSize: 14, fontWeight: 900,
                color: PLAYER_COLORS[i],
                opacity: i === pi ? 1 : 0.45,
              }}>{PLAYER_SYMBOLS[i]}</span>
              <span style={{
                fontSize: 12, fontWeight: 700,
                color: i === pi ? 'var(--felt-text)' : 'var(--felt-muted)',
              }}>{p.name}</span>
              {i === pi && <span style={{ fontSize: 9, color: PLAYER_COLORS[i], fontWeight: 700 }}>▲</span>}
            </div>
          ))}
        </div>

        {/* 3×3 grid — clean, board-game style */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 0,
          borderRadius: 12,
          overflow: 'hidden',
          border: '2px solid rgba(255,255,255,0.1)',
        }}>
          {state.grid.map((target, idx) => {
            const claimed = liveClaimed[idx];
            const hits = liveHits[idx];
            const isClaimed = claimed !== null;
            const claimColor = isClaimed ? PLAYER_COLORS[claimed] : null;
            const isCenter = idx === 4;
            const col = idx % 3;
            const row = Math.floor(idx / 3);
            const borderRight = col < 2 ? '1px solid rgba(255,255,255,0.1)' : 'none';
            const borderBottom = row < 2 ? '1px solid rgba(255,255,255,0.1)' : 'none';

            return (
              <div key={idx} style={{
                aspectRatio: '1',
                borderRight, borderBottom,
                background: isClaimed
                  ? `${claimColor}18`
                  : isCenter ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.2)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.25s',
                padding: 4,
              }}>
                {isClaimed ? (
                  <div style={{
                    fontSize: 26, fontWeight: 900,
                    color: claimColor,
                    textShadow: `0 0 16px ${claimColor}`,
                    lineHeight: 1,
                  }}>
                    {PLAYER_SYMBOLS[claimed]}
                  </div>
                ) : (
                  <>
                    <div style={{
                      fontSize: isCenter ? 11 : 13, fontWeight: 800,
                      color: isCenter ? '#fbbf24' : 'rgba(255,255,255,0.5)',
                      lineHeight: 1,
                    }}>
                      {target === 'B' ? 'BULL' : target}
                    </div>
                    <div style={{ display: 'flex', gap: 2, marginTop: 3 }}>
                      {[0,1,2].map(i => (
                        <div key={i} style={{
                          width: 5, height: 5, borderRadius: '50%',
                          background: i < hits ? playerColor : 'rgba(255,255,255,0.12)',
                          boxShadow: i < hits ? `0 0 4px ${playerColor}` : 'none',
                          transition: 'background 0.2s',
                        }} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Feedback ── */}
      <div style={{
        flexShrink: 0, height: 20, textAlign: 'center',
        fontSize: 12, fontWeight: 700,
        color: feedbackLine.includes('Claimed') ? '#4ade80'
             : feedbackLine.includes('❌') ? '#f87171'
             : 'var(--felt-muted)',
      }}>
        {feedbackLine || `Dart ${Math.min(dartsUsed + 1, 3)} of 3`}
      </div>

      {/* ── Big keyboard — main input area ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, minHeight: 0 }}>
        {/* 3×3 large target buttons */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 6,
          flex: 1,
          minHeight: 0,
        }}>
          {state.grid.map((target, idx) => {
            const claimed = liveClaimed[idx];
            const hits = liveHits[idx];
            const isClaimed = claimed !== null;
            const claimColor = isClaimed ? PLAYER_COLORS[claimed] : null;
            const isCenter = idx === 4;

            return (
              <button
                key={idx}
                onClick={() => { if (dartsUsed < 3 && !isClaimed) setSelectedNum(target); }}
                disabled={dartsUsed >= 3 || isClaimed}
                style={{
                  borderRadius: 14,
                  background: isClaimed
                    ? `${claimColor}18`
                    : isCenter ? 'rgba(255,200,0,0.08)' : 'rgba(255,255,255,0.06)',
                  border: `2px solid ${isClaimed ? claimColor : isCenter ? 'rgba(255,200,0,0.3)' : 'rgba(255,255,255,0.14)'}`,
                  color: isClaimed ? claimColor : isCenter ? '#fbbf24' : 'var(--felt-text)',
                  fontSize: isClaimed ? 26 : isCenter ? 15 : 22,
                  fontWeight: 900,
                  cursor: (dartsUsed >= 3 || isClaimed) ? 'not-allowed' : 'pointer',
                  opacity: (dartsUsed >= 3 && !isClaimed) ? 0.35 : 1,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  gap: 5,
                  transition: 'all 0.15s',
                  minHeight: 0,
                  textShadow: isClaimed ? `0 0 12px ${claimColor}` : 'none',
                }}
              >
                <span>{isClaimed ? PLAYER_SYMBOLS[claimed] : (target === 'B' ? 'BULL' : target)}</span>
                {!isClaimed && hits > 0 && (
                  <div style={{ display: 'flex', gap: 3 }}>
                    {[0,1,2].map(i => (
                      <div key={i} style={{
                        width: 7, height: 7, borderRadius: '50%',
                        background: i < hits ? playerColor : 'rgba(255,255,255,0.15)',
                        boxShadow: i < hits ? `0 0 5px ${playerColor}` : 'none',
                      }} />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Control row: Miss / Undo / Next */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, flexShrink: 0 }}>
          <button onClick={recordMiss} disabled={dartsUsed >= 3} style={ctrlBtn('#f87171', dartsUsed >= 3)}>
            ✗ Miss
          </button>
          <button onClick={handleUndo} style={ctrlBtn('#8a7355', false)}>
            ↩ Undo
          </button>
          <button onClick={handleNext} disabled={dartsUsed === 0} style={ctrlBtn('#d4a03c', dartsUsed === 0)}>
            Next ▶
          </button>
        </div>
      </div>

      {/* ── Multiplier overlay ── */}
      {selectedNum !== null && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(10,8,4,0.88)',
          display: 'flex', alignItems: 'flex-end',
        }}>
          <div className="wood-panel" style={{
            width: '100%', maxWidth: 500, margin: '0 auto',
            borderRadius: '20px 20px 0 0',
            padding: 20, display: 'flex', flexDirection: 'column', gap: 12,
            border: '2px solid rgba(212,160,60,0.5)',
            borderBottom: 'none',
            paddingBottom: 'calc(20px + env(safe-area-inset-bottom))',
          }}>
            <div style={{ textAlign: 'center', fontSize: 18, fontWeight: 900, color: '#d4a03c', letterSpacing: 1 }}>
              {selectedNum === 'B' ? 'BULL' : selectedNum} — Select Multiplier
            </div>
            <button onClick={() => recordHit(selectedNum, 1)} style={overlayBtn('#f5e9cc', 'rgba(245,233,204,0.08)', 'rgba(245,233,204,0.3)')}>
              Single <span style={{ fontSize: 14, opacity: 0.7 }}>· 1 hit</span>
            </button>
            <button onClick={() => recordHit(selectedNum, 2)} style={overlayBtn('#2ecc71', 'rgba(46,204,113,0.1)', '#2ecc71')}>
              Double <span style={{ fontSize: 14, opacity: 0.8 }}>· 2 hits</span>
            </button>
            {selectedNum !== 'B' && (
              <button onClick={() => recordHit(selectedNum, 3)} style={overlayBtn('#d4a03c', 'rgba(212,160,60,0.1)', '#d4a03c')}>
                Triple <span style={{ fontSize: 14, opacity: 0.8 }}>· Claim!</span>
              </button>
            )}
            <button onClick={() => setSelectedNum(null)} style={{ padding: '12px', background: 'none', border: '1px solid rgba(212,160,60,0.2)', borderRadius: 12, color: '#8a7355', fontSize: 14, cursor: 'pointer' }}>
              ← Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function overlayBtn(color, bg, borderColor) {
  return {
    padding: '18px',
    background: bg,
    border: `2px solid ${borderColor}`,
    borderRadius: 14,
    color: color,
    fontSize: 18, fontWeight: 900,
    cursor: 'pointer',
    textShadow: `0 0 8px ${color}`,
    letterSpacing: 1,
  };
}

function ctrlBtn(color, disabled) {
  return {
    padding: '13px',
    background: disabled ? 'rgba(0,0,0,0.2)' : `${color}22`,
    border: `1px solid ${disabled ? 'rgba(255,255,255,0.1)' : color}`,
    borderRadius: 12,
    color: disabled ? 'rgba(255,255,255,0.2)' : color,
    fontSize: 13, fontWeight: 800,
    cursor: disabled ? 'not-allowed' : 'pointer',
    letterSpacing: 0.5,
    textShadow: disabled ? 'none' : `0 0 6px ${color}88`,
  };
}
