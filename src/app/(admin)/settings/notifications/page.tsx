'use client';

/**
 * /settings/notifications — Day 38 Task 2.
 * Member-facing preferences: which notification types they receive, per
 * channel (SMS/Email/WhatsApp/Push).
 */
import { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import {
  NOTIFICATION_CATEGORY_LABEL, NOTIFICATION_CHANNELS, CHANNEL_LABEL,
  defaultPrefsMatrix, type NotificationCategory, type NotificationPrefsMatrix,
} from '@/lib/notification-preferences';
import type { Channel } from '@/components/communication/MessageComposer';

const CATEGORIES = Object.keys(NOTIFICATION_CATEGORY_LABEL) as NotificationCategory[];

export default function NotificationPreferencesPage() {
  const [prefs, setPrefs] = useState<NotificationPrefsMatrix>(defaultPrefsMatrix());
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/notifications/preferences')
      .then((r) => r.json())
      .then((json: { data?: NotificationPrefsMatrix }) => { if (json.data) setPrefs(json.data); })
      .finally(() => setLoading(false));
  }, []);

  async function toggle(category: NotificationCategory, channel: Channel) {
    const next: NotificationPrefsMatrix = {
      ...prefs,
      [category]: { ...prefs[category], [channel]: !prefs[category][channel] },
    };
    setPrefs(next);
    setSaved(false);
    await fetch('/api/notifications/preferences', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(next),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="notif-prefs-page">
      <div className="notif-prefs-page__head">
        <h1>Notification preferences</h1>
        <p>Choose which updates you receive, and on which channel.</p>
      </div>

      {saved && (
        <div className="notif-prefs-page__saved" role="status">
          <CheckCircle2 size={14} aria-hidden="true" /> Saved
        </div>
      )}

      <div className="notif-matrix-wrap">
        <table className="notif-matrix">
          <thead>
            <tr>
              <th>Notification type</th>
              {NOTIFICATION_CHANNELS.map((ch) => <th key={ch}>{CHANNEL_LABEL[ch]}</th>)}
            </tr>
          </thead>
          <tbody>
            {CATEGORIES.map((cat) => (
              <tr key={cat}>
                <td className="notif-matrix__label">{NOTIFICATION_CATEGORY_LABEL[cat]}</td>
                {NOTIFICATION_CHANNELS.map((ch) => (
                  <td key={ch} className="notif-matrix__cell">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={prefs[cat][ch]}
                      aria-label={`${NOTIFICATION_CATEGORY_LABEL[cat]} via ${CHANNEL_LABEL[ch]}`}
                      className={`ff-toggle${prefs[cat][ch] ? ' ff-toggle--on' : ''}`}
                      onClick={() => toggle(cat, ch)}
                      disabled={loading}
                    >
                      <span className="ff-toggle__thumb" />
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
