/**
 * QR payload helpers for member check-in (Day 22).
 *
 * A member's check-in QR encodes a small, namespaced token so the scanner can
 * tell our codes apart from arbitrary QR codes it might see:
 *
 *   elevanda:member:<memberId>
 *
 * The namespace prefix lets the scan loop reject unrelated QR codes quickly.
 */

const PREFIX = 'elevanda:member:';

export function encodeMemberQr(memberId: string): string {
  return `${PREFIX}${memberId}`;
}

/** Returns the member id for a valid token, or null for anything else. */
export function decodeMemberQr(raw: string): string | null {
  const value = raw.trim();
  if (!value.startsWith(PREFIX)) return null;
  const id = value.slice(PREFIX.length).trim();
  return id.length > 0 ? id : null;
}
