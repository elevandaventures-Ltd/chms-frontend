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
  User,
} from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import type { SidebarItem } from '@/lib/site';

type SidebarProps = {
  items: SidebarItem[];
};

const NAV_ICONS: Record<string, React.ReactNode> = {
  '/':              <LayoutDashboard size={16} aria-hidden="true" />,
  '/members':       <Users           size={16} aria-hidden="true" />,
  '/attendance':    <CalendarCheck   size={16} aria-hidden="true" />,
  '/events':        <CalendarDays    size={16} aria-hidden="true" />,
  '/communication': <MessageSquare   size={16} aria-hidden="true" />,
  '/finance':       <Landmark        size={16} aria-hidden="true" />,
  '/settings':      <Settings        size={16} aria-hidden="true" />,
};

export function Sidebar({ items }: SidebarProps) {
  const currentUser = useCurrentUser();
  const [collapsed, setCollapsed]     = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);

  // Filter nav items by the real user's role from Supabase session
  const visibleItems = currentUser.loading
    ? []
    : items.filter((i) => i.roles.includes(currentUser.role));

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

  // Avatar in sidebar — photo, initials, or generic icon
  const avatarContent = currentUser.avatarUrl ? (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={currentUser.avatarUrl}
      alt={currentUser.name || currentUser.email}
      className="sidebar__avatar-img"
    />
  ) : currentUser.initials ? (
    <>{currentUser.initials}</>
  ) : (
    <User size={18} aria-hidden="true" />
  );

  const displayName  = currentUser.name  || currentUser.email || 'Your account';
  const displayTitle = currentUser.role
    ? currentUser.role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : '';

  return (
    <div className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>

      {/* Brand */}
      <div className="sidebar__top">
        <div>
          <p className="sidebar__eyebrow">Workspace</p>
          <h3 className="sidebar__title">Elevanda ChMS</h3>
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
            <div className={`sidebar__avatar${currentUser.avatarUrl ? ' sidebar__avatar--photo' : ''}`}>
              {avatarContent}
            </div>
            {!currentUser.loading && (
              <span className="sidebar__presence" aria-hidden="true" />
            )}
          </div>
          <div className="sidebar__profile-copy">
            <span className="sidebar__profile-name">{displayName}</span>
            {displayTitle && <span className="sidebar__hint">{displayTitle}</span>}
          </div>
          <ChevronDown size={14} className="sidebar__profile-chevron" aria-hidden="true" />
        </button>

        {profileOpen && (
          <div className="sidebar__profile-menu" role="menu" aria-label="Account actions">
            <div className="sidebar__profile-meta">
              <strong>{displayName}</strong>
              {currentUser.email && displayName !== currentUser.email && (
                <span className="sidebar__profile-email">{currentUser.email}</span>
              )}
            </div>
            <div className="sidebar__profile-actions">
              <Link className="sidebar__profile-action" role="menuitem" href="/settings/profile" onClick={() => setProfileOpen(false)}>
                <User size={14} aria-hidden="true" /> Profile settings
              </Link>
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
      {!currentUser.loading && (
        <div className="sidebar__footer">
          <p className="sidebar__hint">Role</p>
          <p className="sidebar__hint-value">{displayTitle || 'Member'}</p>
        </div>
      )}
    </div>
  );
}

export default Sidebar;
