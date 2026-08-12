'use client';

/**
 * Breadcrumbs — auto-generates breadcrumb trail from the current pathname.
 *
 * Converts URL segments into human-readable labels.
 * Example: /members/123/attendance → Home > Members > Member > Attendance
 *
 * Used in AdminShell on every protected page.
 */
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

// ── Label overrides for known route segments ──────────────────────────────────
const SEGMENT_LABELS: Record<string, string> = {
  '':             'Home',
  'members':      'Members',
  'attendance':   'Attendance',
  'events':       'Events',
  'communication':'Communication',
  'finance':      'Finance',
  'settings':     'Settings',
  'profile':      'Profile',
  'onboarding':   'Register Church',
  'login':        'Sign In',
  'signup':       'Sign Up',
  'billing':      'Billing',
  'superadmin':   'Platform',
  'churches':     'Churches',
  'feature-flags':'Feature Flags',
  'audit-log':    'Audit Log',
  'unsubscribe':  'Unsubscribe',
  'notifications':'Notifications',
  'scheduled':    'Scheduled',
  'inbox':        'Inbox',
  'bulletin':     'Bulletin',
  'preview':      'Preview',
  'team':         'Team',
  'branding':     'Branding',
  'general':      'General',
  'permissions':  'Roles & Permissions',
  'custom-fields':'Custom Fields',
  'data-export':  'Data & Exports',
  'invite':       'Invitation',
};

function labelFor(segment: string): string {
  const lower = segment.toLowerCase();
  if (SEGMENT_LABELS[lower]) return SEGMENT_LABELS[lower];
  // UUID or numeric ID → show as "Record"
  if (/^[0-9a-f-]{8,}$/i.test(segment) || /^\d+$/.test(segment)) return 'Record';
  // Capitalise kebab-case: my-church → My Church
  return segment
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function Breadcrumbs({ className = '' }: { className?: string }) {
  const pathname = usePathname();

  // Build crumb list from path segments
  const segments = pathname.split('/').filter(Boolean);

  type Crumb = { label: string; href: string; isLast: boolean };

  const crumbs: Crumb[] = [
    { label: 'Home', href: '/', isLast: segments.length === 0 },
    ...segments.map((seg, idx) => ({
      label: labelFor(seg),
      href: '/' + segments.slice(0, idx + 1).join('/'),
      isLast: idx === segments.length - 1,
    })),
  ];

  // Only show breadcrumbs when we're not on the root
  if (segments.length === 0) return null;

  return (
    <nav className={`breadcrumbs ${className}`} aria-label="Breadcrumb">
      <ol className="breadcrumbs__list">
        {crumbs.map((crumb, idx) => (
          <li key={crumb.href} className="breadcrumbs__item">
            {idx === 0 && (
              <Home size={13} className="breadcrumbs__home-icon" aria-hidden="true" />
            )}
            {crumb.isLast ? (
              <span className="breadcrumbs__current" aria-current="page">
                {crumb.label}
              </span>
            ) : (
              <>
                <Link href={crumb.href} className="breadcrumbs__link">
                  {crumb.label}
                </Link>
                <ChevronRight
                  size={13}
                  className="breadcrumbs__separator"
                  aria-hidden="true"
                />
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default Breadcrumbs;
