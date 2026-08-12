'use client';

/**
 * ChannelPerformanceDashboard — Day 40.
 * Bar chart (SMS vs. email vs. WhatsApp vs. push delivery rates),
 * best-time-to-send heatmap, and message category performance breakdown.
 */
import { useEffect, useState } from 'react';
import { CHANNEL_LABEL, CHANNEL_COLOR, type ChannelKey } from '@/lib/channel-performance';

type ChannelRate = { channel: ChannelKey; sent: number; delivered: number };
type CategoryPerf = { category: string; sent: number; delivered: number };
type Heatmap = { days: readonly string[]; hours: readonly string[]; values: number[][] };

type Data = { channels: ChannelRate[]; heatmap: Heatmap; categories: CategoryPerf[] };

function pct(n: number, total: number): number {
  return total === 0 ? 0 : Math.round((n / total) * 100);
}

function heatColor(value: number): string {
  // Sequential single hue (blue), light → dark with value 0–100.
  const t = Math.max(0, Math.min(1, value / 80));
  const l = 92 - t * 52; // 92% (light) → 40% (dark)
  return `hsl(217, 70%, ${l}%)`;
}

export function ChannelPerformanceDashboard() {
  const [data, setData] = useState<Data | null>(null);
  const [hoverChannel, setHoverChannel] = useState<ChannelKey | null>(null);

  useEffect(() => {
    fetch('/api/communication/channel-performance')
      .then((r) => r.json())
      .then((json: { data?: Data }) => setData(json.data ?? null))
      .catch(() => setData(null));
  }, []);

  if (!data) {
    return <div className="cpd-loading">Loading channel performance…</div>;
  }

  const maxSent = Math.max(...data.channels.map((c) => c.sent));
  const sortedCategories = [...data.categories].sort((a, b) => pct(b.delivered, b.sent) - pct(a.delivered, a.sent));

  return (
    <div className="cpd">
      <section className="cpd-section">
        <h3 className="cpd-section__title">Delivery rate by channel</h3>
        <div className="cpd-bars">
          {data.channels.map((c) => {
            const rate = pct(c.delivered, c.sent);
            return (
              <div
                key={c.channel}
                className="cpd-bar-row"
                onPointerEnter={() => setHoverChannel(c.channel)}
                onPointerLeave={() => setHoverChannel(null)}
              >
                <span className="cpd-bar-row__label">
                  <span className="cpd-bar-row__swatch" style={{ background: CHANNEL_COLOR[c.channel] }} />
                  {CHANNEL_LABEL[c.channel]}
                </span>
                <div className="cpd-bar-row__track">
                  <div
                    className="cpd-bar-row__fill"
                    style={{ width: `${(c.sent / maxSent) * 100}%`, background: CHANNEL_COLOR[c.channel] }}
                  />
                </div>
                <span className="cpd-bar-row__value">{rate}%</span>
                {hoverChannel === c.channel && (
                  <div className="cpd-tooltip">
                    <strong>{CHANNEL_LABEL[c.channel]}</strong>
                    <span>{c.delivered.toLocaleString()} / {c.sent.toLocaleString()} delivered ({rate}%)</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="cpd-section">
        <h3 className="cpd-section__title">Best time to send</h3>
        <p className="cpd-section__subtitle">Engagement rate by day and hour — darker is stronger.</p>
        <div className="cpd-heatmap">
          <div className="cpd-heatmap__grid" style={{ gridTemplateColumns: `56px repeat(${data.heatmap.hours.length}, 1fr)` }}>
            <div />
            {data.heatmap.hours.map((h) => (
              <div key={h} className="cpd-heatmap__hour">{h}</div>
            ))}
            {data.heatmap.days.map((day, di) => (
              <FragmentRow key={day} day={day} values={data.heatmap.values[di]} hours={data.heatmap.hours} />
            ))}
          </div>
          <div className="cpd-heatmap__scale">
            <span>Low</span>
            <div className="cpd-heatmap__scale-bar" />
            <span>High</span>
          </div>
        </div>
      </section>

      <section className="cpd-section">
        <h3 className="cpd-section__title">Message category performance</h3>
        <div className="cpd-categories">
          {sortedCategories.map((cat) => {
            const rate = pct(cat.delivered, cat.sent);
            return (
              <div key={cat.category} className="cpd-cat-row">
                <span className="cpd-cat-row__label">{cat.category}</span>
                <div className="cpd-cat-row__track">
                  <div className="cpd-cat-row__fill" style={{ width: `${rate}%` }} />
                </div>
                <span className="cpd-cat-row__value">{rate}%</span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function FragmentRow({ day, values, hours }: { day: string; values: number[]; hours: readonly string[] }) {
  return (
    <>
      <div className="cpd-heatmap__day">{day}</div>
      {values.map((v, i) => (
        <div
          key={i}
          className="cpd-heatmap__cell"
          style={{ background: heatColor(v) }}
          tabIndex={0}
          title={`${day} ${hours[i]} — ${v}% engagement`}
          aria-label={`${day} ${hours[i]}: ${v}% engagement`}
        />
      ))}
    </>
  );
}

export default ChannelPerformanceDashboard;
