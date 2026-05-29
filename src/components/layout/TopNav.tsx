'use client';

import { useState } from 'react';
import type { TeamMember } from '@/lib/site';

type TopNavProps = {
  title: string;
  user: TeamMember;
  notificationCount?: number;
};

export function TopNav({ title, user, notificationCount = 0 }: TopNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <nav className="topnav" aria-label="Top navigation">
      <div>
        <p className="topnav__eyebrow">CHMS</p>
        <h1 className="topnav__title">{title}</h1>
      </div>

      <div className="topnav__actions">
        <button
          className="icon-button icon-button--ghost"
          aria-label={`${notificationCount} notifications`}
          onClick={() => setOpen((v) => !v)}
          type="button"
        >
          🔔
          {notificationCount > 0 && (
            <span className="topnav__badge" aria-hidden="true">
              {notificationCount}
            </span>
          )}
        </button>

        <button
          className="icon-button"
          aria-label={`${user.name}, ${user.title}`}
          type="button"
        >
          <span className="topnav__avatar" aria-hidden="true">
            {user.initials}
          </span>
        </button>
      </div>
    </nav>
  );
}
