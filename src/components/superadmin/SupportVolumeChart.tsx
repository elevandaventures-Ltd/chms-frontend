'use client';

/**
 * SupportVolumeChart — Day 45. Weekly support ticket volume: opened vs.
 * resolved, a 2-series line chart (categorical: 2 series, legend + direct
 * end-labels, per the dataviz series-count ladder).
 */
import { useState } from 'react';

const CHART_W = 640;
const CHART_H = 200;
const PAD = { top: 16, right: 16, bottom: 26, left: 32 };

const SERIES = [
  { key: 'opened' as const, label: 'Opened', color: '#b25131' },
  { key: 'resolved' as const, label: 'Resolved', color: '#2563eb' },
];

export function SupportVolumeChart({ data }: { data: { week: string; opened: number; resolved: number }[] }) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const innerW = CHART_W - PAD.left - PAD.right;
  const innerH = CHART_H - PAD.top - PAD.bottom;
  const maxVal = Math.max(...data.map((d) => Math.max(d.opened, d.resolved))) * 1.2;

  const x = (i: number) => PAD.left + (i / (data.length - 1)) * innerW;
  const y = (v: number) => PAD.top + innerH - (v / maxVal) * innerH;

  function pathFor(key: 'opened' | 'resolved') {
    return data.map((d, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(d[key]).toFixed(1)}`).join(' ');
  }

  function handleMove(e: React.PointerEvent<SVGRectElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * CHART_W;
    const idx = Math.round(((relX - PAD.left) / innerW) * (data.length - 1));
    setHoverIdx(Math.max(0, Math.min(data.length - 1, idx)));
  }

  const hovered = hoverIdx != null ? data[hoverIdx] : null;

  return (
    <div className="sa-chart">
      <div className="sa-chart__legend">
        {SERIES.map((s) => (
          <span key={s.key} className="sa-chart__legend-item">
            <span className="sa-chart__legend-swatch" style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
      </div>

      <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="sa-chart__svg" role="img" aria-label="Weekly support ticket volume, opened vs resolved">
        <line x1={PAD.left} x2={CHART_W - PAD.right} y1={PAD.top + innerH} y2={PAD.top + innerH} className="sa-chart__gridline" />

        {SERIES.map((s) => (
          <path key={s.key} d={pathFor(s.key)} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        ))}

        {data.map((d, i) => (
          i % 2 === 0 && (
            <text key={d.week} x={x(i)} y={CHART_H - 6} className="sa-chart__axis-label" textAnchor="middle">{d.week}</text>
          )
        ))}

        {SERIES.map((s) => (
          <circle
            key={s.key}
            cx={x(data.length - 1)}
            cy={y(data[data.length - 1][s.key])}
            r={5}
            fill={s.color}
            stroke="#fff"
            strokeWidth={2}
          />
        ))}

        {hoverIdx != null && (
          <line x1={x(hoverIdx)} x2={x(hoverIdx)} y1={PAD.top} y2={PAD.top + innerH} className="sa-chart__crosshair" />
        )}

        <rect
          x={PAD.left} y={PAD.top} width={innerW} height={innerH} fill="transparent"
          onPointerMove={handleMove}
          onPointerLeave={() => setHoverIdx(null)}
        />
      </svg>

      {hovered && (
        <div className="sa-chart__tooltip" style={{ left: `${(x(hoverIdx!) / CHART_W) * 100}%` }}>
          <strong>{hovered.opened} opened</strong>
          <strong>{hovered.resolved} resolved</strong>
          <span>{hovered.week}</span>
        </div>
      )}
    </div>
  );
}

export default SupportVolumeChart;
