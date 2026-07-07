'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, ChevronRight, User, Users, CalendarCheck, Church, Settings, LogOut, ChevronDown } from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { cn } from '@/lib/utils';

// ── Path → title mapping ──────────────────────────────────────────────────────

const PATH_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/dashboard':        { title: 'Dashboard',     subtitle: 'Church Management System' },
  '/members':          { title: 'Members',        subtitle: 'Manage your congregation' },
  '/households':       { title: 'Households',     subtitle: 'Family units and relationships' },
  '/attendance':       { title: 'Attendance',     subtitle: 'Track service attendance' },
  '/events':           { title: 'Events',         subtitle: 'Schedule and manage events' },
  '/communication':    { title: 'Communication',  subtitle: 'Email and SMS messaging' },
  '/finance':          { title: 'Finance',        subtitle: 'Giving records and reports' },
  '/settings':         { title: 'Settings',       subtitle: 'System configuration' },
  '/settings/profile': { title: 'Profile',        subtitle: 'Update your account details' },
  '/onboarding':       { title: 'Register Church', subtitle: 'Church registration wizard' },
};

function titlesFromPath(pathname: string) {
  if (PATH_TITLES[pathname]) return PATH_TITLES[pathname];
  const partial = Object.keys(PATH_TITLES)
    .filter((k) => k !== '/' && pathname.startsWith(k))
    .sort((a, b) => b.length - a.length)[0];
  return partial ? PATH_TITLES[partial] : { title: 'Dashboard', subtitle: 'Church Management System' };
}

// ── Notification type ─────────────────────────────────────────────────────────

type Notif = {
  id: string;
  icon: React.ReactNode;
  color: string;
  title: string;
  detail: string;
  time: string;
  unread: boolean;
  href?: string;
};

// ── Component ─────────────────────────────────────────────────────────────────

type AdminTopNavProps = {
  title?: string;
  subtitle?: string;
};

