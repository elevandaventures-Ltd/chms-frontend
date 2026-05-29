'use client';

import { useState } from 'react';
import type { SidebarItem, TeamMember, UserRole } from '@/lib/site';

type SidebarProps = {
  user: TeamMember;
  items: SidebarItem[];
  activeHref?: string;
};

function canSee(item: SidebarItem, role: UserRole) {
  return item.roles.includes(role);
}

export function Sidebar({ user, items, activeHref }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const visible = items.filter((item) => canSee(item, user.role));

  return (
    <aside
      className={`sidebar${collapsed ? ' sidebar--collapsed' : ''}`}
      aria-label="Main navigation"
    >
      <div className="sidebar__top">
        <div>
          <p className="sidebar__eyebrow">CHMS</p>
          <p className="sidebar__title">Dashboard</p>
        </div>
        <button
          className="icon-button icon-button--ghost"
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          type="button"
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      <div className="sidebar__profile">
        <span className="sidebar__avatar" aria-hidden="true">
          {user.initials}
        </span>
        <div className="sidebar__profile-copy">
          <strong>{user.name}</strong>
          <span>{user.title}</span>
        </div>
      </div>

      <nav className="sidebar__nav" aria-label="Sidebar links">
        {visible.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="sidebar__link"
            aria-current={activeHref === item.href ? 'page' : undefined}
          >
            <span className="sidebar__icon" aria-hidden="true">
              {item.icon}
            </span>
            <span>{item.label}</span>
          </a>
        ))}
      </nav>

      <div className="sidebar__footer">
        <p className="sidebar__hint">Role</p>
        <p className="sidebar__hint-value">{user.role}</p>
      </div>
    </aside>
  );
}
