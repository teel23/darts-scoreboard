import React, { useState, useRef } from 'react';
import Dartboard from '../Dartboard';
import { CRICKET_NUMBERS } from '../../games/cricket';

const CRICKET_NUMS = [20, 19, 18, 17, 16, 15, 'B'];

// Compute live marks by replaying local darts on top of committed state
function computeLiveMarks(state, localDarts, playerIndex) {
  const base = state.players[playerIndex].marks;
  const live = { ...base };
  localDarts.forEach(d => {
    if (d.number === null) return;
    if (!CRICKET_NUMBERS.includes(d.number)) return;
    live[d.number] = Math.min(3, (live[d.number] || 0) + d.multiplier);
  });
  return live;
}

// Compute live points by replaying local darts on top of committed state
function computeLivePoints(state, localDarts, playerIndex) {
  let pts = state.players[playerIndex].points;
  let tempMarks = { ...state.players[playerIndex].marks };
  localDarts.forEach(d => {
    if (d.number === null) return;
    const num = d.number;
    if (!CRICKET_NUMBERS.includes(num)) return;
    const cur = tempMarks[num] || 0;
    const scoring = Math.max(0, cur + d.multiplier - 3);
    const numVal = num === 'B' ? 25 : num;
    const othersClosed = state.players.every((p, i) => i === playerIndex || (p.marks[num] || 0) >= 3);
    if (scoring > 0 && !othersClosed) pts += scoring * numVal;
    tempMarks[num] = Math.min(3, cur + d.multiplier);
  });
  return pts;
}

const markSymbol = (n) => {
  if (n <= 0) return '';
  if (n === 1) return '/';
  if (n === 2) return 'X';
  return '⊗';
};

