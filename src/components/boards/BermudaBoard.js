import React, { useState } from 'react';
import Dartboard from '../Dartboard';
import { ROUNDS, TOTAL_ROUNDS, isValidHit, recordBermudaDart, endBermudaTurn } from '../../games/bermuda';

const NUMBERS = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,'B'];

export default function BermudaBoard({ state, onStateChange, onEnd, onUndo }) {
  const [showOverlay, setShowOverlay] = useState(false);
  const [selectedNum, setSelectedNum] = useState(null);

  const pi = state.currentPlayer;
  const round = ROUNDS[state.currentRound];
  const dartsThrown = state.dartsThrown || [];
  const dartsUsed = dartsThrown.length;
  const needsNumPad = round.type === 'double' || round.type === 'triple' || round.type === 'doubleOrTriple';
  const turnPts = state.roundScored || 0;

  const roundColor = round.type === 'double' ? 'var(--green)'
    : round.type === 'triple' ? 'var(--blue)'
    : round.type === 'doubleOrTriple' ? '#8b5cf6'
    : round.type === 'bull' ? '#f59e0b'
    : 'var(--blue)';

  const finalizeTurn = (newState) => {
    const finished = endBermudaTurn(newState);
    setSelectedNum(null);
    setShowOverlay(false);
    if (finished.gameOver) {
      onEnd({ winner: finished.winner, players: finished.players, mode: 'bermuda' });
    } else {
      onStateChange(finished);
    }
  };

  const recordDart = (dartNumber, dartMultiplier) => {
    setSelectedNum(null);
    setShowOverlay(false);
    const newState = recordBermudaDart(state, dartNumber, dartMultiplier);
    if (newState.dartsThrown.length >= 3) {
      finalizeTurn(newState);
    } else {
      onStateChange(newState);
    }
  };

  const handleMiss = () => recordDart(-1, 0);
  const handleNextPlayer = () => finalizeTurn(state);

  // Resolve the actual number to record — for number rounds Hit button, use round.value
  const resolveNum = () => {
    if (selectedNum !== null) return selectedNum;
    if (round.type === 'bull') return 'B';
    if (round.type === 'number') return round.value; // Hit button on number round
    return null;
  };

  const handleMultiplier = (mult) => {
    const num = resolveNum();
    if (num === null) return;
    recordDart(num, mult);
  };

  const overlayMults = () => {
    const num = resolveNum();
    if (num === 'B' || round.type === 'bull') {
      return [{ label: 'Single — 25 pts', value: 1 }, { label: 'Double Bull — 50 pts', value: 2 }];
    }
    if (round.type === 'triple') return [{ label: 'Triple', value: 3 }];
    if (round.type === 'double') return [{ label: 'Double', value: 2 }];
    if (round.type === 'doubleOrTriple') return [{ label: 'Double', value: 2 }, { label: 'Triple', value: 3 }];
    // number round — show all three with actual point values
    const n = num || round.value;
    return [
      { label: `Single — ${n} pts`, value: 1 },
      { label: `Double — ${n * 2} pts`, value: 2 },
      { label: `Triple — ${n * 3} pts`, value: 3 },
    ];
  };

  // ── Overlay (rendered outside the panel so it can never be clipped) ──
  const overlay = (showOverlay || selectedNum !== null) && (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'flex-end',
    }}>
      <div style={{
        width: '100%', maxWidth: 500, margin: '0 auto',
        background: 'var(--bg2)', borderRadius: '20px 20px 0 0',
        padding: '20px 16px 36px', display: 'flex', flexDirection: 'column', gap: 12,
        border: `2px solid ${roundColor}`, borderBottom: 'none',
      }}>
        <div style={{ textAlign: 'center', fontSize: 16, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>
          {selectedNum !== null
            ? `${selectedNum === 'B' ? 'Bull' : selectedNum} — how did you hit it?`
            : `Round ${state.currentRound + 1}: ${round.label} — how?`}
        </div>
        {overlayMults().map(m => (
          <button key={m.value} onClick={() => handleMultiplier(m.value)} style={{
            padding: '18px', borderRadius: 14, fontSize: 18, fontWeight: 800, cursor: 'pointer',
            background: m.value === 2 ? 'rgba(16,185,129,0.12)' : m.value === 3 ? 'rgba(59,130,246,0.12)' : 'var(--bg3)',
            border: `2px solid ${m.value === 2 ? 'var(--green)' : m.value === 3 ? 'var(--blue)' : 'var(--border)'}`,
            color: m.value === 2 ? 'var(--green)' : m.value === 3 ? 'var(--blue)' : 'var(--text)',
          }}>
            {m.label}
          </button>
        ))}
        <button onClick={() => { setShowOverlay(false); setSelectedNum(null); }} style={{
          padding: '12px', background: 'none', border: '1px solid var(--border)',
          borderRadius: 12, color: 'var(--muted)', fontSize: 14, cursor: 'pointer', marginTop: 4,
        }}>
          ← Back
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 8, minHeight: 0, overflow: 'hidden' }}>
      {overlay}

      {/* ── Big target display ── */}
      <div style={{
        background: 'var(--bg2)', border: `3px solid ${roundColor}`,
        borderRadius: 16, padding: '14px 16px', textAlign: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>
            ROUND {state.currentRound + 1} / {TOTAL_ROUNDS}
          </div>
          <div style={{
            fontSize: 11, fontWeight: 700, color: roundColor,
            background: roundColor + '22', padding: '2px 10px', borderRadius: 20,
          }}>
            {round.type === 'number' ? 'Hit the number'
              : round.type === 'bull' ? 'Hit the Bull'
              : round.type === 'double' ? 'Any Double'
              : round.type === 'triple' ? 'Any Triple'
              : 'Double or Triple'}
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>
            Dart {dartsUsed + 1} / 3
          </div>
        </div>

        <div style={{ fontSize: 64, fontWeight: 900, lineHeight: 1, color: roundColor }}>
          {round.type === 'number' ? round.value
            : round.type === 'bull' ? '🎯'
            : round.type === 'double' ? 'D'
            : round.type === 'triple' ? 'T'
            : 'D/T'}
        </div>
        <div style={{ fontSize: 14, color: 'var(--muted)', marginTop: 4 }}>{round.label}</div>

        {/* Dart result slots */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 10 }}>
          {[0,1,2].map(i => {
            const d = dartsThrown[i];
            return (
              <div key={i} style={{
                width: 52, height: 44, borderRadius: 10,
                background: d ? (d.hit ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.12)') : 'var(--bg3)',
                border: `2px solid ${d ? (d.hit ? 'var(--green)' : 'var(--danger)') : 'var(--border)'}`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                fontSize: d && d.hit ? 11 : 13, fontWeight: 800,
                color: d ? (d.hit ? 'var(--green)' : 'var(--danger)') : 'var(--muted)',
              }}>
                {d ? (d.hit ? <><span style={{fontSize:9}}>+</span>{d.points}</> : '✗') : i + 1}
              </div>
            );
          })}
        </div>

        {/* Turn status */}
        {turnPts > 0 && (
          <div style={{ marginTop: 8, fontSize: 13, color: 'var(--green)', fontWeight: 700 }}>
            +{turnPts} scored this turn
          </div>
        )}
        {!state.hitThisTurn && dartsUsed > 0 && (
          <div style={{ marginTop: 6, fontSize: 12, color: 'var(--danger)', fontWeight: 700 }}>
            ⚠ No hits — miss all 3 and your score halves!
          </div>
        )}
      </div>

      {/* ── Scoreboard ── */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(state.players.length, 4)}, 1fr)`, gap: 6 }}>
        {state.players.map((p, i) => (
          <div key={i} style={{
            background: i === pi ? 'rgba(59,130,246,0.1)' : 'var(--bg2)',
            border: `2px solid ${i === pi ? 'var(--blue)' : 'var(--border)'}`,
            borderRadius: 12, padding: '8px 6px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 10, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: i === pi ? 'var(--blue)' : 'var(--text)' }}>{p.score}</div>
          </div>
        ))}
      </div>

      {/* ── Dartboard ── */}
      <div style={{ flexShrink: 1, minHeight: 0, display: 'flex', justifyContent: 'center' }}>
        <Dartboard
          darts={dartsThrown.filter(d => d.hit).map(d => ({ number: d.number, multiplier: d.multiplier }))}
          lit={dartsThrown.length > 0 && dartsThrown[dartsThrown.length - 1].hit
            ? { number: dartsThrown[dartsThrown.length - 1].number, multiplier: dartsThrown[dartsThrown.length - 1].multiplier }
            : null}
        />
      </div>

      {/* ── Input buttons ── */}
      {needsNumPad ? (
        /* Number pad for any-double / any-triple / D-or-T rounds */
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, padding: 12 }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', marginBottom: 8 }}>
            {dartsUsed < 3 ? 'Select the number you hit (or Miss)' : 'Turn complete — tap Next'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 10 }}>
            {NUMBERS.map(n => {
              const wouldHit = isValidHit(round, n, round.type === 'double' ? 2 : 3);
              return (
                <button key={n} onClick={() => { if (dartsUsed < 3) setSelectedNum(n); }}
                  disabled={dartsUsed >= 3}
                  style={{
                    padding: '10px 2px', background: wouldHit ? roundColor + '22' : 'var(--bg3)',
                    border: `1px solid ${wouldHit ? roundColor : 'var(--border)'}`,
                    borderRadius: 8, color: 'var(--text)', fontSize: 13, fontWeight: 700,
                    cursor: dartsUsed >= 3 ? 'not-allowed' : 'pointer', opacity: dartsUsed >= 3 ? 0.4 : 1,
                  }}>
                  {n}
                </button>
              );
            })}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            <button onClick={handleMiss} disabled={dartsUsed >= 3}
              style={{ padding: '13px', background: 'rgba(239,68,68,0.1)', border: '1px solid var(--danger)', borderRadius: 10, color: 'var(--danger)', fontSize: 14, fontWeight: 700, cursor: dartsUsed >= 3 ? 'not-allowed' : 'pointer', opacity: dartsUsed >= 3 ? 0.4 : 1 }}>
              ✗ Miss
            </button>
            <button onClick={onUndo}
              style={{ padding: '13px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--muted)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              ← Undo
            </button>
            <button onClick={handleNextPlayer}
              style={{ padding: '13px', background: 'rgba(59,130,246,0.15)', border: '1px solid var(--blue)', borderRadius: 10, color: 'var(--blue)', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
              Next ⏭
            </button>
          </div>
        </div>
      ) : (
        /* Simple Hit / Miss for number + bull rounds */
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, padding: 12 }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', marginBottom: 10 }}>
            {dartsUsed < 3 ? `Dart ${dartsUsed + 1} of 3 — did you hit ${round.type === 'bull' ? 'the Bull' : round.value}?` : 'Turn complete — tap Next'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 10 }}>
            <button
              onClick={() => { if (dartsUsed < 3) setShowOverlay(true); }}
              disabled={dartsUsed >= 3}
              style={{
                padding: '28px 12px', background: dartsUsed >= 3 ? 'var(--bg3)' : 'rgba(16,185,129,0.12)',
                border: `2px solid ${dartsUsed >= 3 ? 'var(--border)' : 'var(--green)'}`,
                borderRadius: 14, color: dartsUsed >= 3 ? 'var(--muted)' : 'var(--green)',
                fontSize: 22, fontWeight: 900, cursor: dartsUsed >= 3 ? 'not-allowed' : 'pointer',
                opacity: dartsUsed >= 3 ? 0.4 : 1,
              }}>
              ✓ Hit
            </button>
            <button
              onClick={handleMiss}
              disabled={dartsUsed >= 3}
              style={{
                padding: '28px 12px', background: dartsUsed >= 3 ? 'var(--bg3)' : 'rgba(239,68,68,0.1)',
                border: `2px solid ${dartsUsed >= 3 ? 'var(--border)' : 'var(--danger)'}`,
                borderRadius: 14, color: dartsUsed >= 3 ? 'var(--muted)' : 'var(--danger)',
                fontSize: 22, fontWeight: 900, cursor: dartsUsed >= 3 ? 'not-allowed' : 'pointer',
                opacity: dartsUsed >= 3 ? 0.4 : 1,
              }}>
              ✗ Miss
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button onClick={onUndo}
              style={{ padding: '12px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--muted)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              ← Undo
            </button>
            <button onClick={handleNextPlayer}
              style={{ padding: '12px', background: 'rgba(59,130,246,0.15)', border: '1px solid var(--blue)', borderRadius: 10, color: 'var(--blue)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              Next ⏭
            </button>
          </div>
        </div>
      )}

      {/* ── 13-round progress bar ── */}
      <div style={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap', flexShrink: 0 }}>
        {ROUNDS.map((r, i) => {
          const done = i < state.currentRound;
          const active = i === state.currentRound;
          const c = r.type === 'double' ? 'var(--green)'
            : r.type === 'triple' ? 'var(--blue)'
            : r.type === 'doubleOrTriple' ? '#8b5cf6'
            : r.type === 'bull' ? '#f59e0b'
            : 'var(--border)';
          return (
            <div key={r.id} style={{
              width: 28, height: 28, borderRadius: 7,
              background: done ? 'rgba(16,185,129,0.25)' : active ? 'var(--blue)' : 'var(--bg3)',
              border: `2px solid ${active ? 'var(--blue)' : done ? 'var(--green)' : c}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 9, fontWeight: 700,
              color: active || done ? '#fff' : 'var(--muted)',
            }}>
              {done ? '✓' : r.id}
            </div>
          );
        })}
      </div>
    </div>
  );
}
