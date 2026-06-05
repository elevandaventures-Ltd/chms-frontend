/**
 * Admin layout — wraps all protected ChMS pages in AdminShell.
 *
 * Route group `(admin)` — folder name does not appear in URLs.
 * Pages inside this group must NOT render their own AdminShell —
 * they should only return their page content (no layout wrapper).
 */
import { type ReactNode } from 'react';
import { AdminShell } from '@/components/AdminShell';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
