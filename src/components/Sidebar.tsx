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
      if (!profileRef.current.contains(event.target as Node)) setProfileOpen(false);
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setProfileOpen(false);
    }
    document.addEventListener('mousedown', handleDocumentClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  function handleSignOut() {
    try { localStorage.removeItem('token'); } catch { /* ignore */ }
    window.location.href = '/login';
  }

  async function handleCopyLabel() {
    try { await navigator.clipboard.writeText(`${user.name} · ${user.title}`); } catch { /* ignore */ }
    setProfileOpen(false);
  }

  return (
    <div className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>

      {/* ── Brand ── */}
      <div className="sidebar__top">
        <div>
          <p className="sidebar__eyebrow">Workspace</p>
          <h3 className="sidebar__title">Elevanda Ventures</h3>
        </div>
        <button
          type="button"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
          className="icon-button icon-button--ghost"
          onClick={() => setCollapsed((s) => !s)}
        >
          {collapsed ? '➤' : '◂'}
        </button>
      </div>

      {/* ── User profile ── */}
      <div className="sidebar__profile-shell" ref={profileRef}>
        <button
          type="button"
          className="sidebar__profile"
          aria-haspopup="menu"
          aria-expanded={profileOpen}
          onClick={() => setProfileOpen((c) => !c)}
        >
          <div className="sidebar__avatar-wrap">
            <div className="sidebar__avatar">{user.initials}</div>
            <span className="sidebar__presence" aria-hidden="true" />
          </div>
          <div className="sidebar__profile-copy">
            <span className="sidebar__profile-name">{user.name}</span>
            <span className="sidebar__hint">{user.title}</span>
          </div>
          <span className="sidebar__profile-chevron" aria-hidden="true">▾</span>
        </button>

        {profileOpen && (
          <div className="sidebar__profile-menu" role="menu" aria-label="Account actions">
            <div className="sidebar__profile-meta">
              <strong>{user.name}</strong>
              <span>{user.title}</span>
            </div>
            <div className="sidebar__profile-actions">
              <button
                type="button"
                className="sidebar__profile-action"
                role="menuitem"
                onClick={handleCopyLabel}
              >
                Copy account label
              </button>
              <Link
                className="sidebar__profile-action"
                role="menuitem"
                href="/onboarding"
                onClick={() => setProfileOpen(false)}
              >
                Register a church
              </Link>
              <Link
                className="sidebar__profile-action"
                role="menuitem"
                href="/signup"
                onClick={() => setProfileOpen(false)}
              >
                Create another account
              </Link>
              <button
                type="button"
                className="sidebar__profile-action sidebar__profile-action--danger"
                role="menuitem"
                onClick={handleSignOut}
              >
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className="sidebar__nav" aria-label="Main navigation">
        {visibleItems.map((item) => (
          <a key={item.href} className="sidebar__link" href={item.href}>
            <span className="sidebar__icon">{item.icon}</span>
            <span className="sidebar__label">{item.label}</span>
          </a>
        ))}
      </nav>

      {/* ── Quick actions ── */}
      <div className="sidebar__quick">
        <Link className="sidebar__quick-link" href="/onboarding">
          <span className="sidebar__icon" aria-hidden="true">＋</span>
          <span className="sidebar__label">Register church</span>
        </Link>
        <Link className="sidebar__quick-link" href="/login">
          <span className="sidebar__icon" aria-hidden="true">→</span>
          <span className="sidebar__label">Sign in</span>
        </Link>
      </div>

      {/* ── Footer ── */}
      <div className="sidebar__footer">
        <p className="sidebar__hint">Role</p>
        <p className="sidebar__hint-value">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
      </div>

    </div>
  );
}

export default Sidebar;
