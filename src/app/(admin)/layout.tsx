/**
 * Admin layout — wraps all protected ChMS pages.
 *
 * Uses a route group `(admin)` so the folder doesn't appear in the URL.
 * All pages placed inside (admin)/ automatically get the AdminShell
 * with role-aware sidebar, breadcrumbs, and top nav.
 *
 * The middleware.ts already protects these routes — unauthenticated
 * users are redirected to /login before this layout ever renders.
 */
import { type ReactNode } from 'react';
import { AdminShell } from '@/components/AdminShell';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
