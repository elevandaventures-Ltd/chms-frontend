'use client';

/**
 * useChurchBranding — Day 47/50. Fetches the church's branding and keeps
 * every consumer (sidebar logo, this hook's other instances) in sync via
 * a window event dispatched right after a successful save — no reload,
 * no polling, "reflects changes instantly" per the Day 50 review.
 */
import { useEffect, useState, useCallback } from 'react';
import { defaultBranding, type ChurchBranding } from '@/lib/church-branding';

const BRANDING_UPDATED_EVENT = 'church-branding-updated';

export function notifyBrandingUpdated(branding: ChurchBranding) {
  window.dispatchEvent(new CustomEvent<ChurchBranding>(BRANDING_UPDATED_EVENT, { detail: branding }));
}

export function applyBrandingCssVars(branding: ChurchBranding) {
  if (typeof document === 'undefined') return;
  document.documentElement.style.setProperty('--accent', branding.accentColor);
}

export function useChurchBranding(): { branding: ChurchBranding; loading: boolean; refresh: () => void } {
  const [branding, setBranding] = useState<ChurchBranding>(defaultBranding);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    fetch('/api/church/branding')
      .then((r) => r.json())
      .then((json: { data?: ChurchBranding }) => {
        if (json.data) {
          setBranding(json.data);
          applyBrandingCssVars(json.data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    function onUpdate(e: Event) {
      const detail = (e as CustomEvent<ChurchBranding>).detail;
      if (detail) {
        setBranding(detail);
        applyBrandingCssVars(detail);
      }
    }
    window.addEventListener(BRANDING_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(BRANDING_UPDATED_EVENT, onUpdate);
  }, []);

  return { branding, loading, refresh };
}
