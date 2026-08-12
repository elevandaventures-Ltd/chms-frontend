'use client';

/**
 * PlatformCharts — Day 43. MRR/ARR 12-month trend line, new-signups-by-month
 * bar chart, and a churn-rate gauge. Hand-rolled SVG (no chart library in
 * this project) following the platform's existing custom-SVG convention.
 */
import { useId, useState } from 'react';

// ── Shared geometry helpers ───────────────────────────────────────────────────

const CHART_W = 640;
const CHART_H = 220;
const PAD = { top: 16, right: 16, bottom: 28, left: 48 };

function niceMax(max: number): number {
  if (max <= 0) return 10;
  const pow = Math.pow(10, Math.floor(Math.log10(max)));
  const n = max / pow;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return step * pow;
}

// ── MRR / ARR trend line chart ────────────────────────────────────────────────

export function MrrTrendChart({ data }: { data: { month: string; mrr: number }[] }) {
  const gradId = useId();
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const innerW = CHART_W - PAD.left - PAD.right;
  const innerH = CHART_H - PAD.top - PAD.bottom;
  const maxVal = niceMax(Math.max(...data.map((d) => d.mrr)) * 1.15);

  const x = (i: number) => PAD.left + (i / (data.length - 1)) * innerW;
  const y = (v: number) => PAD.top + innerH - (v / maxVal) * innerH;

  const linePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(d.mrr).toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L${x(data.length - 1).toFixed(1)},${(PAD.top + innerH).toFixed(1)} L${x(0).toFixed(1)},${(PAD.top + innerH).toFixed(1)} Z`;

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(maxVal * t));
  const last = data[data.length - 1];
  const hovered = hoverIdx != null ? data[hoverIdx] : null;

  function handleMove(e: React.PointerEvent<SVGRectElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * CHART_W;
    const idx = Math.round(((relX - PAD.left) / innerW) * (data.length - 1));
    setHoverIdx(Math.max(0, Math.min(data.length - 1, idx)));
  }

  return (
    <div className="sa-chart">
      <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="sa-chart__svg" role="img" aria-label="Monthly recurring revenue, last 12 months">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#274c3f" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#274c3f" stopOpacity="0" />
          </linearGradient>
        </defs>

        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={CHART_W - PAD.right} y1={y(t)} y2={y(t)} className="sa-chart__gridline" />
            <text x={PAD.left - 8} y={y(t)} className="sa-chart__axis-label" textAnchor="end" dominantBaseline="middle">
              ${t >= 1000 ? `${(t / 1000).toFixed(1)}k` : t}
            </text>
          </g>
        ))}

        <path d={areaPath} fill={`url(#${gradId})`} stroke="none" />
        <path d={linePath} fill="none" stroke="#274c3f" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

        {data.map((d, i) => (
          <g key={d.month}>
            {(i === data.length - 1 || i === hoverIdx) && (
              <circle cx={x(i)} cy={y(d.mrr)} r={5} fill="#274c3f" stroke="#fff" strokeWidth={2} />
            )}
            {i % 2 === 0 && (
              <text x={x(i)} y={CHART_H - 6} className="sa-chart__axis-label" textAnchor="middle">
                {d.month.slice(5)}
              </text>
            )}
          </g>
        ))}

        <text x={x(data.length - 1)} y={y(last.mrr) - 12} className="sa-chart__end-label" textAnchor="end">
          ${last.mrr.toLocaleString()}
        </text>

        {hoverIdx != null && (
          <line x1={x(hoverIdx)} x2={x(hoverIdx)} y1={PAD.top} y2={PAD.top + innerH} className="sa-chart__crosshair" />
        )}

        <rect
          x={PAD.left} y={PAD.top} width={innerW} height={innerH}
          fill="transparent"
          onPointerMove={handleMove}
          onPointerLeave={() => setHoverIdx(null)}
        />
      </svg>

      {hovered && (
        <div className="sa-chart__tooltip" style={{ left: `${(x(hoverIdx!) / CHART_W) * 100}%` }}>
          <strong>${hovered.mrr.toLocaleString()}</strong>
          <span>{hovered.month}</span>
        </div>
      )}
    </div>
  );
}

