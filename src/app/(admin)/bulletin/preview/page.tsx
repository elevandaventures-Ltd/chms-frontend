'use client';

/**
 * /bulletin/preview — Day 39 Task 2. Full-size preview of the bulletin
 * before it auto-generates, plus a manual "Send Now" trigger for testing
 * (Day 39 review: "verify it sends to test email").
 */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import { BulletinPreview } from '@/components/bulletin/BulletinPreview';
import { defaultBulletinConfig, getUpcomingEvents, mockGivingSummary, type BulletinConfig } from '@/lib/bulletin';

export default function BulletinPreviewPage() {
  const [config, setConfig] = useState<BulletinConfig>(defaultBulletinConfig);
  const [loading, setLoading] = useState(true);
  const [testEmail, setTestEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ eventCount: number; mock?: boolean } | null>(null);

  useEffect(() => {
    fetch('/api/bulletin/config')
      .then((r) => r.json())
      .then((json: { data?: BulletinConfig }) => { if (json.data) setConfig(json.data); })
      .finally(() => setLoading(false));
  }, []);

  const events = getUpcomingEvents(7);

  async function handleSendNow() {
    if (!testEmail.trim()) { setError('Enter a test email address.'); return; }
    setSending(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/bulletin/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testEmail: testEmail.trim(), config }),
      });
      const json = await res.json() as { sent?: boolean; eventCount?: number; mock?: boolean; message?: string };
      if (!res.ok || !json.sent) { setError(json.message ?? 'Failed to send.'); return; }
      setResult({ eventCount: json.eventCount ?? events.length, mock: json.mock });
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="bulletin-preview-page">
      <div className="bulletin-editor__head">
        <div>
          <Link href="/bulletin" className="bulletin-preview-page__back"><ArrowLeft size={13} aria-hidden="true" /> Back to editor</Link>
          <h1>Bulletin preview</h1>
          <p>Exactly what your congregation will receive, generated live from this week&apos;s events and giving data.</p>
        </div>
      </div>

      <div className="bulletin-preview-page__layout">
        <BulletinPreview config={config} events={events} giving={mockGivingSummary} />

        <aside className="bulletin-preview-page__send">
          <h3>Send Now</h3>
          <p>Manually trigger bulletin generation and send it to a test email — useful for QA before the scheduled auto-send.</p>
          <label className="bulletin-editor__field">
            <span>Test email</span>
            <input type="email" value={testEmail} onChange={(e) => setTestEmail(e.target.value)} placeholder="you@example.com" disabled={loading} />
          </label>
          {error && <p className="comm-error" role="alert">{error}</p>}
          {result && (
            <div className="bulletin-preview-page__result">
              <CheckCircle2 size={14} aria-hidden="true" />
              Sent — includes {result.eventCount} upcoming event{result.eventCount !== 1 ? 's' : ''} and this week&apos;s giving summary.
              {result.mock && <span className="bulletin-preview-page__mock-note"> (mock send — no email provider configured)</span>}
            </div>
          )}
          <button type="button" className="sa-btn sa-btn--primary" onClick={handleSendNow} disabled={sending || loading}>
            <Send size={14} aria-hidden="true" /> {sending ? 'Sending…' : 'Send Now'}
          </button>
        </aside>
      </div>
    </div>
  );
}
