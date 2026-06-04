"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Bell, PlusCircle, ChevronRight, User } from 'lucide-react';
import type { NotificationItem } from '@/lib/site';
import { useCurrentUser } from '@/hooks/useCurrentUser';

type TopNavProps = {
  notifications?: NotificationItem[];
  title?: string;
  subtitle?: string;
};

export function TopNav({
  notifications = [],
  title = 'Dashboard',
  subtitle = 'Church Management System',
}: TopNavProps) {
  const currentUser = useCurrentUser();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const unreadCount = useMemo(
    () => notifications.filter((n) => n.unread).length,
    [notifications],
  );

  useEffect(() => {
    function handleDocumentClick(event: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) setOpen(false);
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleDocumentClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  // Determine what to render inside the avatar circle
  const avatarContent = currentUser.loading ? null : currentUser.avatarUrl ? (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={currentUser.avatarUrl}
      alt={currentUser.name || currentUser.email}
      className="topnav__avatar-img"
    />
  ) : currentUser.initials ? (
    <span>{currentUser.initials}</span>
  ) : (
    <User size={18} aria-hidden="true" />
  );

  const avatarLabel = currentUser.name || currentUser.email || 'Account';

  return (
    <header className="topnav" role="banner">
      {/* Left — title block */}
      <div className="topnav__brand">
        <p className="topnav__eyebrow">Elevanda ChMS</p>
        <h1 className="topnav__title">{title}</h1>
        <p className="topnav__subtitle">{subtitle}</p>
      </div>

      {/* Right — actions */}
      <div className="topnav__actions">
        <Link className="topnav__link topnav__link--primary" href="/onboarding">
          <PlusCircle size={15} aria-hidden="true" />
          Register church
        </Link>

        {/* Notifications */}
        <div className="topnav__notifications" ref={menuRef}>
          <button
            className="icon-button icon-button--ghost topnav__notification-button"
            aria-label={`${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
            aria-haspopup="menu"
            aria-expanded={open}
            onClick={() => setOpen((c) => !c)}
          >
            <Bell size={18} aria-hidden="true" />
            {unreadCount > 0 && (
              <span className="topnav__badge" aria-hidden="true">{unreadCount}</span>
            )}
          </button>

          {open && (
            <div className="topnav__notifications-panel" role="menu" aria-label="Notifications">
              <div className="topnav__notifications-header">
                <div>
                  <p className="topnav__notifications-kicker">Notifications</p>
                  <h2 className="topnav__notifications-title">Recent activity</h2>
                </div>
                <button
                  className="topnav__notifications-action"
                  type="button"
                  onClick={() => setOpen(false)}
                >
                  Mark all read
                </button>
              </div>

              <div className="topnav__notifications-list">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <button
                      key={`${n.title}-${n.time}`}
                      className={`topnav__notification-item ${n.unread ? 'topnav__notification-item--unread' : ''}`}
                      type="button"
                      role="menuitem"
                      onClick={() => setOpen(false)}
                    >
                      <span className="topnav__notification-dot" aria-hidden="true" />
                      <span className="topnav__notification-copy">
                        <strong>{n.title}</strong>
                        <span>{n.detail}</span>
                        <span className="topnav__notification-time">{n.time}</span>
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="topnav__notifications-empty">
                    <strong>All caught up</strong>
                    <span>No new notifications right now.</span>
                  </div>
                )}
              </div>

              <Link
                className="topnav__notifications-link"
                href="/"
                onClick={() => setOpen(false)}
              >
                View all updates
                <ChevronRight size={14} aria-hidden="true" />
              </Link>
            </div>
          )}
        </div>

        {/* Avatar — shows real photo, initials, or generic icon */}
        <Link
          href="/settings/profile"
          className={`topnav__avatar${currentUser.avatarUrl ? ' topnav__avatar--photo' : ''}`}
          aria-label={`${avatarLabel} — profile settings`}
          title={avatarLabel}
        >
          {avatarContent}
        </Link>
      </div>
    </header>
  );
}

export default TopNav;
