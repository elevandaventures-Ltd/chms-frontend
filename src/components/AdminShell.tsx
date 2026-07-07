/**
 * AdminShell — base layout for all authenticated ChMS pages (Day 10).
 *
 * The layout provides the shell. Individual pages only return their content.
 * Page title is auto-derived from the pathname by AdminTopNav.
 */
import { type ReactNode } from 'react';
import * as site from '@/lib/site';
import { AdminSidebar } from '@/components/AdminSidebar';
import { AdminTopNav } from '@/components/AdminTopNav';
import { Breadcrumbs } from '@/components/Breadcrumbs';

type AdminShellProps = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  breadcrumbs?: boolean;
};

export function AdminShell({
  children,
  title,
  subtitle,
  breadcrumbs = true,
}: AdminShellProps) {
  return (
    <div className="admin-shell">
      <AdminSidebar items={site.sidebarItems} />
      <div className="admin-main">
        <AdminTopNav title={title} subtitle={subtitle} />
        {breadcrumbs && (
          <div className="admin-breadcrumbs-bar">
            <Breadcrumbs />
          </div>
        )}
        <main className="admin-content" id="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AdminShell;
