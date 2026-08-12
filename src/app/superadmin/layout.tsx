/**
 * /superadmin/* layout — wraps every platform-owner page in SuperadminShell.
 *
 * Page components under this folder must NOT render their own shell — they
 * should only return page content, same convention as (admin)/layout.tsx.
 */
import { type ReactNode } from 'react';
import { SuperadminShell } from '@/components/superadmin/SuperadminShell';

export default function SuperadminLayout({ children }: { children: ReactNode }) {
  return <SuperadminShell>{children}</SuperadminShell>;
}
