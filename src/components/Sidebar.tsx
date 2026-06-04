"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogOut,
  UserPlus,
  Copy,
  PlusCircle,
  LogIn,
  LayoutDashboard,
  Users,
  CalendarCheck,
  CalendarDays,
  MessageSquare,
  Landmark,
  Settings,
  Circle,
} from 'lucide-react';
import type { SidebarItem, TeamMember } from '@/lib/site';

type SidebarProps = {
  user: TeamMember;
  items: SidebarItem[];
};

// Map icon strings from site.ts to Lucide components
const NAV_ICONS: Record<string, React.ReactNode> = {
  '/':             <LayoutDashboard size={16} aria-hidden="true" />,
  '/members':      <Users           size={16} aria-hidden="true" />,
  '/attendance':   <CalendarCheck   size={16} aria-hidden="true" />,
  '/events':       <CalendarDays    size={16} aria-hidden="true" />,
  '/communication':<MessageSquare   size={16} aria-hidden="true" />,
  '/finance':      <Landmark        size={16} aria-hidden="true" />,
  '/settings':     <Settings        size={16} aria-hidden="true" />,
};

export function Sidebar({ user, items }: SidebarProps) {
  const [collapsed, setCollapsed]     = useState(false);
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

      {/* Brand */}
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
          {collapsed
            ? <ChevronRight size={16} aria-hidden="true" />
            : <ChevronLeft  size={16} aria-hidden="true" />}
        </button>
      </div>

      {/* User profile */}
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
          <ChevronDown size={14} className="sidebar__profile-chevron" aria-hidden="true" />
        </button>

        {profileOpen && (
          <div className="sidebar__profile-menu" role="menu" aria-label="Account actions">
            <div className="sidebar__profile-meta">
              <strong>{user.name}</strong>
              <span>{user.title}</span>
            </div>
            <div className="sidebar__profile-actions">
              <button type="button" className="sidebar__profile-action" role="menuitem" onClick={handleCopyLabel}>
                <Copy size={14} aria-hidden="true" /> Copy account label
              </button>
              <Link className="sidebar__profile-action" role="menuitem" href="/onboarding" onClick={() => setProfileOpen(false)}>
                <PlusCircle size={14} aria-hidden="true" /> Register a church
              </Link>
              <Link className="sidebar__profile-action" role="menuitem" href="/signup" onClick={() => setProfileOpen(false)}>
                <UserPlus size={14} aria-hidden="true" /> Create another account
              </Link>
              <button type="button" className="sidebar__profile-action sidebar__profile-action--danger" role="menuitem" onClick={handleSignOut}>
                <LogOut size={14} aria-hidden="true" /> Sign out
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="sidebar__nav" aria-label="Main navigation">
        {visibleItems.map((item) => (
          <a key={item.href} className="sidebar__link" href={item.href}>
            <span className="sidebar__icon">
              {NAV_ICONS[item.href] ?? <Circle size={14} aria-hidden="true" />}
            </span>
            <span className="sidebar__label">{item.label}</span>
          </a>
        ))}
      </nav>

      {/* Quick actions */}
      <div className="sidebar__quick">
        <Link className="sidebar__quick-link" href="/onboarding">
          <span className="sidebar__icon"><PlusCircle size={14} aria-hidden="true" /></span>
          <span className="sidebar__label">Register church</span>
        </Link>
        <Link className="sidebar__quick-link" href="/login">
          <span className="sidebar__icon"><LogIn size={14} aria-hidden="true" /></span>
          <span className="sidebar__label">Sign in</span>
        </Link>
      </div>

      {/* Footer */}
      <div className="sidebar__footer">
        <p className="sidebar__hint">Role</p>
        <p className="sidebar__hint-value">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
      </div>

    </div>
  );
}

export default Sidebar;
