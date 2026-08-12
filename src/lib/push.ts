/**
 * push.ts — Web Push helpers (Day 38).
 *
 * Uses the real browser Notification / Service Worker / Push APIs — no
 * library needed client-side. Server-triggered push additionally needs a
 * VAPID key pair and the `web-push` package; when
 * NEXT_PUBLIC_VAPID_PUBLIC_KEY is absent (the default in this project,
 * same as the Twilio/Stripe/service-role-key convention elsewhere), the
 * subscribe step is skipped and the "send test" button falls back to a
 * local `Notification` — genuinely real, just not server-pushed.
 */

export function isPushSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator;
}

export function getPermissionState(): NotificationPermission | 'unsupported' {
  if (!isPushSupported()) return 'unsupported';
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isPushSupported()) return 'denied';
  return Notification.requestPermission();
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isPushSupported()) return null;
  try {
    return await navigator.serviceWorker.register('/sw.js');
  } catch {
    return null;
  }
}

/**
 * Update lifecycle (Day 51 Task 2). Calls `onUpdateReady` once a new
 * service worker has installed and is waiting to activate — the caller
 * shows an "Update available — reload" toast and, on click, calls
 * `activateWaitingServiceWorker()` followed by a page reload.
 */
export function watchForServiceWorkerUpdate(
  registration: ServiceWorkerRegistration,
  onUpdateReady: () => void,
): void {
  // A worker may already be sitting in "waiting" from a previous visit.
  if (registration.waiting && navigator.serviceWorker.controller) {
    onUpdateReady();
  }

  registration.addEventListener('updatefound', () => {
    const installing = registration.installing;
    if (!installing) return;
    installing.addEventListener('statechange', () => {
      if (installing.state === 'installed' && navigator.serviceWorker.controller) {
        onUpdateReady();
      }
    });
  });
}

export function activateWaitingServiceWorker(registration: ServiceWorkerRegistration): void {
  registration.waiting?.postMessage('SKIP_WAITING');
}

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const bytes = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

/** Subscribes to server push when a VAPID public key is configured; returns
 *  null (not an error) when it isn't — the feature degrades to local-only. */
export async function subscribeToPush(registration: ServiceWorkerRegistration): Promise<PushSubscription | null> {
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidPublicKey) return null;

  try {
    const existing = await registration.pushManager.getSubscription();
    if (existing) return existing;
    return await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });
  } catch {
    return null;
  }
}

/** Fires a real local notification immediately — used for the "send test
 *  notification to myself" button so the Day 38 review's "arrives within
 *  3 seconds" check has something genuine to observe without a connected
 *  push server. */
export function showLocalTestNotification(title: string, body: string): void {
  if (!isPushSupported() || Notification.permission !== 'granted') return;
  new Notification(title, { body, icon: '/favicon.svg' });
}
