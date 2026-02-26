import React from 'react';

const SEGMENT_ORDER = [20,1,18,4,13,6,10,15,2,17,3,19,7,16,8,11,14,9,12,5];
const SEGMENT_ANGLE = 360 / 20;

function polarToCart(angleDeg, r) {
  const a = (angleDeg - 90) * (Math.PI / 180);
  return { x: 200 + r * Math.cos(a), y: 200 + r * Math.sin(a) };
}

function segmentPath(startAngle, endAngle, r1, r2) {
  const s1 = polarToCart(startAngle, r1);
  const e1 = polarToCart(endAngle, r1);
  const s2 = polarToCart(startAngle, r2);
  const e2 = polarToCart(endAngle, r2);
  return `M ${s1.x} ${s1.y} A ${r1} ${r1} 0 0 1 ${e1.x} ${e1.y} L ${e2.x} ${e2.y} A ${r2} ${r2} 0 0 0 ${s2.x} ${s2.y} Z`;
}

const R = { outerEdge: 195, double: [158, 175], triple: [100, 117], outerSingle: [117, 158], innerSingle: [35, 100], bullOuter: 35, bull: 15 };

// lit = { number, multiplier } — which section to light up
// darts = [{number, multiplier}] up to 3 markers
export default function Dartboard({ darts = [], lit = null }) {
  const dartColors = ['#3B82F6', '#f59e0b', '#10b981'];

  const getDartPos = (number, multiplier) => {
    if (number === 'B' || number === 25 || number === 50) {
      const r = multiplier === 2 ? 24 : 7;
      const a = (Math.random() * 360 - 90) * Math.PI / 180;
      return { x: 200 + r * Math.cos(a), y: 200 + r * Math.sin(a) };
    }
    const idx = SEGMENT_ORDER.indexOf(Number(number));
    if (idx === -1) return { x: 200, y: 200 };
    const midAngle = idx * SEGMENT_ANGLE;
    const r = multiplier === 2 ? 166 : multiplier === 3 ? 108 : 135;
    const jitter = (Math.random() - 0.5) * 14;
    const a = (midAngle - 90 + jitter) * Math.PI / 180;
    return { x: 200 + r * Math.cos(a), y: 200 + r * Math.sin(a) };
  };

  const isLit = (num, ring) => {
    if (!lit) return false;
    const numMatch = lit.number === num || (num === 'B' && (lit.number === 'B' || lit.number === 25));
    if (!numMatch) return false;
    if (ring === 'double') return lit.multiplier === 2;
    if (ring === 'triple') return lit.multiplier === 3;
    if (ring === 'bull') return lit.number === 'B' || lit.number === 50 || lit.number === 25;
    if (ring === 'bullOuter') return (lit.number === 'B' || lit.number === 25) && lit.multiplier === 1;
    return lit.multiplier === 1; // single
  };

  return (
    <svg viewBox="0 0 400 400" style={{ width: '100%', height: 'auto', maxWidth: 220, maxHeight: 180, display: 'block', margin: '0 auto' }}>
      <circle cx="200" cy="200" r="198" fill="#0d0d0d" stroke="#2a2a2a" strokeWidth="2" />

      {SEGMENT_ORDER.map((num, idx) => {
        const start = idx * SEGMENT_ANGLE - SEGMENT_ANGLE / 2;
        const end = start + SEGMENT_ANGLE;
        const even = idx % 2 === 0;

        const singleLit = isLit(num, 'single');
        const doubleLit = isLit(num, 'double');
        const tripleLit = isLit(num, 'triple');

        return (
          <g key={num}>
            {/* Outer single */}
            <path d={segmentPath(start, end, R.triple[0], R.outerSingle[1])}
              fill={singleLit ? '#3B82F6' : (even ? '#1c1c1c' : '#e8e0d0')} stroke="#1a1a1a" strokeWidth="0.5" />
            {/* Triple ring */}
            <path d={segmentPath(start, end, R.triple[0], R.triple[1])}
              fill={tripleLit ? '#60a5fa' : (even ? '#1a6b30' : '#b91c1c')} stroke="#1a1a1a" strokeWidth="0.5" />
            {/* Inner single */}
            <path d={segmentPath(start, end, R.innerSingle[0], R.innerSingle[1])}
              fill={singleLit ? '#3B82F6' : (even ? '#1c1c1c' : '#e8e0d0')} stroke="#1a1a1a" strokeWidth="0.5" />
            {/* Double ring */}
            <path d={segmentPath(start, end, R.double[0], R.double[1])}
              fill={doubleLit ? '#60a5fa' : (even ? '#1a6b30' : '#b91c1c')} stroke="#1a1a1a" strokeWidth="0.5" />
            {/* Number label */}
            {(() => {
              const pos = polarToCart(idx * SEGMENT_ANGLE, 186);
              return (
                <text x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle"
                  fontSize="11" fontWeight="bold"
                  fill={singleLit || doubleLit || tripleLit ? '#fff' : '#ccc'}
                  style={{ userSelect: 'none', pointerEvents: 'none' }}>
                  {num}
                </text>
              );
            })()}
          </g>
        );
      })}

      {/* Bull outer */}
      <circle cx="200" cy="200" r={R.bullOuter}
        fill={isLit('B', 'bullOuter') ? '#3B82F6' : '#1a6b30'} stroke="#1a1a1a" strokeWidth="1" />
      {/* Bull inner */}
      <circle cx="200" cy="200" r={R.bull}
        fill={isLit('B', 'bull') ? '#60a5fa' : '#b91c1c'} stroke="#1a1a1a" strokeWidth="1" />
      <text x="200" y="200" textAnchor="middle" dominantBaseline="middle"
        fontSize="8" fontWeight="bold" fill="#fff" style={{ pointerEvents: 'none', userSelect: 'none' }}>B</text>

      {/* Dart markers */}
      {darts.map((dart, i) => {
        if (!dart || dart.number === null) return null;
        const pos = getDartPos(dart.number, dart.multiplier);
        return (
          <g key={i}>
            <circle cx={pos.x} cy={pos.y} r="8" fill={dartColors[i]} stroke="#fff" strokeWidth="1.5" opacity="0.92" />
            <text x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle"
              fontSize="7" fontWeight="bold" fill="#fff" style={{ pointerEvents: 'none', userSelect: 'none' }}>
              {i + 1}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
