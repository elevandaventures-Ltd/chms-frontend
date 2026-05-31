import React from 'react';
import type { TeamMember } from '@/lib/site';

type TopNavProps = {
  user: TeamMember;
  notificationCount?: number;
};

export function TopNav({ user, notificationCount = 0 }: TopNavProps) {
  return (
    <header className="topnav" role="banner">
      <div>
        <p className="topnav__eyebrow">Operations hub</p>
        <h1 className="topnav__title">Elevanda workspace shell</h1>
        <p className="lede">Track projects, team updates, and tasks from one responsive layout.</p>
      </div>

      <div className="topnav__actions">
        <button className="icon-button" aria-label="Notifications">
          🔔 <span className="topnav__badge">{notificationCount}</span>
        </button>

        <div className="topnav__avatar">{user.initials}</div>
      </div>
    </header>
  );
}

export default TopNav;