export function AdminTopNav({ title: titleProp, subtitle: subtitleProp }: AdminTopNavProps) {
  const currentUser = useCurrentUser();
  const pathname    = usePathname();
  const [open, setOpen]         = useState(false);
  const [userOpen, setUserOpen]  = useState(false);
  const [notifs, setNotifs]      = useState<Notif[]>([]);
  const [read, setRead]          = useState<Set<string>>(new Set());
  const [signingOut, setSigningOut] = useState(false);
  const menuRef    = useRef<HTMLDivElement | null>(null);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  const { title, subtitle } = useMemo(() => {
    const derived = titlesFromPath(pathname);
    return {
      title:    titleProp    ?? derived.title,
      subtitle: subtitleProp ?? derived.subtitle,
    };
  }, [pathname, titleProp, subtitleProp]);

  // Fetch real activity to populate notifications — only once per session.
  useEffect(() => {
    const CACHE_KEY = 'topnav_notifs_cache';
    const CACHE_TTL = 60_000; // 1 minute

    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const { ts, items } = JSON.parse(cached) as { ts: number; items: Notif[] };
        if (Date.now() - ts < CACHE_TTL) {
          setNotifs(items);
          return;
        }
      } catch { /* ignore */ }
    }

    async function load() {
      const items: Notif[] = [];
      try {
        const mRes = await fetch('/api/members?page=1&limit=3');
        const mJson = await mRes.json() as { members?: { fullName?: string; status?: string }[]; total?: number };
        const members = mJson.members ?? [];
        const total   = mJson.total ?? 0;

        if (total > 0) {
          items.push({
            id: 'members-total',
            icon: <Users size={13} />,
            color: 'var(--accent)',
            title: `${total} member${total !== 1 ? 's' : ''} in directory`,
            detail: members[0]?.fullName ? `Latest: ${members[0].fullName}` : 'View the member directory.',
            time: 'Now',
            unread: true,
            href: '/members',
          });
        }

        const visitors = members.filter((m) => m.status === 'visitor').length;
        if (visitors > 0) {
          items.push({
            id: 'visitors',
            icon: <Users size={13} />,
            color: '#d97706',
            title: `${visitors} visitor${visitors !== 1 ? 's' : ''} need follow-up`,
            detail: 'Reach out to recent visitors.',
            time: 'Today',
            unread: true,
            href: '/members?status=visitor',
          });
        }
      } catch { /* ignore */ }

      try {
        const aRes  = await fetch('/api/attendance/sessions');
        const aJson = await aRes.json() as { data?: { status?: string; sessionType?: string; checkinCount?: number }[] };
        const sessions = aJson.data ?? [];
        const active   = sessions.filter((s) => s.status === 'active');
        if (active.length > 0) {
          const s = active[0];
          items.push({
            id: 'active-session',
            icon: <CalendarCheck size={13} />,
            color: '#2563eb',
            title: `${s.sessionType ?? 'Session'} is live`,
            detail: `${s.checkinCount ?? 0} check-in${(s.checkinCount ?? 0) !== 1 ? 's' : ''} so far.`,
            time: 'Live',
            unread: true,
            href: '/attendance',
          });
        }
      } catch { /* ignore */ }

      items.push(
        {
          id: 'church-setup',
          icon: <Church size={13} />,
          color: 'var(--accent-strong)',
          title: 'Complete church setup',
          detail: 'Register your church details in the onboarding wizard.',
          time: '1d ago',
          unread: false,
          href: '/onboarding',
        },
        {
          id: 'settings-tip',
          icon: <Settings size={13} />,
          color: 'var(--muted)',
          title: 'Configure your workspace',
          detail: 'Set up roles, integrations, and notification preferences.',
          time: '2d ago',
          unread: false,
          href: '/settings',
        },
      );

      setNotifs(items);
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), items }));
    }
    void load();
  }, []);

  const unreadCount = notifs.filter((n) => n.unread && !read.has(n.id)).length;

  function markAllRead() {
    setRead(new Set(notifs.map((n) => n.id)));
  }

  async function handleSignOut() {
    setSigningOut(true);
    try {
      const sb = getSupabaseBrowserClient();
      if (sb) await sb.auth.signOut();
      localStorage.removeItem('token');
    } catch { /* ignore */ }
    window.location.href = '/login';
  }

  // Close on outside click / Escape
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserOpen(false);
    }
    function onEsc(e: KeyboardEvent) { if (e.key === 'Escape') { setOpen(false); setUserOpen(false); } }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, []);

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
      {/* Left — fixed brand */}
      <div className="admin-topnav__brand">
        <h1 className="admin-topnav__title">Dashboard</h1>
        <p className="admin-topnav__subtitle">Church Management System</p>
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
                {unreadCount > 0 && (
                  <button type="button" className="admin-topnav__notif-clear" onClick={markAllRead}>
                    Mark all read
                  </button>
                )}
              </div>

              <div className="admin-topnav__notif-list">
                {notifs.length > 0 ? notifs.map((n) => {
                  const isUnread = n.unread && !read.has(n.id);
                  const inner = (
                    <>
                      <span
                        className="admin-topnav__notif-dot"
                        style={{ background: `${n.color}22`, color: n.color }}
                        aria-hidden="true"
                      >
                        {n.icon}
                      </span>
                      <span className="admin-topnav__notif-copy">
                        <strong>{n.title}</strong>
                        <span>{n.detail}</span>
                        <span className="admin-topnav__notif-time">{n.time}</span>
                      </span>
                      {isUnread && <span className="admin-topnav__notif-unread-dot" aria-hidden="true" />}
                    </>
                  );
                  return n.href ? (
                    <Link
                      key={n.id}
                      href={n.href}
                      role="menuitem"
                      className={cn('admin-topnav__notif-item', isUnread && 'admin-topnav__notif-item--unread')}
                      onClick={() => { setRead((r) => new Set([...r, n.id])); setOpen(false); }}
                    >
                      {inner}
                    </Link>
                  ) : (
                    <div key={n.id} role="menuitem" className={cn('admin-topnav__notif-item', isUnread && 'admin-topnav__notif-item--unread')}>
                      {inner}
                    </div>
                  );
                }) : (
                  <div className="admin-topnav__notif-empty">
                    <strong>All caught up</strong>
                    <span>No new notifications.</span>
                  </div>
                )}
              </div>

              <Link className="admin-topnav__notif-footer" href="/dashboard" onClick={() => setOpen(false)}>
                Go to dashboard <ChevronRight size={13} aria-hidden="true" />
              </Link>
            </div>
          )}
        </div>

        {/* User menu */}
        <div className="admin-topnav__user-menu-shell" ref={userMenuRef}>
          <button
            type="button"
            className="admin-topnav__user-btn"
            aria-haspopup="menu"
            aria-expanded={userOpen}
            onClick={() => setUserOpen((v) => !v)}
            title={avatarLabel}
          >
            <div className={cn('admin-topnav__avatar', currentUser.avatarUrl && 'admin-topnav__avatar--photo')}>
              {avatarContent}
            </div>
            <span className="admin-topnav__user-name">{currentUser.name || currentUser.email?.split('@')[0] || 'Account'}</span>
            <ChevronDown size={13} className={cn('admin-topnav__user-chevron', userOpen && 'admin-topnav__user-chevron--open')} aria-hidden="true" />
          </button>

          {userOpen && (
            <div className="admin-topnav__user-dropdown" role="menu" aria-label="Account menu">
              {/* Current page context */}
              <div className="admin-topnav__user-page-ctx">
                <span className="admin-topnav__user-page-title">{title}</span>
                {subtitle && <span className="admin-topnav__user-page-sub">{subtitle}</span>}
              </div>

              <div className="admin-topnav__user-divider" />

              {/* User info header */}
              <div className="admin-topnav__user-header">
                <div className={cn('admin-topnav__user-avatar-lg', currentUser.avatarUrl && 'admin-topnav__avatar--photo')}>
                  {avatarContent}
                </div>
                <div className="admin-topnav__user-info">
                  <strong>{avatarLabel}</strong>
                  {currentUser.email && <span>{currentUser.email}</span>}
                </div>
              </div>

              <div className="admin-topnav__user-divider" />

              <Link
                href="/settings/profile"
                role="menuitem"
                className="admin-topnav__user-item"
                onClick={() => setUserOpen(false)}
              >
                <User size={14} aria-hidden="true" />
                <span>Profile settings</span>
              </Link>

              <div className="admin-topnav__user-divider" />

              <button
                type="button"
                role="menuitem"
                className="admin-topnav__user-signout"
                onClick={handleSignOut}
                disabled={signingOut}
              >
                <LogOut size={14} aria-hidden="true" />
                <span>{signingOut ? 'Signing out…' : 'Sign out'}</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}

export default AdminTopNav;
