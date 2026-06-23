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
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronLeft, ChevronRight, ChevronDown,
  LogOut, User, UserPlus, Copy, PlusCircle,
  LayoutDashboard, Users, CalendarCheck,
  CalendarDays, MessageSquare, Landmark,
  Settings, Circle, Home,
} from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { cn } from '@/lib/utils';
import type { SidebarItem } from '@/lib/site';

type AdminSidebarProps = {
  items: SidebarItem[];
};

const NAV_ICONS: Record<string, React.ReactNode> = {
  '/':              <LayoutDashboard size={16} aria-hidden="true" />,
  '/members':       <Users           size={16} aria-hidden="true" />,
  '/households':    <Home            size={16} aria-hidden="true" />,
  '/attendance':    <CalendarCheck   size={16} aria-hidden="true" />,
  '/events':        <CalendarDays    size={16} aria-hidden="true" />,
  '/communication': <MessageSquare   size={16} aria-hidden="true" />,
  '/finance':       <Landmark        size={16} aria-hidden="true" />,
  '/settings':      <Settings        size={16} aria-hidden="true" />,
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
  const currentUser  = useCurrentUser();
  const pathname     = usePathname();
  const [collapsed, setCollapsed]     = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);

  // Filter by role — Finance is only visible to admin and finance roles
  const visibleItems = currentUser.loading
    ? []
    : items.filter((item) => item.roles.includes(currentUser.role));

  // Close profile menu on outside click / Escape
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setProfileOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, []);

  async function handleSignOut() {
    try {
      const sb = getSupabaseBrowserClient();
      if (sb) await sb.auth.signOut();
      localStorage.removeItem('token');
    } catch { /* ignore */ }
    window.location.href = '/login';
  }

  async function handleCopyLabel() {
    const label = currentUser.name || currentUser.email;
    try { await navigator.clipboard.writeText(label); } catch { /* ignore */ }
    setProfileOpen(false);
  }

  function isActive(href: string): boolean {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(href + '/');
  }

  const roleMeta = ROLE_META[currentUser.role] ?? ROLE_META.member;
  const displayName = currentUser.name || currentUser.email || 'Your account';

  const avatarContent = currentUser.avatarUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={currentUser.avatarUrl} alt={displayName} className="admin-sidebar__avatar-img" />
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

      {/* ── User profile ─────────────────────────────────────────────── */}
      <div className="admin-sidebar__profile-shell" ref={profileRef}>
        <button
          type="button"
          className="admin-sidebar__profile-btn"
          aria-haspopup="menu"
          aria-expanded={profileOpen}
          onClick={() => setProfileOpen((v) => !v)}
        >
          <div className={cn(
            'admin-sidebar__avatar',
            currentUser.avatarUrl && 'admin-sidebar__avatar--photo',
          )}>
            {avatarContent}
          </div>

          {!collapsed && (
            <div className="admin-sidebar__profile-info">
              <span className="admin-sidebar__profile-name">{displayName}</span>
              <span
                className="admin-sidebar__role-badge"
                style={{ color: roleMeta.color }}
              >
                {roleMeta.label}
              </span>
            </div>
          )}

          {!collapsed && (
            <ChevronDown size={14} className="admin-sidebar__chevron" aria-hidden="true" />
          )}
        </button>

        {profileOpen && (
          <div className="admin-sidebar__profile-menu" role="menu" aria-label="Account actions">
            <div className="admin-sidebar__profile-meta">
              <strong>{displayName}</strong>
              {currentUser.email && displayName !== currentUser.email && (
                <span>{currentUser.email}</span>
              )}
              <span
                className="admin-sidebar__role-badge"
                style={{ color: roleMeta.color, fontSize: '0.8rem' }}
              >
                {roleMeta.label}
              </span>
            </div>

            <div className="admin-sidebar__profile-actions">
              <Link
                className="admin-sidebar__menu-item"
                href="/settings/profile"
                role="menuitem"
                onClick={() => setProfileOpen(false)}
              >
                <User size={14} aria-hidden="true" /> Profile settings
              </Link>
              <button
                type="button"
                className="admin-sidebar__menu-item"
                role="menuitem"
                onClick={handleCopyLabel}
              >
                <Copy size={14} aria-hidden="true" /> Copy account label
              </button>
              <Link
                className="admin-sidebar__menu-item"
                href="/onboarding"
                role="menuitem"
                onClick={() => setProfileOpen(false)}
              >
                <PlusCircle size={14} aria-hidden="true" /> Register a church
              </Link>
              <Link
                className="admin-sidebar__menu-item"
                href="/signup"
                role="menuitem"
                onClick={() => setProfileOpen(false)}
              >
                <UserPlus size={14} aria-hidden="true" /> Create another account
              </Link>
              <button
                type="button"
                className="admin-sidebar__menu-item admin-sidebar__menu-item--danger"
                role="menuitem"
                onClick={handleSignOut}
              >
                <LogOut size={14} aria-hidden="true" /> Sign out
              </button>
            </div>
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
              {/* Finance indicator for finance/admin roles */}
              {item.href === '/finance' && !collapsed && (
                <span className="admin-sidebar__nav-badge" aria-label="Finance access">
                  Finance
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Sign out shortcut ─────────────────────────────────────────── */}
      <div className="admin-sidebar__footer">
        <button
          type="button"
          className="admin-sidebar__signout-btn"
          onClick={handleSignOut}
          aria-label="Sign out"
          title="Sign out"
        >
          <LogOut size={16} aria-hidden="true" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;
