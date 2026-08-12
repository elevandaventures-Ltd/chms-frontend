/**
 * team.ts — Day 46 Team Management: staff roster + invitations.
 */
import type { UserRole } from '@/lib/site';

export type StaffStatus = 'active' | 'invited' | 'suspended';

export type StaffMember = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: StaffStatus;
  lastActiveAt: string; // ISO
  invitedAt: string; // ISO
};

export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'revoked';

export type Invitation = {
  id: string;
  token: string;
  email: string;
  role: UserRole;
  status: InvitationStatus;
  invitedBy: string;
  invitedAt: string;
  acceptedAt?: string;
};

export const ROLE_LABEL: Record<UserRole, string> = {
  admin: 'Admin', pastor: 'Pastor', finance: 'Finance',
  ministry_leader: 'Ministry Leader', staff: 'Staff', member: 'Member',
};

export const INVITABLE_ROLES: UserRole[] = ['admin', 'pastor', 'finance', 'ministry_leader', 'staff'];

function hoursAgo(h: number): string { return new Date(Date.now() - h * 3_600_000).toISOString(); }
function daysAgo(d: number): string { return new Date(Date.now() - d * 86_400_000).toISOString(); }

export const mockStaff: StaffMember[] = [
  { id: 'st1', name: 'Solomon Leek',    email: 's.leek@elevanda.org',    role: 'admin',           status: 'active', lastActiveAt: hoursAgo(1),  invitedAt: daysAgo(400) },
  { id: 'st2', name: 'Abena Mensah',    email: 'abena@elevanda.org',     role: 'pastor',          status: 'active', lastActiveAt: hoursAgo(4),  invitedAt: daysAgo(300) },
  { id: 'st3', name: 'Efua Darko',      email: 'efua@elevanda.org',      role: 'finance',         status: 'active', lastActiveAt: daysAgo(1),   invitedAt: daysAgo(280) },
  { id: 'st4', name: 'Kwame Asante',    email: 'kwame@elevanda.org',     role: 'ministry_leader', status: 'active', lastActiveAt: daysAgo(2),   invitedAt: daysAgo(200) },
  { id: 'st5', name: 'Ama Boateng',     email: 'ama@elevanda.org',       role: 'staff',           status: 'active', lastActiveAt: daysAgo(6),   invitedAt: daysAgo(150) },
  { id: 'st6', name: 'Kojo Dankwa',     email: 'kojo@elevanda.org',      role: 'staff',           status: 'suspended', lastActiveAt: daysAgo(40), invitedAt: daysAgo(120) },
];
