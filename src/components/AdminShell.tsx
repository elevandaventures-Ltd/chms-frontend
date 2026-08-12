/**
 * AdminShell — base layout for all authenticated ChMS pages (Day 10).
 *
 * The layout provides the shell. Individual pages only return their content.
 * Page title is auto-derived from the pathname by AdminTopNav.
 */
import { type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import * as site from '@/lib/site';
import { AdminSidebar } from '@/components/AdminSidebar';
import { AdminTopNav } from '@/components/AdminTopNav';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { ReadOnlyGate } from '@/components/ReadOnlyGate';
import { OfflineBanner } from '@/components/OfflineBanner';

// Deferred into its own chunk: pulls in the Dexie/IndexedDB chain
// (lib/db.ts), which shouldn't ship as part of the layout every page
// depends on just because one background feature (offline sync) needs it.
// (AdminShell is a Server Component, so `ssr: false` isn't available here —
// not needed either, since this component always renders null and its
// useEffect never runs during SSR anyway.)
const OfflineSyncProvider = dynamic(() => import('@/components/OfflineSyncProvider'));

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
      <OfflineSyncProvider />
      <AdminSidebar items={site.sidebarItems} />
      <div className="admin-main">
        <OfflineBanner />
        <AdminTopNav title={title} subtitle={subtitle} />
        {breadcrumbs && (
          <div className="admin-breadcrumbs-bar">
            <Breadcrumbs />
          </div>
        )}
        <main className="admin-content" id="main-content">
          <ReadOnlyGate>{children}</ReadOnlyGate>
        </main>
      </div>
    </div>
  );
}

export default AdminShell;
