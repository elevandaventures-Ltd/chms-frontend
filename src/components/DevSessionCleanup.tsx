"use client";

import { useEffect } from 'react';

export default function DevSessionCleanup() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    const refreshThresholdMs = 30_000;
    let hiddenAt = 0;

    const cleanup = async () => {
      try {
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();

          await Promise.all(registrations.map((registration) => registration.unregister()));
        }

        if ('caches' in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map((key) => caches.delete(key)));
        }
      } catch {
        // Ignore cleanup failures in development; the app should still render.
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        hiddenAt = Date.now();
        return;
      }

      if (hiddenAt > 0 && Date.now() - hiddenAt > refreshThresholdMs) {
        window.location.reload();
      }
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        window.location.reload();
      }
    };

    void cleanup();

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, []);

  return null;
}
