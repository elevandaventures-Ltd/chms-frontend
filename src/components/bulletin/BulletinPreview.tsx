'use client';

/**
 * BulletinPreview — Day 39. On-screen render of the bulletin (branded
 * with church colors + logo), shared by the editor's live mini-preview
 * and the full-page preview. The emailed version is a separately
 * inline-styled HTML string (lib/bulletin.ts renderBulletinEmailHtml) —
 * email clients strip page CSS, so the two renderers are intentionally
 * different implementations of the same content.
 */
import { Church, Gift, BookOpen, CalendarDays } from 'lucide-react';
import type { BulletinConfig, GivingSummary } from '@/lib/bulletin';
import type { ChmsEvent } from '@/lib/events';

type Props = {
  config: BulletinConfig;
  events: ChmsEvent[];
  giving: GivingSummary;
  compact?: boolean;
};

export function BulletinPreview({ config, events, giving, compact }: Props) {
  const givingPct = Math.min(100, Math.round((giving.weekTotal / giving.weekGoal) * 100));

  return (
    <div className={`bulletin-sheet${compact ? ' bulletin-sheet--compact' : ''}`}>
      <div className="bulletin-sheet__header" style={{ background: config.primaryColor }}>
        {config.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={config.logoUrl} alt={config.churchName} className="bulletin-sheet__logo" />
        ) : (
          <span className="bulletin-sheet__logo-fallback"><Church size={20} aria-hidden="true" /></span>
        )}
        <div>
          <strong>{config.churchName}</strong>
          <span>Weekly Bulletin — {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {config.showWelcome && (
        <section className="bulletin-sheet__section">
          <p className="bulletin-sheet__welcome">{config.welcomeMessage}</p>
        </section>
      )}

      {config.showSermon && (
        <section className="bulletin-sheet__section">
          <h4 style={{ color: config.secondaryColor }}><BookOpen size={13} aria-hidden="true" /> This week&apos;s message</h4>
          <p className="bulletin-sheet__sermon-title">{config.sermonSeries.title} — {config.sermonSeries.part}</p>
          <p className="bulletin-sheet__sermon-verse">{config.sermonSeries.verse}</p>
          <p className="bulletin-sheet__sermon-speaker">{config.sermonSeries.speaker}</p>
        </section>
      )}

      {config.showEvents && (
        <section className="bulletin-sheet__section">
          <h4 style={{ color: config.secondaryColor }}><CalendarDays size={13} aria-hidden="true" /> Upcoming — next 7 days</h4>
          {events.length === 0 ? (
            <p className="bulletin-sheet__empty">No events in the next 7 days.</p>
          ) : (
            <ul className="bulletin-sheet__events">
              {events.map((e) => (
                <li key={e.id}>
                  <strong>{e.title}</strong>
                  <span>
                    {e.start.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })} at{' '}
                    {e.start.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    {e.location ? ` · ${e.location}` : ''}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {config.showGiving && (
        <section className="bulletin-sheet__section">
          <h4 style={{ color: config.secondaryColor }}><Gift size={13} aria-hidden="true" /> Giving summary</h4>
          <div className="bulletin-sheet__giving-track">
            <div className="bulletin-sheet__giving-fill" style={{ width: `${givingPct}%`, background: config.primaryColor }} />
          </div>
          <p className="bulletin-sheet__giving-line">
            This week: <strong>{giving.currency} {giving.weekTotal.toLocaleString()}</strong> of {giving.currency} {giving.weekGoal.toLocaleString()} goal ({givingPct}%)
          </p>
          <p className="bulletin-sheet__giving-sub">
            Year to date: {giving.currency} {giving.yearToDate.toLocaleString()} · {giving.giverCount} givers · Top fund: {giving.topFund}
          </p>
        </section>
      )}

      <div className="bulletin-sheet__footer">Sent with love from {config.churchName} · Elevanda ChMS</div>
    </div>
  );
}

export default BulletinPreview;
