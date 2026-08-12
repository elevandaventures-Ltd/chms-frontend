'use client';

/**
 * AdminSidebar — role-aware sidebar for the admin layout (Day 10).
 *
 * Key features over the original Sidebar:
 *   - Active link highlighting based on current pathname
 *   - Finance item hidden for non-finance and non-admin roles
 *   - Role badge displayed on the user profile block
 *   - Logout button directly accessible in the sidebar
 *   - Keyboard-accessible collapse toggle
 */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  ChevronLeft, ChevronRight,
  User,
  LayoutDashboard, Users, CalendarCheck,
  CalendarDays, MessageSquare, Landmark,
  Settings, Circle, Home, Church, CreditCard, Newspaper,
} from 'lucide-react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { useChurchBranding } from '@/hooks/useChurchBranding';
import { cn, BLUR_PLACEHOLDER, isDataOrBlobUrl } from '@/lib/utils';
import type { SidebarItem } from '@/lib/site';

/** Nav items gated behind a superadmin feature flag — hidden when disabled. */
const HREF_FLAG: Record<string, string> = {
  '/communication': 'communication_channels',
  '/households': 'household_management',
};

type AdminSidebarProps = {
  items: SidebarItem[];
};

const NAV_ICONS: Record<string, React.ReactNode> = {
  '/dashboard':    <LayoutDashboard size={16} aria-hidden="true" />,
  '/members':       <Users           size={16} aria-hidden="true" />,
  '/households':    <Home            size={16} aria-hidden="true" />,
  '/attendance':    <CalendarCheck   size={16} aria-hidden="true" />,
  '/events':        <CalendarDays    size={16} aria-hidden="true" />,
  '/communication': <MessageSquare   size={16} aria-hidden="true" />,
  '/finance':       <Landmark        size={16} aria-hidden="true" />,
  '/billing':       <CreditCard      size={16} aria-hidden="true" />,
  '/bulletin':      <Newspaper       size={16} aria-hidden="true" />,
  '/settings':      <Settings        size={16} aria-hidden="true" />,
  '/onboarding':    <Church          size={16} aria-hidden="true" />,
};

/** Role display labels and color tokens */
const ROLE_META: Record<string, { label: string; color: string }> = {
  admin:           { label: 'Admin',          color: 'var(--accent)' },
  pastor:          { label: 'Pastor',         color: 'var(--accent-strong)' },
  finance:         { label: 'Finance',        color: '#2563eb' },
  ministry_leader: { label: 'Min. Leader',    color: '#7c3aed' },
  staff:           { label: 'Staff',          color: '#0891b2' },
  member:          { label: 'Member',         color: 'var(--muted)' },
};

export function AdminSidebar({ items }: AdminSidebarProps) {
  const currentUser = useCurrentUser();
  const pathname    = usePathname();
  const { enabled: enabledFlags, loading: flagsLoading } = useFeatureFlags();
  const { branding } = useChurchBranding();
  const [collapsed, setCollapsed] = useState(false);

  const visibleItems = items
    .filter((item) => (currentUser.loading ? true : item.roles.includes(currentUser.role)))
    .filter((item) => {
      const requiredFlag = HREF_FLAG[item.href];
      if (!requiredFlag || flagsLoading) return true;
      return enabledFlags.has(requiredFlag);
    });

  function isActive(href: string): boolean {
    return pathname === href || pathname.startsWith(href + '/');
  }

  const roleMeta = ROLE_META[currentUser.role] ?? ROLE_META.member;
  const displayName = currentUser.name || currentUser.email || 'Your account';

  const avatarContent = currentUser.avatarUrl && isDataOrBlobUrl(currentUser.avatarUrl) ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={currentUser.avatarUrl} alt={displayName} className="admin-sidebar__avatar-img" />
  ) : currentUser.avatarUrl ? (
    <Image
      src={currentUser.avatarUrl}
      alt={displayName}
      width={36}
      height={36}
      className="admin-sidebar__avatar-img"
      placeholder="blur"
      blurDataURL={BLUR_PLACEHOLDER}
    />
  ) : currentUser.initials ? (
    <>{currentUser.initials}</>
  ) : (
    <User size={18} aria-hidden="true" />
  );

  return (
    <aside
      className={cn('admin-sidebar', collapsed && 'admin-sidebar--collapsed')}
      aria-label="Main navigation"
    >
      {/* ── Brand ────────────────────────────────────────────────────── */}
      <div className="admin-sidebar__brand">
        {branding.logoUrl && isDataOrBlobUrl(branding.logoUrl) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={branding.logoUrl} alt="" className="admin-sidebar__brand-logo" />
        ) : branding.logoUrl ? (
          <Image
            src={branding.logoUrl}
            alt=""
            width={32}
            height={32}
            className="admin-sidebar__brand-logo"
            placeholder="blur"
            blurDataURL={BLUR_PLACEHOLDER}
            priority
          />
        ) : null}
        <div className="admin-sidebar__brand-copy">
          <p className="admin-sidebar__eyebrow">Church Management</p>
          <h2 className="admin-sidebar__title">Elevanda ChMS</h2>
        </div>
        <button
          type="button"
          className="admin-sidebar__collapse-btn"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
          onClick={() => setCollapsed((s) => !s)}
        >
          {collapsed
            ? <ChevronRight size={16} aria-hidden="true" />
            : <ChevronLeft  size={16} aria-hidden="true" />}
        </button>
      </div>

      {/* ── User profile — static display, no dropdown ───────────────── */}
      <div className="admin-sidebar__profile-static">
        <div className={cn(
          'admin-sidebar__avatar',
          currentUser.avatarUrl && 'admin-sidebar__avatar--photo',
        )}>
          {avatarContent}
        </div>
        {!collapsed && (
          <div className="admin-sidebar__profile-info">
            <span className="admin-sidebar__profile-name">{displayName}</span>
            <span className="admin-sidebar__role-badge" style={{ color: roleMeta.color }}>
              {roleMeta.label}
            </span>
          </div>
        )}
      </div>

      {/* ── Navigation ───────────────────────────────────────────────── */}
      <nav className="admin-sidebar__nav" aria-label="Site navigation">
        {visibleItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'admin-sidebar__nav-item',
                active && 'admin-sidebar__nav-item--active',
              )}
              aria-current={active ? 'page' : undefined}
            >
              <span className="admin-sidebar__nav-icon">
                {NAV_ICONS[item.href] ?? <Circle size={16} aria-hidden="true" />}
              </span>
              {!collapsed && (
                <span className="admin-sidebar__nav-label">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export default AdminSidebar;
