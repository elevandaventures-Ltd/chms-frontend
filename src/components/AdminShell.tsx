'use client';

/**
 * AdminShell — base layout for all authenticated ChMS pages (Day 10).
 *
 * Provides:
 *   - Role-aware collapsible sidebar (Finance hidden for non-finance/admin)
 *   - Top navigation bar with user avatar + logout
 *   - Breadcrumb trail auto-generated from the current URL
 *   - Responsive grid layout (sidebar + main content)
 *
 * Usage (in route pages):
 *   <AdminShell title="Members" subtitle="Manage your congregation">
 *     <YourPageContent />
 *   </AdminShell>
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
  /** Show breadcrumbs. Defaults to true. */
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
      {/* Sidebar */}
      <AdminSidebar items={site.sidebarItems} />

      {/* Main area */}
      <div className="admin-main">
        {/* Top nav */}
        <AdminTopNav
          title={title}
          subtitle={subtitle}
          notifications={site.notifications}
        />

        {/* Breadcrumbs */}
        {breadcrumbs && (
          <div className="admin-breadcrumbs-bar">
            <Breadcrumbs />
          </div>
        )}

        {/* Page content */}
        <main className="admin-content" id="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AdminShell;