export default function CricketBoard({ state, onSubmitTurn, onUndo }) {
  const [selectedNum, setSelectedNum] = useState(null);
  const [darts, setDarts] = useState([]);
  const [litSegment, setLitSegment] = useState(null);
  const [hitAnimation, setHitAnimation] = useState(null); // {num, key}
  const [feedbackLines, setFeedbackLines] = useState([]);
  const animKeyRef = useRef(0);

  const pi = state.currentPlayer;
  const dartsUsed = darts.length;
  const dartColors = ['#d4a03c', '#e74c3c', '#2ecc71'];

  // Live marks/points for the current player (updates per dart thrown)
  const livePiMarks = computeLiveMarks(state, darts, pi);
  const livePiPoints = computeLivePoints(state, darts, pi);

  // Other players use committed state
  const getPlayerMarks = (idx) => idx === pi ? livePiMarks : state.players[idx].marks;
  const getPlayerPoints = (idx) => idx === pi ? livePiPoints : state.players[idx].points;

  const resetTurn = () => {
    setDarts([]);
    setSelectedNum(null);
    setLitSegment(null);
    setFeedbackLines([]);
    setHitAnimation(null);
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
    setLitSegment({ number, multiplier });

    // Trigger hit animation on that number row
    animKeyRef.current += 1;
    setHitAnimation({ num: number, key: animKeyRef.current });
    setTimeout(() => setHitAnimation(null), 400);

    // Feedback line
    const multLabel = multiplier === 3 ? 'Triple' : multiplier === 2 ? 'Double' : 'Single';
    const numLabel = number === 'B' ? 'Bull' : number;
    const curMarks = state.players[pi].marks[number] || 0;
    // account for earlier darts this turn
    const dartsBefore = darts.filter(d => d.number === number);
    const effectiveCur = Math.min(3, curMarks + dartsBefore.reduce((a, d) => a + d.multiplier, 0));
    const newMarks = Math.min(3, effectiveCur + multiplier);
    const scoring = Math.max(0, effectiveCur + multiplier - 3);
    const numVal = number === 'B' ? 25 : number;
    const othersClosed = state.players.every((p, i) => i === pi || (p.marks[number] || 0) >= 3);
    let label = `🎯 ${multLabel} ${numLabel}`;
    if (newMarks >= 3 && effectiveCur < 3) label += ' — CLOSED!';
    else if (scoring > 0 && !othersClosed) label += ` +${scoring * numVal} pts`;
    setFeedbackLines(f => [...f, label]);

    if (newDarts.length >= 3) {
      setTimeout(() => submitTurn(newDarts), 900);
    }
  };

  const recordMiss = () => {
    if (dartsUsed >= 3) return;
    const newDarts = [...darts, { number: null, multiplier: 0 }];
    setDarts(newDarts);
    setSelectedNum(null);
    setLitSegment(null);
    setFeedbackLines(f => [...f, '❌ Miss']);
    if (newDarts.length >= 3) {
      setTimeout(() => submitTurn(newDarts), 900);
    }
  };

  const handleUndo = () => {
    if (darts.length > 0) {
      const newDarts = darts.slice(0, -1);
      setDarts(newDarts);
      setSelectedNum(null);
      setFeedbackLines(f => f.slice(0, -1));
      const last = newDarts[newDarts.length - 1];
      setLitSegment(last?.number ? { number: last.number, multiplier: last.multiplier } : null);
    } else {
      onUndo && onUndo();
    }
  };

  const handleNextPlayer = () => {
    if (darts.length > 0) submitTurn(darts);
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, minHeight: 0, overflow: 'hidden' }}>

      {/* ── Felt header — current player ── */}
      <div className="felt-panel" style={{ borderRadius: 14, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 10, color: 'var(--felt-muted)', textTransform: 'uppercase', letterSpacing: 2, fontWeight: 700 }}>Now Throwing</div>
          <div key={pi} className="turn-start" style={{ fontSize: 22, fontWeight: 900, lineHeight: 1.1, color: 'var(--felt-text)', letterSpacing: 0.5 }}>
            {state.players[pi].name}
          </div>
          {feedbackLines.length > 0 && (
            <div className="slide-in" style={{
              fontSize: 11, fontWeight: 700, marginTop: 2,
              color: feedbackLines[feedbackLines.length - 1].includes('CLOSED') ? '#4ade80'
                   : feedbackLines[feedbackLines.length - 1].includes('pts') ? '#fbbf24'
                   : feedbackLines[feedbackLines.length - 1].includes('Miss') ? '#f87171'
                   : 'var(--felt-muted)',
            }}>
              {feedbackLines[feedbackLines.length - 1]}
            </div>
          )}
        </div>
        {/* Dart slots — compact squares */}
        <div style={{ display: 'flex', gap: 5 }}>
          {[0, 1, 2].map(i => {
            const d = darts[i];
            return (
              <div key={i} style={{
                width: 28, height: 28, borderRadius: 6,
                background: d ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.25)',
                border: `2px solid ${d ? dartColors[i] : 'rgba(255,255,255,0.15)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, fontWeight: 900,
                color: d ? dartColors[i] : 'rgba(255,255,255,0.3)',
                boxShadow: d ? `0 0 6px ${dartColors[i]}55` : 'none',
                transition: 'all 0.2s',
              }}>
                {d
                  ? (d.number === null ? '✗' : `${d.multiplier === 3 ? 'T' : d.multiplier === 2 ? 'D' : ''}${d.number === 'B' ? 'B' : d.number}`)
                  : (i + 1)
                }
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Dartboard ── */}
      <div style={{ flexShrink: 1, minHeight: 0, display: 'flex', justifyContent: 'center' }}>
        <Dartboard darts={darts.filter(d => d.number !== null)} lit={litSegment} />
      </div>

      {/* ── Cricket scoreboard ── */}
      <div className="felt-panel" style={{ borderRadius: 14, overflow: 'visible', position: 'relative' }}>

        {/* Multiplier overlay */}
        {selectedNum !== null && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(10,8,4,0.85)',
            display: 'flex', alignItems: 'flex-end',
          }}>
            <div className="wood-panel" style={{
              width: '100%', maxWidth: 500, margin: '0 auto',
              borderRadius: '18px 18px 0 0',
              padding: 16, display: 'flex', flexDirection: 'column', gap: 10,
              border: '2px solid rgba(212,160,60,0.5)',
              borderBottom: 'none',
            }}>
              <div style={{ textAlign: 'center', fontSize: 16, fontWeight: 800, color: '#d4a03c', letterSpacing: 1 }}>
                {selectedNum === 'B' ? 'BULL' : selectedNum} — Select Hit
              </div>
              <button onClick={() => recordHit(selectedNum, 1)} style={overlayBtn('#f5e9cc', 'rgba(245,233,204,0.08)', 'rgba(245,233,204,0.3)')}>
                Single &nbsp;/
              </button>
              <button onClick={() => recordHit(selectedNum, 2)} style={overlayBtn('#2ecc71', 'rgba(46,204,113,0.1)', '#2ecc71')}>
                Double &nbsp;✕
              </button>
              {selectedNum !== 'B' && (
                <button onClick={() => recordHit(selectedNum, 3)} style={overlayBtn('#d4a03c', 'rgba(212,160,60,0.1)', '#d4a03c')}>
                  Triple &nbsp;⊗
                </button>
              )}
              <button onClick={() => setSelectedNum(null)} style={{ padding: '10px', background: 'none', border: '1px solid rgba(212,160,60,0.2)', borderRadius: 10, color: '#8a7355', fontSize: 13, cursor: 'pointer' }}>
                ← Back
              </button>
            </div>
          </div>
        )}

        {/* Player name headers */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 56px 1fr', borderBottom: '1px solid var(--felt-border)', padding: '6px 4px' }}>
          {state.players.map((p, idx) => (
            <div key={idx} style={{
              textAlign: 'center',
              fontSize: 11, fontWeight: 800, letterSpacing: 1,
              color: idx === pi ? 'var(--accent)' : 'var(--felt-muted)',
              textShadow: 'none',
              gridColumn: idx === 0 ? 1 : 3,
            }}>
              {p.name.toUpperCase()}
            </div>
          ))}
          <div style={{ gridColumn: 2 }} />
        </div>

        {/* Number rows */}
        {CRICKET_NUMS.map((num, ri) => {
          const p0marks = getPlayerMarks(0)[num] || 0;
          const p1marks = state.players[1] ? (getPlayerMarks(1)[num] || 0) : 0;
          const allClosed = state.players.every((p, i) => (getPlayerMarks(i)[num] || 0) >= 3);
          const isHit = hitAnimation && hitAnimation.num === num;

          return (
            <div key={num} style={{
              display: 'flex', alignItems: 'center',
              borderBottom: ri < CRICKET_NUMS.length - 1 ? '1px solid rgba(0,0,0,0.2)' : 'none',
              background: allClosed ? 'rgba(0,0,0,0.2)' : 'transparent',
            }}>
              {/* P1 marks */}
              <div style={{ flex: 1, textAlign: 'center', padding: '8px 4px' }}>
                <MarkDisplay marks={p0marks} allClosed={allClosed} animate={isHit && pi === 0} />
              </div>

              {/* Number button */}
              <button
                className="num-btn"
                onClick={() => { if (dartsUsed < 3) setSelectedNum(num); }}
                disabled={dartsUsed >= 3}
                style={{
                  width: 56, padding: '12px 4px',
                  background: 'none', border: 'none',
                  borderLeft: '1px solid rgba(0,0,0,0.25)',
                  borderRight: '1px solid rgba(0,0,0,0.25)',
                  color: allClosed ? 'rgba(255,255,255,0.2)' : 'var(--accent)',
                  fontWeight: 900, fontSize: num === 'B' ? 20 : 24,
                  cursor: dartsUsed >= 3 ? 'not-allowed' : 'pointer',
                  opacity: dartsUsed >= 3 ? 0.4 : 1,
                  textDecoration: allClosed ? 'line-through' : 'none',
                  textShadow: allClosed ? 'none' : '0 0 8px rgba(212,160,60,0.5)',
                  transition: 'all 0.15s',
                }}>
                {num === 'B' ? 'BULL' : num}
              </button>

              {/* P2 marks */}
              <div style={{ flex: 1, textAlign: 'center', padding: '8px 4px' }}>
                {state.players[1] && <MarkDisplay marks={p1marks} allClosed={allClosed} animate={isHit && pi === 1} />}
              </div>
            </div>
          );
        })}

        {/* Points row */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 56px 1fr',
          background: 'rgba(0,0,0,0.25)',
          borderTop: '2px solid rgba(0,0,0,0.3)',
          padding: '8px 4px',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--felt-muted)', fontWeight: 700, letterSpacing: 1 }}>PTS</div>
            <div key={pi === 0 ? getPlayerPoints(0) : 'pts-0'} className={`${pi === 0 ? 'led-accent ' : ''}score-flash`} style={{ fontSize: 22, fontWeight: 900, color: pi === 0 ? undefined : 'var(--felt-text)' }}>
              {getPlayerPoints(0)}
            </div>
          </div>
          <div />
          <div style={{ textAlign: 'center' }}>
            {state.players[1] && <>
              <div style={{ fontSize: 11, color: 'var(--felt-muted)', fontWeight: 700, letterSpacing: 1 }}>PTS</div>
              <div key={pi === 1 ? getPlayerPoints(1) : 'pts-1'} className={`${pi === 1 ? 'led-accent ' : ''}score-flash`} style={{ fontSize: 22, fontWeight: 900, color: pi === 1 ? undefined : 'var(--felt-text)' }}>
                {getPlayerPoints(1)}
              </div>
            </>}
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, padding: 10 }}>
          <button onClick={recordMiss} disabled={dartsUsed >= 3} style={ctrlBtn('#c0392b', dartsUsed >= 3)}>
            ✗ Miss
          </button>
          <button onClick={handleUndo} style={ctrlBtn('#8a7355', false)}>
            ↩ Undo
          </button>
          <button onClick={handleNextPlayer} disabled={dartsUsed === 0} style={ctrlBtn('#d4a03c', dartsUsed === 0)}>
            Next ▶
          </button>
        </div>
      </div>
    </div>
  );
}

// Mark display component — red glow for closed, white for open
function MarkDisplay({ marks, allClosed, animate }) {
  if (marks <= 0) return <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 26 }}>·</span>;

  const symbol = markSymbol(marks);
  const cls = marks >= 3 ? 'led-closed' : 'led-open';

  return (
    <span
      key={`${marks}-${animate}`}
      className={`${cls} ${animate ? 'dart-hit' : ''}`}
      style={{
        fontSize: marks >= 3 ? 28 : 30,
        fontWeight: 900,
        display: 'inline-block',
        opacity: allClosed ? 0.35 : 1,
        transition: 'font-size 0.15s',
      }}
    >
      {symbol}
    </span>
  );
}

// Helper style factories
function overlayBtn(color, bg, borderColor) {
  return {
    flex: 1, padding: '16px',
    background: bg,
    border: `2px solid ${borderColor}`,
    borderRadius: 12,
    color: color,
    fontSize: 20, fontWeight: 900,
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
    borderRadius: 10,
    color: disabled ? 'rgba(255,255,255,0.2)' : color,
    fontSize: 13, fontWeight: 800,
    cursor: disabled ? 'not-allowed' : 'pointer',
    letterSpacing: 0.5,
    textShadow: disabled ? 'none' : `0 0 6px ${color}88`,
  };
}
