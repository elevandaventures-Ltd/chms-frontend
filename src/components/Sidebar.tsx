"use client";
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { SidebarItem, TeamMember } from '@/lib/site';

type SidebarProps = {
  user: TeamMember;
  items: SidebarItem[];
};

export function Sidebar({ user, items }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);

  const visibleItems = items.filter((i) => i.roles.includes(user.role));

  useEffect(() => {
    function handleDocumentClick(event: MouseEvent) {
      if (!profileRef.current) return;
      if (!profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setProfileOpen(false);
      }
    }

    document.addEventListener('mousedown', handleDocumentClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  function handleSignOut() {
    try {
      localStorage.removeItem('token');
    } catch {
      // Ignore storage errors in environments where localStorage is not available.
    }

    window.location.href = '/login';
  }

  async function handleCopyEmail() {
    try {
      await navigator.clipboard.writeText(`${user.name} · ${user.title}`);
    } catch {
      // Ignore clipboard failures; the menu still closes.
    }

    setProfileOpen(false);
  }

  return (
    <div className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
      <div className="sidebar__top">
        <div>
          <p className="sidebar__eyebrow">Workspace</p>
          <h3 className="sidebar__title">Elevanda Ventures</h3>
        </div>

        <button
          type="button"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={String(collapsed === false) as 'true' | 'false'}
          className="icon-button icon-button--ghost"
          data-collapsed={collapsed ? 'true' : 'false'}
          onClick={() => setCollapsed((s) => !s)}
        >
          {collapsed ? '➤' : '◂'}
        </button>
      </div>

      <div className="sidebar__profile-shell" ref={profileRef}>
        <button
          type="button"
          className="sidebar__profile"
          aria-haspopup="menu"
          aria-expanded={profileOpen}
          onClick={() => setProfileOpen((current) => !current)}
        >
          <div className="sidebar__avatar-wrap">
            <div className="sidebar__avatar">{user.initials}</div>
            <span className="sidebar__presence" aria-hidden="true" />
          </div>

          <div className="sidebar__profile-copy">
            <span className="sidebar__profile-name">{user.name}</span>
            <span className="sidebar__hint">{user.title}</span>
          </div>

          <span className="sidebar__profile-chevron" aria-hidden="true">
            ▾
          </span>
        </button>

        {profileOpen ? (
          <div className="sidebar__profile-menu" role="menu" aria-label="Account actions">
            <div className="sidebar__profile-meta">
              <strong>{user.name}</strong>
              <span>{user.title}</span>
              <span className="sidebar__profile-email">{user.name} • {user.initials}</span>
            </div>

            <div className="sidebar__profile-actions">
              <button type="button" className="sidebar__profile-action" role="menuitem" onClick={handleCopyEmail}>
                Copy account label
              </button>
              <Link className="sidebar__profile-action" role="menuitem" href="/signup" onClick={() => setProfileOpen(false)}>
                Create another account
              </Link>
              <button type="button" className="sidebar__profile-action sidebar__profile-action--danger" role="menuitem" onClick={handleSignOut}>
                Sign out
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <nav className="sidebar__nav" aria-label="Main navigation">
        {visibleItems.map((item) => (
          <a key={item.href} className="sidebar__link" href={item.href}>
            <span className="sidebar__icon">{item.icon}</span>
            <span className="sidebar__label">{item.label}</span>
          </a>
        ))}
      </nav>

      <div className="sidebar__footer">
        <p className="sidebar__hint">Collapsible</p>
        <p className="sidebar__hint-value">{collapsed ? 'Compact' : 'Expanded'}</p>
      </div>
    </div>
  );
}

export default Sidebar;
