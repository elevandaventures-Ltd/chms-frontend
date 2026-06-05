'use client';

/**
 * AdminTopNav — top navigation bar for the admin layout (Day 10).
 *
 * - Auto-derives page title + subtitle from the current pathname
 * - Notifications bell with unread badge + dropdown panel
 * - User avatar (photo → initials → icon) linking to /settings/profile
 * - Logout button directly in the top bar
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, ChevronRight, LogOut, User } from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { cn } from '@/lib/utils';
import type { NotificationItem } from '@/lib/site';

// ── Path → title mapping ──────────────────────────────────────────────────────

const PATH_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/':              { title: 'Dashboard',     subtitle: 'Church Management System' },
  '/members':       { title: 'Members',       subtitle: 'Manage your congregation' },
  '/attendance':    { title: 'Attendance',    subtitle: 'Track service attendance' },
  '/events':        { title: 'Events',        subtitle: 'Schedule and manage events' },
  '/communication': { title: 'Communication', subtitle: 'Email and SMS messaging' },
  '/finance':       { title: 'Finance',       subtitle: 'Giving records and reports' },
  '/settings':      { title: 'Settings',      subtitle: 'System configuration' },
  '/settings/profile': { title: 'Profile',   subtitle: 'Update your account details' },
};

function titlesFromPath(pathname: string) {
  if (PATH_TITLES[pathname]) return PATH_TITLES[pathname];
  const partial = Object.keys(PATH_TITLES)
    .filter((k) => k !== '/' && pathname.startsWith(k))
    .sort((a, b) => b.length - a.length)[0];
  return partial ? PATH_TITLES[partial] : { title: 'Dashboard', subtitle: 'Church Management System' };
}

// ── Component ─────────────────────────────────────────────────────────────────

type AdminTopNavProps = {
  title?: string;
  subtitle?: string;
  notifications?: NotificationItem[];
};

export function AdminTopNav({
  title: titleProp,
  subtitle: subtitleProp,
  notifications = [],
}: AdminTopNavProps) {
  const currentUser = useCurrentUser();
  const pathname    = usePathname();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const { title, subtitle } = useMemo(() => {
    const derived = titlesFromPath(pathname);
    return {
      title:    titleProp    ?? derived.title,
      subtitle: subtitleProp ?? derived.subtitle,
    };
  }, [pathname, titleProp, subtitleProp]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => n.unread).length,
    [notifications],
  );

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
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

  const avatarContent = currentUser.loading ? null
    : currentUser.avatarUrl
      // eslint-disable-next-line @next/next/no-img-element
      ? <img src={currentUser.avatarUrl} alt={currentUser.name || currentUser.email} className="admin-topnav__avatar-img" />
      : currentUser.initials
        ? <span>{currentUser.initials}</span>
        : <User size={18} aria-hidden="true" />;

  const avatarLabel = currentUser.name || currentUser.email || 'Account';

  return (
    <header className="admin-topnav" role="banner">
      {/* Left — page title */}
      <div className="admin-topnav__brand">
        <h1 className="admin-topnav__title">{title}</h1>
        {subtitle && <p className="admin-topnav__subtitle">{subtitle}</p>}
      </div>

      {/* Right — actions */}
      <div className="admin-topnav__actions">

        {/* Notifications bell */}
        <div className="admin-topnav__notifications" ref={menuRef}>
          <button
            type="button"
            className="admin-topnav__icon-btn"
            aria-label={`${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
            aria-haspopup="menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <Bell size={18} aria-hidden="true" />
            {unreadCount > 0 && (
              <span className="admin-topnav__badge" aria-hidden="true">{unreadCount}</span>
            )}
          </button>

          {open && (
            <div className="admin-topnav__notif-panel" role="menu" aria-label="Notifications">
              <div className="admin-topnav__notif-header">
                <strong>Notifications</strong>
                <button type="button" className="admin-topnav__notif-clear" onClick={() => setOpen(false)}>
                  Mark all read
                </button>
              </div>

              <div className="admin-topnav__notif-list">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <button
                      key={`${n.title}-${n.time}`}
                      type="button"
                      role="menuitem"
                      className={cn('admin-topnav__notif-item', n.unread && 'admin-topnav__notif-item--unread')}
                      onClick={() => setOpen(false)}
                    >
                      <span className="admin-topnav__notif-dot" aria-hidden="true" />
                      <span className="admin-topnav__notif-copy">
                        <strong>{n.title}</strong>
                        <span>{n.detail}</span>
                        <span className="admin-topnav__notif-time">{n.time}</span>
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="admin-topnav__notif-empty">
                    <strong>All caught up</strong>
                    <span>No new notifications.</span>
                  </div>
                )}
              </div>

              <Link className="admin-topnav__notif-footer" href="/" onClick={() => setOpen(false)}>
                View all updates <ChevronRight size={13} aria-hidden="true" />
              </Link>
            </div>
          )}
        </div>

        {/* Avatar → profile settings */}
        <Link
          href="/settings/profile"
          className={cn('admin-topnav__avatar', currentUser.avatarUrl && 'admin-topnav__avatar--photo')}
          aria-label={`${avatarLabel} — profile settings`}
          title={avatarLabel}
        >
          {avatarContent}
        </Link>

        {/* Logout button */}
        <button
          type="button"
          className="admin-topnav__logout-btn"
          onClick={handleSignOut}
          aria-label="Sign out"
          title="Sign out"
        >
          <LogOut size={16} aria-hidden="true" />
          <span className="admin-topnav__logout-label">Sign out</span>
        </button>

      </div>
    </header>
  );
}

export default AdminTopNav;
