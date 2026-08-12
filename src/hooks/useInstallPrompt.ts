'use client';

/**
 * useInstallPrompt — Day 56 Task 1. Captures the browser's
 * `beforeinstallprompt` event, defers it (per the spec — the browser
 * won't show its own mini-infobar once you've called preventDefault),
 * and exposes a `promptInstall()` to trigger the native install dialog
 * from a custom "Install App" button.
 *
 * `beforeinstallprompt` is a Chromium-only event (Chrome, Edge, Samsung
 * Internet, Android WebView) — Firefox and Safari never fire it, so
 * `canInstall` simply stays false there and the button doesn't render.
 * Safari's install path (iOS "Add to Home Screen") has no JS trigger at
 * all — see the Day 55 cross-browser notes.
 */
import { useEffect, useState, useCallback } from 'react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

export function useInstallPrompt(): { canInstall: boolean; installed: boolean; promptInstall: () => Promise<'accepted' | 'dismissed' | 'unavailable'> } {
  const [deferredEvent, setDeferredEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    function onBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferredEvent(e as BeforeInstallPromptEvent);
    }
    function onAppInstalled() {
      setInstalled(true);
      setDeferredEvent(null);
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);

    // Already running as an installed PWA — no point offering to install again.
    if (window.matchMedia?.('(display-mode: standalone)').matches) setInstalled(true);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
    if (!deferredEvent) return 'unavailable';
    await deferredEvent.prompt();
    const { outcome } = await deferredEvent.userChoice;
    setDeferredEvent(null);
    return outcome;
  }, [deferredEvent]);

  return { canInstall: deferredEvent !== null && !installed, installed, promptInstall };
}
