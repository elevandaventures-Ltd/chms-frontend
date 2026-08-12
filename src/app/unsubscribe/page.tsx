'use client';

/**
 * /unsubscribe — Day 40. Public preference-management page reached from a
 * link in a sent message (no login required — see middleware PUBLIC_PATHS
 * and /api/unsubscribe for the token-based access model).
 */
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { BellOff, Mail, MessageSquare, Send, Bell, CheckCircle2 } from 'lucide-react';

type Categories = { announcements: boolean; events: boolean; newsletter: boolean; giving: boolean };
type Prefs = {
  token: string;
  memberName: string;
  churchName: string;
  smsEnabled: boolean;
  emailEnabled: boolean;
  whatsappEnabled: boolean;
  pushEnabled: boolean;
  categories: Categories;
};

const CATEGORY_LABEL: Record<keyof Categories, string> = {
  announcements: 'General announcements',
  events: 'Event invitations',
  newsletter: 'Newsletter',
  giving: 'Giving & stewardship reminders',
};

export default function UnsubscribePage() {
  return (
    <Suspense fallback={<div className="unsub-page"><div className="unsub-card">Loading…</div></div>}>
      <UnsubscribePageInner />
    </Suspense>
  );
}

function UnsubscribePageInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? 'demo';
  const [prefs, setPrefs] = useState<Prefs | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`/api/unsubscribe?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((json: { data?: Prefs }) => setPrefs(json.data ?? null))
      .catch(() => setPrefs(null));
  }, [token]);

  async function save(next: Prefs) {
    setPrefs(next);
    setSaving(true);
    setSaved(false);
    try {
      await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(next),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  function unsubscribeAll() {
    if (!prefs) return;
    void save({
      ...prefs,
      smsEnabled: false, emailEnabled: false, whatsappEnabled: false, pushEnabled: false,
      categories: { announcements: false, events: false, newsletter: false, giving: false },
    });
  }

  if (!prefs) {
    return (
      <div className="unsub-page">
        <div className="unsub-card">
          <p>We couldn&apos;t find that unsubscribe link. It may have expired.</p>
        </div>
      </div>
    );
  }

  const allOff = !prefs.smsEnabled && !prefs.emailEnabled && !prefs.whatsappEnabled && !prefs.pushEnabled;

  return (
    <div className="unsub-page">
      <div className="unsub-card">
        <div className="unsub-card__brand">Elevanda ChMS</div>
        <h1 className="unsub-card__title">Notification preferences</h1>
        <p className="unsub-card__sub">
          {prefs.memberName} · {prefs.churchName}
        </p>

        {allOff && (
          <div className="unsub-card__banner">
            <BellOff size={14} aria-hidden="true" />
            You&apos;re unsubscribed from every channel. You can turn any of these back on below.
          </div>
        )}
        {saved && (
          <div className="unsub-card__banner unsub-card__banner--success">
            <CheckCircle2 size={14} aria-hidden="true" />
            Preferences saved.
          </div>
        )}

        <section className="unsub-section">
          <h2>Channels</h2>
          <label className="unsub-toggle-row">
            <span><MessageSquare size={14} aria-hidden="true" /> SMS</span>
            <input type="checkbox" checked={prefs.smsEnabled} onChange={(e) => save({ ...prefs, smsEnabled: e.target.checked })} disabled={saving} />
          </label>
          <label className="unsub-toggle-row">
            <span><Mail size={14} aria-hidden="true" /> Email</span>
            <input type="checkbox" checked={prefs.emailEnabled} onChange={(e) => save({ ...prefs, emailEnabled: e.target.checked })} disabled={saving} />
          </label>
          <label className="unsub-toggle-row">
            <span><Send size={14} aria-hidden="true" /> WhatsApp</span>
            <input type="checkbox" checked={prefs.whatsappEnabled} onChange={(e) => save({ ...prefs, whatsappEnabled: e.target.checked })} disabled={saving} />
          </label>
          <label className="unsub-toggle-row">
            <span><Bell size={14} aria-hidden="true" /> Push notifications</span>
            <input type="checkbox" checked={prefs.pushEnabled} onChange={(e) => save({ ...prefs, pushEnabled: e.target.checked })} disabled={saving} />
          </label>
        </section>

        <section className="unsub-section">
          <h2>What you hear about</h2>
          {(Object.keys(CATEGORY_LABEL) as (keyof Categories)[]).map((key) => (
            <label key={key} className="unsub-toggle-row">
              <span>{CATEGORY_LABEL[key]}</span>
              <input
                type="checkbox"
                checked={prefs.categories[key]}
                onChange={(e) => save({ ...prefs, categories: { ...prefs.categories, [key]: e.target.checked } })}
                disabled={saving}
              />
            </label>
          ))}
        </section>

        <button type="button" className="unsub-card__unsub-all" onClick={unsubscribeAll} disabled={saving || allOff}>
          Unsubscribe from everything
        </button>
      </div>
    </div>
  );
}
