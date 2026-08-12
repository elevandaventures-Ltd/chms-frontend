'use client';

/**
 * ServiceWorkerManager — Day 51 Task 2. Registers the service worker on
 * app load and handles the update lifecycle: when a new version has
 * installed and is waiting, show an "Update available — reload" toast;
 * clicking it activates the new worker and reloads exactly once.
 */
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { registerServiceWorker, watchForServiceWorkerUpdate, activateWaitingServiceWorker } from '@/lib/push';

export function ServiceWorkerManager() {
  const reloadingRef = useRef(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      // Dev mode never registers a service worker: Workbox's NetworkFirst/
      // StaleWhileRevalidate caches hold onto pages and /_next/static/*
      // chunks from whatever build was running when they were cached. This
      // repo's dev workflow restarts the server and wipes .next/rebuilds
      // fresh content hashes often (Turbopack cache resets), so a SW left
      // over from an earlier session serves stale HTML referencing chunk
      // files that no longer exist on the freshly restarted server —
      // hydration/HMR breaks, and the "reload on new SW" handler below
      // fires repeatedly, which is exactly what a nonstop reload/"shaking"
      // tab looks like. Proactively tear down any such leftover SW/caches
      // from a previous session so this is self-healing, not just guarded
      // going forward.
      navigator.serviceWorker?.getRegistrations?.().then((regs) => {
        regs.forEach((reg) => void reg.unregister());
      });
      if (typeof caches !== 'undefined') {
        void caches.keys().then((keys) => keys.forEach((key) => void caches.delete(key)));
      }
      return;
    }

    let registration: ServiceWorkerRegistration | null = null;

    (async () => {
      registration = await registerServiceWorker();
      if (!registration) return;

      watchForServiceWorkerUpdate(registration, () => {
        toast('Update available', {
          description: 'A new version of Elevanda ChMS is ready.',
          duration: Infinity,
          action: {
            label: 'Reload',
            onClick: () => { if (registration) activateWaitingServiceWorker(registration); },
          },
        });
      });
    })();

    function onControllerChange() {
      if (reloadingRef.current) return;
      reloadingRef.current = true;
      window.location.reload();
    }
    navigator.serviceWorker?.addEventListener?.('controllerchange', onControllerChange);
    return () => navigator.serviceWorker?.removeEventListener?.('controllerchange', onControllerChange);
  }, []);

  return null;
}

export default ServiceWorkerManager;
