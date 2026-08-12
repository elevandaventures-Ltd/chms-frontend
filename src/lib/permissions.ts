/**
 * permissions.ts — Day 49 Task 1: the 6-role permission matrix.
 *
 * Derived directly from src/lib/site.ts's `sidebarItems` (each item's
 * `roles` array is the actual, enforced access-control list — the
 * sidebar hides items a role can't reach) plus a couple of
 * non-navigational permissions gated elsewhere in the app. Deriving from
 * the live config, rather than hand-maintaining a parallel table, means
 * this matrix can't silently drift from what's actually enforced.
 */
import { sidebarItems, type UserRole } from '@/lib/site';

export const ALL_ROLES: UserRole[] = ['admin', 'pastor', 'finance', 'ministry_leader', 'staff', 'member'];

export const ROLE_LABEL: Record<UserRole, string> = {
  admin: 'Admin', pastor: 'Pastor', finance: 'Finance',
  ministry_leader: 'Ministry Leader', staff: 'Staff', member: 'Member',
};

export type PermissionRow = {
  feature: string;
  roles: UserRole[];
  enforcedBy: string;
};

const NAV_ROWS: PermissionRow[] = sidebarItems
  .filter((item) => item.href !== '/onboarding') // registration flow, not an ongoing permission
  .map((item) => ({
    feature: item.label,
    roles: item.roles,
    enforcedBy: `Sidebar nav gate (lib/site.ts → ${item.href})`,
  }));

const EXTRA_ROWS: PermissionRow[] = [
  { feature: 'Suspend/restore this church', roles: [], enforcedBy: 'Platform Owner only (superadmin, not a church role)' },
  { feature: 'Toggle feature flags', roles: [], enforcedBy: 'Platform Owner only (superadmin, not a church role)' },
  { feature: 'View audit log', roles: ['admin', 'pastor'], enforcedBy: 'RLS: audit_log church-scoped SELECT policy' },
  { feature: 'Manage custom fields', roles: ['admin', 'pastor'], enforcedBy: 'RLS: church_custom_fields policy' },
  { feature: 'Invite/remove staff', roles: ['admin'], enforcedBy: 'RLS: staff_invitations policy' },
];

export const PERMISSION_MATRIX: PermissionRow[] = [...NAV_ROWS, ...EXTRA_ROWS];
