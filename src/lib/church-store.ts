/**
 * church-store.ts — in-memory mock "database" for the church-admin
 * settings features (Days 46–50): team/invitations, branding, general
 * settings, custom fields, and the tenant-scoped audit log. Mirrors
 * lib/superadmin-store.ts's module-singleton pattern so edits made during
 * a dev session are immediately visible everywhere, and resets on server
 * restart — a dev convenience, not persistence.
 *
 * Single-tenant demo: every function operates on one "home" church
 * (DEMO_CHURCH_ID), same convention as /api/billing and /api/church/*.
 */
import { mockStaff, type StaffMember, type Invitation, type InvitationStatus } from '@/lib/team';
import type { UserRole } from '@/lib/site';
import {
  defaultBranding, defaultGeneral, defaultCustomFields,
  DENOMINATION_DEFAULT_MINISTRIES,
  type ChurchBranding, type ChurchGeneral, type ChurchCustomField,
} from '@/lib/church-branding';
import { MINISTRIES } from '@/lib/ministries';
import type { ChurchAuditEntry, AuditFieldChange } from '@/lib/church-audit';

export const DEMO_CHURCH_ID = 'c1';

// ── Team + invitations ────────────────────────────────────────────────────────

let staff: StaffMember[] = mockStaff.map((s) => ({ ...s }));
let invitations: Invitation[] = [];

export function listStaff(): StaffMember[] {
  return [...staff].sort((a, b) => a.name.localeCompare(b.name));
}

export function updateStaffRole(id: string, role: UserRole): StaffMember | undefined {
  const member = staff.find((s) => s.id === id);
  if (!member) return undefined;
  const before = member.role;
  member.role = role;
  addAuditEntry({
    actorName: 'Solomon Leek', action: 'staff.role_changed', resourceType: 'Staff',
    resourceId: id, resourceLabel: member.name,
    changes: [{ field: 'role', before, after: role }],
  });
  return member;
}

export function removeStaff(id: string): boolean {
  const before = staff.length;
  staff = staff.filter((s) => s.id !== id);
  return staff.length < before;
}

export function listInvitations(): Invitation[] {
  return [...invitations].sort((a, b) => new Date(b.invitedAt).getTime() - new Date(a.invitedAt).getTime());
}

export function createInvitation(email: string, role: UserRole, invitedBy: string): Invitation {
  const invite: Invitation = {
    id: `inv_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    token: crypto.randomUUID(),
    email, role, status: 'pending', invitedBy,
    invitedAt: new Date().toISOString(),
  };
  invitations = [invite, ...invitations];
  addAuditEntry({
    actorName: invitedBy, action: 'staff.invited', resourceType: 'Invitation',
    resourceId: invite.id, resourceLabel: email,
    changes: [{ field: 'role', before: null, after: role }],
  });
  return invite;
}

export function getInvitationByToken(token: string): Invitation | undefined {
  return invitations.find((i) => i.token === token);
}

export function setInvitationStatus(id: string, status: InvitationStatus): Invitation | undefined {
  const invite = invitations.find((i) => i.id === id);
  if (!invite) return undefined;
  invite.status = status;
  if (status === 'accepted') invite.acceptedAt = new Date().toISOString();
  return invite;
}

export function acceptInvitation(token: string): StaffMember | undefined {
  const invite = invitations.find((i) => i.token === token);
  if (!invite || invite.status !== 'pending') return undefined;

  invite.status = 'accepted';
  invite.acceptedAt = new Date().toISOString();

  const newStaff: StaffMember = {
    id: `st_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    name: invite.email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    email: invite.email,
    role: invite.role,
    status: 'active',
    lastActiveAt: new Date().toISOString(),
    invitedAt: invite.invitedAt,
  };
  staff = [...staff, newStaff];

  addAuditEntry({
    actorName: newStaff.name, action: 'staff.joined', resourceType: 'Staff',
    resourceId: newStaff.id, resourceLabel: newStaff.name,
    changes: [{ field: 'status', before: 'invited', after: 'active' }],
  });

  return newStaff;
}

// ── Branding + general settings ───────────────────────────────────────────────

let branding: ChurchBranding = { ...defaultBranding };
let general: ChurchGeneral = { ...defaultGeneral };
let churchMinistries: string[] = [...MINISTRIES];
let lastSeededMinistries: string[] = [];

export function getBranding(): ChurchBranding { return branding; }

