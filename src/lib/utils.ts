/**
 * cn — class name utility (shadcn/ui standard helper)
 *
 * Merges Tailwind class names intelligently using clsx + tailwind-merge
 * so conflicting utility classes are resolved correctly.
 *
 * Usage:
 *   cn('px-4 py-2', condition && 'bg-accent', 'px-6') → 'py-2 bg-accent px-6'
 */
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * BLUR_PLACEHOLDER — Day 58: a tiny (8×8) solid --bg-accent-toned PNG used
 * as the `blurDataURL` for every above-the-fold next/image usage
 * (avatars, member photos, logos), so there's a soft placeholder instead
 * of a blank box while the real image loads.
 */
export const BLUR_PLACEHOLDER =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAE0lEQVR42mN48f7Zf3yYYWQoAAA8ve8BaDvWFQAAAABJRU5ErkJggg==';

/**
 * True for data:/blob: URIs — used to steer image rendering away from
 * next/image for these. next/image expects a fetchable URL (local path or
 * an http(s) host listed in next.config.mjs's images.remotePatterns); a
 * data: URI (e.g. the branding-logo upload's no-storage-configured
 * fallback, see /api/church/branding/logo) isn't one, and can throw at
 * render time with no error boundary above it in the shared layout —
 * callers should fall back to a plain <img> for these instead.
 */
export function isDataOrBlobUrl(src: string): boolean {
  return src.startsWith('data:') || src.startsWith('blob:');
}
