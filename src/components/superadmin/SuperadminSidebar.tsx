'use client';

/**
 * SuperadminSidebar — Day 41.
 *
 * Deliberately dark GREEN (vs. the church-admin sidebar's dark charcoal/
 * brown) so a platform owner never mistakes one workspace for the other.
 */
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Building2, ToggleLeft, ScrollText, ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type NavItem = { label: string; href: string; icon: React.ReactNode };

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',     href: '/superadmin',              icon: <LayoutDashboard size={16} aria-hidden="true" /> },
  { label: 'Churches',      href: '/superadmin/churches',      icon: <Building2 size={16} aria-hidden="true" /> },
  { label: 'Feature Flags', href: '/superadmin/feature-flags', icon: <ToggleLeft size={16} aria-hidden="true" /> },
  { label: 'Audit Log',     href: '/superadmin/audit-log',     icon: <ScrollText size={16} aria-hidden="true" /> },
];

export function SuperadminSidebar() {
  const pathname = usePathname();

  function isActive(href: string): boolean {
    if (href === '/superadmin') return pathname === '/superadmin';
    return pathname === href || pathname.startsWith(href + '/');
  }

  return (
    <aside className="sa-sidebar" aria-label="Superadmin navigation">
      <div className="sa-sidebar__brand">
        <div className="sa-sidebar__brand-icon">
          <ShieldCheck size={20} aria-hidden="true" />
        </div>
        <div className="sa-sidebar__brand-copy">
          <p className="sa-sidebar__eyebrow">Elevanda Ventures</p>
          <h2 className="sa-sidebar__title">Superadmin</h2>
        </div>
      </div>

      <div className="sa-sidebar__badge">
        <ShieldCheck size={13} aria-hidden="true" />
        Platform Owner
      </div>

      <nav className="sa-sidebar__nav" aria-label="Superadmin sections">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn('sa-sidebar__nav-item', active && 'sa-sidebar__nav-item--active')}
              aria-current={active ? 'page' : undefined}
            >
              <span className="sa-sidebar__nav-icon">{item.icon}</span>
              <span className="sa-sidebar__nav-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sa-sidebar__footer">
        <Link href="/dashboard" className="sa-sidebar__exit-link">
          Exit to church workspace →
        </Link>
      </div>
    </aside>
  );
}

export default SuperadminSidebar;
