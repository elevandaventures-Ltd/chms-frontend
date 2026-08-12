/**
 * church-audit.ts — Day 48: tenant-scoped audit log (distinct from the
 * platform-wide one in lib/superadmin.ts). Every entry can carry a
 * before/after field diff for the expandable-row view.
 */

export type AuditFieldChange = { field: string; before: unknown; after: unknown };

export type ChurchAuditEntry = {
  id: string;
  timestamp: string; // ISO
  actorName: string;
  action: string;       // e.g. 'member.updated', 'member.status_changed', 'event.deleted'
  resourceType: string; // e.g. 'Member', 'Event', 'Staff'
  resourceId: string;
  resourceLabel: string; // human-readable, e.g. member full name
  changes: AuditFieldChange[];
};
