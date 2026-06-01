"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import type { NotificationItem, TeamMember } from '@/lib/site';

type TopNavProps = {
  user: TeamMember;
  notifications?: NotificationItem[];
};

export function TopNav({ user, notifications = [] }: TopNavProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => notification.unread).length,
    [notifications],
  );

  useEffect(() => {
    function handleDocumentClick(event: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleDocumentClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <header className="topnav" role="banner">
      <div>
        <p className="topnav__eyebrow">Operations hub</p>
        <h1 className="topnav__title">Elevanda workspace shell</h1>
        <p className="lede">Track projects, team updates, and tasks from one responsive layout.</p>
      </div>

      <div className="topnav__actions">
        <Link className="topnav__link" href="/login">
          Login
        </Link>

        <div className="topnav__notifications" ref={menuRef}>
          <button
            className="icon-button icon-button--ghost topnav__notification-button"
            aria-label={`${unreadCount} unread notifications`}
            aria-haspopup="menu"
            aria-expanded={open}
            onClick={() => setOpen((current) => !current)}
          >
            <span className="topnav__bell" aria-hidden="true">
              🔔
            </span>
            <span className="topnav__badge">{unreadCount}</span>
          </button>

          {open ? (
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
                  notifications.map((notification) => (
                    <button
                      key={`${notification.title}-${notification.time}`}
                      className={`topnav__notification-item ${notification.unread ? 'topnav__notification-item--unread' : ''}`}
                      type="button"
                      role="menuitem"
                      onClick={() => setOpen(false)}
                    >
                      <span className="topnav__notification-dot" aria-hidden="true" />
                      <span className="topnav__notification-copy">
                        <strong>{notification.title}</strong>
                        <span>{notification.detail}</span>
                        <span className="topnav__notification-time">{notification.time}</span>
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

              <Link className="topnav__notifications-link" href="#overview" onClick={() => setOpen(false)}>
                View workspace updates
              </Link>
            </div>
          ) : null}
        </div>

        <div className="topnav__avatar">{user.initials}</div>
      </div>
    </header>
  );
}

export default TopNav;
