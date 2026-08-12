/**
 * SuperadminShell — base layout for the platform-owner workspace (Day 41).
 *
 * Route group `(superadmin)` — folder name does not appear in URLs. All
 * pages live under /superadmin/*. Deliberately a separate shell (not
 * AdminShell) with its own dark-green sidebar so the two workspaces are
 * never visually confused.
 */
import { type ReactNode } from 'react';
import { SuperadminSidebar } from '@/components/superadmin/SuperadminSidebar';
import { SuperadminTopNav } from '@/components/superadmin/SuperadminTopNav';
import { Breadcrumbs } from '@/components/Breadcrumbs';

export function SuperadminShell({ children }: { children: ReactNode }) {
  return (
    <div className="sa-shell">
      <SuperadminSidebar />
      <div className="sa-main">
        <SuperadminTopNav />
        <div className="sa-breadcrumbs-bar">
          <Breadcrumbs />
        </div>
        <main className="sa-content" id="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default SuperadminShell;
