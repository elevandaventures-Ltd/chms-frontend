/**
 * bulletin.ts — Day 39 digital bulletin: branding + content config, and
 * the auto-populated sections (upcoming events, giving summary).
 */
import { mockEvents, type ChmsEvent } from '@/lib/events';

export type BulletinConfig = {
  churchName: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  welcomeMessage: string;
  sermonSeries: { title: string; part: string; verse: string; speaker: string };
  showWelcome: boolean;
  showEvents: boolean;
  showGiving: boolean;
  showSermon: boolean;
};

export const defaultBulletinConfig: BulletinConfig = {
  churchName: 'Elevanda Chapel Accra',
  logoUrl: '',
  primaryColor: '#274c3f',
  secondaryColor: '#b25131',
  welcomeMessage: 'Welcome home! Whether you\'re joining us for the first time or the hundredth, we\'re so glad you\'re here today.',
  sermonSeries: {
    title: 'Rooted',
    part: 'Part 3 — Bearing Fruit',
    verse: 'John 15:5 — "I am the vine; you are the branches."',
    speaker: 'Pastor Solomon Leek',
  },
  showWelcome: true,
  showEvents: true,
  showGiving: true,
  showSermon: true,
};

export type GivingSummary = {
  weekTotal: number;
  weekGoal: number;
  yearToDate: number;
  topFund: string;
  giverCount: number;
  currency: string;
};

export const mockGivingSummary: GivingSummary = {
  weekTotal: 8420,
  weekGoal: 10000,
  yearToDate: 214600,
  topFund: 'Building Fund',
  giverCount: 186,
  currency: 'GHS',
};

/** Events starting within the next `days` days (default 7), soonest first. */
export function getUpcomingEvents(days = 7, from: Date = new Date()): ChmsEvent[] {
  const end = new Date(from.getTime() + days * 86_400_000);
  return mockEvents
    .filter((e) => e.start >= from && e.start <= end)
    .sort((a, b) => a.start.getTime() - b.start.getTime());
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Self-contained inline-styled HTML for the emailed bulletin — email
 *  clients strip <style> blocks and external CSS, so every rule is inline. */
export function renderBulletinEmailHtml(config: BulletinConfig, events: ChmsEvent[], giving: GivingSummary): string {
  const eventRows = events.length
    ? events.map((e) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #eee;">
            <strong style="color:${config.primaryColor};">${escapeHtml(e.title)}</strong><br/>
            <span style="color:#6b625b;font-size:13px;">
              ${e.start.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
              at ${e.start.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
              ${e.location ? ' · ' + escapeHtml(e.location) : ''}
            </span>
          </td>
        </tr>`).join('')
    : `<tr><td style="padding:10px 0;color:#6b625b;">No events in the next 7 days.</td></tr>`;

  const givingPct = Math.min(100, Math.round((giving.weekTotal / giving.weekGoal) * 100));

  return `<!doctype html>
<html><body style="margin:0;background:#f3efe7;font-family:Georgia,serif;color:#1d1a17;">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;margin:24px 0;border-radius:12px;overflow:hidden;">
      <tr><td style="background:${config.primaryColor};padding:28px 32px;text-align:center;">
        ${config.logoUrl ? `<img src="${escapeHtml(config.logoUrl)}" alt="${escapeHtml(config.churchName)}" height="40" style="margin-bottom:8px;" />` : ''}
        <div style="color:#fff;font-size:22px;font-weight:bold;">${escapeHtml(config.churchName)}</div>
        <div style="color:rgba(255,255,255,0.75);font-size:13px;">Weekly Bulletin — ${new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</div>
      </td></tr>

      ${config.showWelcome ? `
      <tr><td style="padding:24px 32px 8px;">
        <p style="font-size:15px;line-height:1.6;">${escapeHtml(config.welcomeMessage)}</p>
      </td></tr>` : ''}

      ${config.showSermon ? `
      <tr><td style="padding:16px 32px;border-top:1px solid #eee;">
        <div style="color:${config.secondaryColor};font-size:12px;text-transform:uppercase;letter-spacing:0.08em;font-weight:bold;">This week's message</div>
        <div style="font-size:18px;font-weight:bold;margin-top:4px;">${escapeHtml(config.sermonSeries.title)} — ${escapeHtml(config.sermonSeries.part)}</div>
        <div style="font-size:13px;color:#6b625b;margin-top:4px;">${escapeHtml(config.sermonSeries.verse)}</div>
        <div style="font-size:13px;color:#6b625b;">${escapeHtml(config.sermonSeries.speaker)}</div>
      </td></tr>` : ''}

      ${config.showEvents ? `
      <tr><td style="padding:16px 32px;border-top:1px solid #eee;">
        <div style="color:${config.secondaryColor};font-size:12px;text-transform:uppercase;letter-spacing:0.08em;font-weight:bold;">Upcoming — next 7 days</div>
        <table width="100%" cellpadding="0" cellspacing="0">${eventRows}</table>
      </td></tr>` : ''}

      ${config.showGiving ? `
      <tr><td style="padding:16px 32px;border-top:1px solid #eee;">
        <div style="color:${config.secondaryColor};font-size:12px;text-transform:uppercase;letter-spacing:0.08em;font-weight:bold;">Giving summary</div>
        <div style="font-size:14px;margin-top:6px;">This week: <strong>${giving.currency} ${giving.weekTotal.toLocaleString()}</strong> of ${giving.currency} ${giving.weekGoal.toLocaleString()} goal (${givingPct}%)</div>
        <div style="font-size:13px;color:#6b625b;">Year to date: ${giving.currency} ${giving.yearToDate.toLocaleString()} · ${giving.giverCount} givers · Top fund: ${escapeHtml(giving.topFund)}</div>
      </td></tr>` : ''}

      <tr><td style="padding:20px 32px;border-top:1px solid #eee;text-align:center;color:#a39c93;font-size:12px;">
        Sent with love from ${escapeHtml(config.churchName)} · Elevanda ChMS
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}