// ── New signups by month bar chart ────────────────────────────────────────────

export function SignupsBarChart({ data }: { data: { month: string; count: number }[] }) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const innerW = CHART_W - PAD.left - PAD.right;
  const innerH = CHART_H - PAD.top - PAD.bottom;
  const maxVal = niceMax(Math.max(...data.map((d) => d.count)) * 1.2);
  const bandW = innerW / data.length;
  const barW = Math.min(24, bandW * 0.55);

  const y = (v: number) => PAD.top + innerH - (v / maxVal) * innerH;
  const maxIdx = data.reduce((best, d, i) => (d.count > data[best].count ? i : best), 0);
  const ticks = [0, 0.5, 1].map((t) => Math.round(maxVal * t));

  return (
    <div className="sa-chart">
      <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="sa-chart__svg" role="img" aria-label="New church signups per month">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={CHART_W - PAD.right} y1={y(t)} y2={y(t)} className="sa-chart__gridline" />
            <text x={PAD.left - 8} y={y(t)} className="sa-chart__axis-label" textAnchor="end" dominantBaseline="middle">{t}</text>
          </g>
        ))}

        {data.map((d, i) => {
          const cx = PAD.left + i * bandW + bandW / 2;
          const barH = (d.count / maxVal) * innerH;
          const isHover = hoverIdx === i;
          return (
            <g key={d.month}>
              <rect
                x={cx - barW / 2} y={y(d.count)} width={barW} height={barH}
                rx={4}
                className={isHover ? 'sa-bar sa-bar--hover' : 'sa-bar'}
                onPointerEnter={() => setHoverIdx(i)}
                onPointerLeave={() => setHoverIdx(null)}
              />
              {i === maxIdx && (
                <text x={cx} y={y(d.count) - 8} className="sa-chart__end-label" textAnchor="middle">{d.count}</text>
              )}
              {i % 2 === 0 && (
                <text x={cx} y={CHART_H - 6} className="sa-chart__axis-label" textAnchor="middle">{d.month.slice(5)}</text>
              )}
            </g>
          );
        })}
      </svg>

      {hoverIdx != null && (
        <div className="sa-chart__tooltip" style={{ left: `${((PAD.left + hoverIdx * bandW + bandW / 2) / CHART_W) * 100}%` }}>
          <strong>{data[hoverIdx].count} new churches</strong>
          <span>{data[hoverIdx].month}</span>
        </div>
      )}
    </div>
  );
}

// ── Churn rate gauge (meter) ──────────────────────────────────────────────────

export function ChurnRateGauge({ rate }: { rate: number }) {
  const pct = Math.round(rate * 1000) / 10; // one decimal
  const fillPct = Math.min(100, (pct / 20) * 100); // scale to a 0–20% band

  const band = pct <= 5 ? 'good' : pct <= 10 ? 'warning' : 'critical';
  const BAND_META = {
    good: { color: '#166534', label: 'Healthy' },
    warning: { color: '#9a6000', label: 'Elevated' },
    critical: { color: '#7f1d1d', label: 'High' },
  } as const;
  const meta = BAND_META[band];

  return (
    <div className="sa-gauge">
      <div className="sa-gauge__value">
        <span className="sa-gauge__number">{pct}%</span>
        <span className="sa-gauge__status" style={{ color: meta.color }}>
          <span className="sa-gauge__status-dot" style={{ background: meta.color }} />
          {meta.label}
        </span>
      </div>
      <div className="sa-gauge__track">
        <div className="sa-gauge__fill" style={{ width: `${fillPct}%`, background: meta.color }} />
        <div className="sa-gauge__tick" style={{ left: '25%' }} />
        <div className="sa-gauge__tick" style={{ left: '50%' }} />
      </div>
      <div className="sa-gauge__scale">
        <span>0%</span>
        <span>10%</span>
        <span>20%+</span>
      </div>
    </div>
  );
}