export function updateBranding(patch: Partial<ChurchBranding>, actorName = 'Solomon Leek'): ChurchBranding {
  const changes: AuditFieldChange[] = [];
  (Object.keys(patch) as (keyof ChurchBranding)[]).forEach((key) => {
    if (patch[key] !== undefined && patch[key] !== branding[key]) {
      changes.push({ field: key, before: branding[key], after: patch[key] });
    }
  });
  branding = { ...branding, ...patch };
  if (changes.length) {
    addAuditEntry({ actorName, action: 'branding.updated', resourceType: 'Branding', resourceId: DEMO_CHURCH_ID, resourceLabel: 'Church branding', changes });
  }
  return branding;
}

export function getGeneral(): ChurchGeneral { return general; }

export function updateGeneral(patch: Partial<ChurchGeneral>, actorName = 'Solomon Leek'): { general: ChurchGeneral; seededMinistries: string[] } {
  const changes: AuditFieldChange[] = [];
  (Object.keys(patch) as (keyof ChurchGeneral)[]).forEach((key) => {
    if (patch[key] !== undefined && patch[key] !== general[key]) {
      changes.push({ field: key, before: general[key], after: patch[key] });
    }
  });

  const denominationChanged = patch.denomination && patch.denomination !== general.denomination;
  general = { ...general, ...patch };

  let seededMinistries: string[] = [];
  if (denominationChanged) {
    seededMinistries = DENOMINATION_DEFAULT_MINISTRIES[general.denomination] ?? [];
    const merged = new Set([...churchMinistries, ...seededMinistries]);
    churchMinistries = [...merged];
    lastSeededMinistries = seededMinistries;
    changes.push({ field: 'ministries_seeded', before: null, after: seededMinistries });
  }

  if (changes.length) {
    addAuditEntry({ actorName, action: 'general_settings.updated', resourceType: 'Settings', resourceId: DEMO_CHURCH_ID, resourceLabel: 'General settings', changes });
  }

  return { general, seededMinistries };
}

export function listChurchMinistries(): string[] { return churchMinistries; }
export function getLastSeededMinistries(): string[] { return lastSeededMinistries; }

// ── Custom fields ──────────────────────────────────────────────────────────────

let customFields: ChurchCustomField[] = defaultCustomFields.map((f) => ({ ...f }));

export function listCustomFields(): ChurchCustomField[] {
  return [...customFields].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function addCustomField(field: Omit<ChurchCustomField, 'id' | 'sortOrder'>, actorName = 'Solomon Leek'): ChurchCustomField {
  const full: ChurchCustomField = { ...field, id: `cf_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, sortOrder: customFields.length };
  customFields = [...customFields, full];
  addAuditEntry({ actorName, action: 'custom_field.created', resourceType: 'CustomField', resourceId: full.id, resourceLabel: full.label, changes: [{ field: 'field', before: null, after: full.label }] });
  return full;
}

export function updateCustomField(id: string, patch: Partial<ChurchCustomField>, actorName = 'Solomon Leek'): ChurchCustomField | undefined {
  const field = customFields.find((f) => f.id === id);
  if (!field) return undefined;
  Object.assign(field, patch);
  addAuditEntry({ actorName, action: 'custom_field.updated', resourceType: 'CustomField', resourceId: id, resourceLabel: field.label, changes: [] });
  return field;
}

export function deleteCustomField(id: string, actorName = 'Solomon Leek'): boolean {
  const field = customFields.find((f) => f.id === id);
  const before = customFields.length;
  customFields = customFields.filter((f) => f.id !== id);
  const removed = customFields.length < before;
  if (removed && field) {
    addAuditEntry({ actorName, action: 'custom_field.deleted', resourceType: 'CustomField', resourceId: id, resourceLabel: field.label, changes: [{ field: 'field', before: field.label, after: null }] });
  }
  return removed;
}

// ── Tenant-scoped audit log ───────────────────────────────────────────────────

let auditLog: ChurchAuditEntry[] = [];

export function listChurchAuditLog(): ChurchAuditEntry[] {
  return [...auditLog].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function addAuditEntry(entry: Omit<ChurchAuditEntry, 'id' | 'timestamp'>): ChurchAuditEntry {
  const full: ChurchAuditEntry = { ...entry, id: `ca_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, timestamp: new Date().toISOString() };
  auditLog = [full, ...auditLog];
  return full;
}
