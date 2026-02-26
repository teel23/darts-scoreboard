import React, { useState, useRef } from 'react';
import Dartboard from '../Dartboard';

const NUMBERS = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,'B'];

export default function X01Board({ state, onScore, onUndo, onNextPlayer }) {
  const [selectedNum, setSelectedNum] = useState(null);
  const [darts, setDarts] = useState([]);
  const [litSegment, setLitSegment] = useState(null);
  const submittedRef = useRef(false); // prevent double-submit

  const pi = state.currentPlayer;
  const currentPlayer = state.players[pi];
  const dartsLeft = 3 - darts.length;
  const dartColors = ['#3B82F6', '#f59e0b', '#10b981'];

  const submitTurn = (dartList) => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    const total = dartList.reduce((s, d) => s + d.points, 0);
    onScore({ points: total, darts: dartList });
    setTimeout(() => {
      submittedRef.current = false;
      setDarts([]);
      setLitSegment(null);
      setSelectedNum(null);
    }, 50);
  };

  const addDart = (number, multiplier) => {
    if (submittedRef.current) return;
    const val = number === 'B' ? (multiplier === 2 ? 50 : 25) : number * multiplier;
    const dart = { number, multiplier, points: val };
    const newDarts = [...darts, dart];
    const newLit = { number, multiplier };
    setDarts(newDarts);
    setSelectedNum(null);
    setLitSegment(newLit);

    const totalThisTurn = newDarts.reduce((s, d) => s + d.points, 0);
    const newScore = currentPlayer.score - totalThisTurn;

    // Win mid-turn: score exactly 0
    if (newScore === 0) {
      submittedRef.current = true;
      setTimeout(() => {
        onScore({ points: totalThisTurn, darts: newDarts, win: true });
        submittedRef.current = false;
        setDarts([]);
        setLitSegment(null);
      }, 400);
      return;
    }

    // Bust mid-turn: would go below 0 or leave 1 on double-out
    const wouldBust = newScore < 0 || (state.finishRule === 'double' && (newScore === 1 || (newScore === 0 && val % 2 !== 0)));
    if (wouldBust) {
      // Show bust state but don't auto-advance — let user hit Next
      return;
    }

    if (newDarts.length === 3) {
      setTimeout(() => submitTurn(newDarts), 500);
    }
  };

  const handleMiss = () => {
    if (submittedRef.current || dartsLeft === 0) return;
    const dart = { number: null, multiplier: 0, points: 0 };
    const newDarts = [...darts, dart];
    setDarts(newDarts);
    setSelectedNum(null);
    setLitSegment(null);
    if (newDarts.length === 3) {
      setTimeout(() => submitTurn(newDarts), 400);
    }
  };

  const handleUndo = () => {
    if (submittedRef.current) return;
    if (darts.length > 0) {
      const newDarts = darts.slice(0, -1);
      setDarts(newDarts);
      setSelectedNum(null);
      setLitSegment(
        newDarts.length > 0 && newDarts[newDarts.length - 1].number !== null
          ? { number: newDarts[newDarts.length - 1].number, multiplier: newDarts[newDarts.length - 1].multiplier }
          : null
      );
    } else {
      onUndo && onUndo();
    }
  };

  const handleNextPlayer = () => {
    if (submittedRef.current) return;
    submitTurn(darts);
  };

  // Running score preview
  const turnTotal = darts.reduce((s, d) => s + d.points, 0);
  const scoreAfter = currentPlayer.score - turnTotal;
  const isBust = scoreAfter < 0 || (state.finishRule === 'double' && scoreAfter === 1);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, minHeight: 0, overflow: 'hidden' }}>

      {/* Scoreboard */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${state.players.length}, 1fr)`, gap: 6 }}>
        {state.players.map((p, i) => {
          const preview = i === pi ? scoreAfter : p.score;
          const showPreview = i === pi && darts.length > 0;
          return (
            <div key={i} style={{ background: i === pi ? 'rgba(59,130,246,0.15)' : 'var(--bg2)', border: `2px solid ${i === pi ? 'var(--blue)' : 'var(--border)'}`, borderRadius: 12, padding: '8px 6px', textAlign: 'center' }}>
              <div key={i === pi ? 'active' : 'inactive'} className={i === pi ? 'turn-start' : ''} style={{ fontSize: 10, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
              <div key={i === pi ? darts.length : p.score} className="score-flash" style={{ fontSize: 28, fontWeight: 900, lineHeight: 1.1, color: showPreview ? (isBust ? 'var(--danger)' : 'var(--blue)') : (i === pi ? 'var(--blue)' : 'var(--text)') }}>
                {showPreview ? Math.max(0, preview) : p.score}
              </div>
              {showPreview && (
                <div style={{ fontSize: 9, color: isBust ? 'var(--danger)' : 'var(--green)', fontWeight: 700 }}>
                  {isBust ? 'BUST' : `-${turnTotal}`}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Dart slots */}
      <div style={{ display: 'flex', gap: 6 }}>
        {[0,1,2].map(i => {
          const d = darts[i];
          return (
            <div key={i} style={{ flex: 1, height: 38, background: d ? dartColors[i] + '22' : 'var(--bg2)', border: `2px solid ${d ? dartColors[i] : 'var(--border)'}`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: d ? dartColors[i] : 'var(--muted)', transition: 'all 0.2s' }}>
              {d ? (d.number === null ? 'Miss' : `${d.multiplier === 2 ? 'D' : d.multiplier === 3 ? 'T' : ''}${d.number === 'B' ? 'B' : d.number}`) : `${i + 1}`}
            </div>
          );
        })}
      </div>

      {/* Compact dartboard */}
      <div style={{ flexShrink: 1, minHeight: 0, display: 'flex', justifyContent: 'center' }}>
        <Dartboard darts={darts.filter(d => d.number !== null)} lit={litSegment} />
      </div>

      {/* Number pad + overlay wrapper */}
      <div style={{ position: 'relative', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, padding: 10 }}>

        {/* Multiplier overlay */}
        {selectedNum !== null && (
          <div style={{ position: 'absolute', inset: 0, background: 'var(--bg2)', borderRadius: 14, zIndex: 10, display: 'flex', flexDirection: 'column', padding: 12, gap: 8 }}>
            <div style={{ textAlign: 'center', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
              {selectedNum === 'B' ? 'Bull' : selectedNum} — select hit type
            </div>
            <button onClick={() => addDart(selectedNum, 1)}
              style={{ flex: 1, padding: '14px', background: 'var(--bg3)', border: '2px solid var(--border)', borderRadius: 12, color: 'var(--text)', fontSize: 18, fontWeight: 800, cursor: 'pointer' }}>
              Single &nbsp;<span style={{ fontSize: 13, color: 'var(--muted)' }}>{selectedNum === 'B' ? '25' : selectedNum}</span>
            </button>
            <button onClick={() => addDart(selectedNum, 2)}
              style={{ flex: 1, padding: '14px', background: 'rgba(16,185,129,0.1)', border: '2px solid var(--green)', borderRadius: 12, color: 'var(--green)', fontSize: 18, fontWeight: 800, cursor: 'pointer' }}>
              Double &nbsp;<span style={{ fontSize: 13 }}>{selectedNum === 'B' ? '50' : selectedNum * 2}</span>
            </button>
            {selectedNum !== 'B' && (
              <button onClick={() => addDart(selectedNum, 3)}
                style={{ flex: 1, padding: '14px', background: 'rgba(59,130,246,0.1)', border: '2px solid var(--blue)', borderRadius: 12, color: 'var(--blue)', fontSize: 18, fontWeight: 800, cursor: 'pointer' }}>
                Triple &nbsp;<span style={{ fontSize: 13 }}>{selectedNum * 3}</span>
              </button>
            )}
            <button onClick={() => setSelectedNum(null)}
              style={{ padding: '10px', background: 'none', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--muted)', fontSize: 13, cursor: 'pointer' }}>
              ← Back
            </button>
          </div>
        )}

        {/* Instruction */}
        <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8, textAlign: 'center' }}>
          {dartsLeft > 0 ? `Dart ${darts.length + 1} of 3 — tap a number` : 'Turn complete — tap Next'}
        </div>

        {/* Number grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
          {NUMBERS.map(n => (
            <button key={n} className="num-btn" onClick={() => { if (dartsLeft > 0 && !submittedRef.current) setSelectedNum(n); }}
              disabled={dartsLeft === 0}
              style={{ padding: '11px 2px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 13, fontWeight: 700, cursor: dartsLeft > 0 ? 'pointer' : 'not-allowed', opacity: dartsLeft === 0 ? 0.4 : 1 }}>
              {n}
            </button>
          ))}
        </div>

        {/* Action row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
          <button onClick={handleMiss} disabled={dartsLeft === 0}
            style={{ padding: '11px', background: 'rgba(239,68,68,0.1)', border: '1px solid var(--danger)', borderRadius: 8, color: 'var(--danger)', fontSize: 13, fontWeight: 700, cursor: dartsLeft > 0 ? 'pointer' : 'not-allowed', opacity: dartsLeft === 0 ? 0.4 : 1 }}>
            Miss
          </button>
          <button onClick={handleUndo}
            style={{ padding: '11px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--muted)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            ← Undo
          </button>
          <button onClick={handleNextPlayer}
            style={{ padding: '11px', background: darts.length > 0 ? 'rgba(59,130,246,0.15)' : 'var(--bg3)', border: `1px solid ${darts.length > 0 ? 'var(--blue)' : 'var(--border)'}`, borderRadius: 8, color: darts.length > 0 ? 'var(--blue)' : 'var(--muted)', fontSize: 13, fontWeight: 700, cursor: darts.length > 0 ? 'pointer' : 'not-allowed' }}>
            Next ⏭
          </button>
        </div>
      </div>
    </div>
  );
}
