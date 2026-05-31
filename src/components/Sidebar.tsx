"use client";
import React, { useState } from 'react';
import type { SidebarItem, TeamMember } from '@/lib/site';

type SidebarProps = {
  user: TeamMember;
  items: SidebarItem[];
};

export function Sidebar({ user, items }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const visibleItems = items.filter((i) => i.roles.includes(user.role));

  return (
    <div className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
      <div className="sidebar__top">
        <div>
          <p className="sidebar__eyebrow">Workspace</p>
          <h3 className="sidebar__title">Elevanda Ventures</h3>
        </div>

        <button
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-pressed={collapsed ? 'true' : 'false'}
          className="icon-button icon-button--ghost"
          data-collapsed={collapsed ? 'true' : 'false'}
          onClick={() => setCollapsed((s) => !s)}
        >
          {collapsed ? '➤' : '◂'}
        </button>
      </div>

      <div className="sidebar__profile">
        <div className="sidebar__avatar">{user.initials}</div>
        <div className="sidebar__profile-copy">
          <span>{user.name}</span>
          <span className="sidebar__hint">{user.title}</span>
        </div>
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
