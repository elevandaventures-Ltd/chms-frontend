'use client';

/**
 * ReadOnlyGate — Day 43.
 *
 * When the platform owner suspends a church (superadmin → Churches →
 * Suspend), this shows a persistent banner and disables every interactive
 * element in the page content — the review flow's "read-only mode
 * activates" check. Billing and Settings stay fully interactive so an
 * admin can actually resolve whatever got the church suspended (e.g. a
 * failed payment) and Restore access flows the other way just as fast.
 */
import { useEffect, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';

const EXEMPT_PREFIXES = ['/billing', '/settings'];

export function ReadOnlyGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isSuspended, setIsSuspended] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/church/status')
      .then((r) => r.json())
      .then((json: { isSuspended?: boolean }) => { if (!cancelled) setIsSuspended(Boolean(json.isSuspended)); })
      .catch(() => { /* fail open — not suspended */ });
    return () => { cancelled = true; };
  }, []);

  const exempt = EXEMPT_PREFIXES.some((p) => pathname.startsWith(p));
  const locked = isSuspended && !exempt;

  return (
    <>
      {isSuspended && (
        <div className="readonly-banner" role="alert">
          <ShieldAlert size={15} aria-hidden="true" />
          <span>
            This account is <strong>suspended</strong> by the platform owner — you&apos;re in read-only mode.{' '}
            <a href="/billing">Visit Billing</a> to resolve outstanding issues.
          </span>
        </div>
      )}
      <div className={locked ? 'readonly-scope readonly-scope--locked' : 'readonly-scope'} aria-disabled={locked}>
        {children}
      </div>
    </>
  );
}

export default ReadOnlyGate;
