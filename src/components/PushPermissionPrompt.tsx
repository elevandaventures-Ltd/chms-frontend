'use client';

/**
 * PushPermissionPrompt — Day 38.
 * A "priming" banner shown before the native permission dialog, with
 * context on why we're asking — browsers block re-prompting after a
 * denial, so the honest copy upfront matters more than the dialog itself.
 * Handles the denied state gracefully (no nagging, just a way back via
 * browser settings) and persists a "not now" dismissal in localStorage.
 */
import { useEffect, useState } from 'react';
import { Bell, BellOff, X } from 'lucide-react';
import {
  getPermissionState, requestNotificationPermission,
  registerServiceWorker, subscribeToPush, showLocalTestNotification,
} from '@/lib/push';

const DISMISS_KEY = 'push_prompt_dismissed_at';
const DISMISS_TTL_MS = 7 * 24 * 60 * 60 * 1000; // re-offer after a week

export function PushPermissionPrompt() {
  const [state, setState] = useState<NotificationPermission | 'unsupported' | 'loading'>('loading');
  const [dismissed, setDismissed] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setState(getPermissionState());
    try {
      const raw = localStorage.getItem(DISMISS_KEY);
      if (raw && Date.now() - Number(raw) < DISMISS_TTL_MS) setDismissed(true);
    } catch { /* localStorage unavailable — never persist dismissal */ }
  }, []);

  function dismiss() {
    setDismissed(true);
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch { /* ignore */ }
  }

  async function handleEnable() {
    setBusy(true);
    try {
      const permission = await requestNotificationPermission();
      setState(permission);
      if (permission === 'granted') {
        const registration = await registerServiceWorker();
        if (registration) await subscribeToPush(registration);
        showLocalTestNotification('Notifications enabled', "You'll hear about event reminders and church announcements.");
      }
    } finally {
      setBusy(false);
    }
  }

  function handleSendTest() {
    showLocalTestNotification('Elevanda ChMS', 'This is a test notification — delivered instantly. 🔔');
  }

  if (state === 'loading' || state === 'unsupported') return null;

  if (state === 'granted') {
    return (
      <div className="push-prompt push-prompt--granted">
        <Bell size={15} aria-hidden="true" />
        <span>Notifications are enabled for this browser.</span>
        <button type="button" className="push-prompt__test-btn" onClick={handleSendTest}>Send test notification</button>
      </div>
    );
  }

  if (state === 'denied') {
    return (
      <div className="push-prompt push-prompt--denied">
        <BellOff size={15} aria-hidden="true" />
        <span>Notifications are blocked for this site. Enable them from your browser&apos;s site settings to get event reminders and announcements.</span>
      </div>
    );
  }

  if (dismissed) return null;

  return (
    <div className="push-prompt push-prompt--ask">
      <Bell size={15} aria-hidden="true" />
      <span>Allow notifications for event reminders and church announcements.</span>
      <div className="push-prompt__actions">
        <button type="button" className="push-prompt__enable-btn" onClick={handleEnable} disabled={busy}>
          {busy ? 'Requesting…' : 'Enable notifications'}
        </button>
        <button type="button" className="push-prompt__dismiss-btn" onClick={dismiss} aria-label="Not now">
          <X size={14} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

export default PushPermissionPrompt;
