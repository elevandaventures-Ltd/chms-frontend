/**
 * export-audit-log.ts — Day 48 Task 2: download the (filtered) audit log
 * as CSV for compliance reporting. Same dependency-free Blob-download
 * pattern as lib/export-members.ts.
 */
import type { ChurchAuditEntry } from '@/lib/church-audit';

function csvCell(value: string): string {
  const needsQuoting = /[",\n\r]/.test(value);
  const escaped = value.replace(/"/g, '""');
  return needsQuoting ? `"${escaped}"` : escaped;
}

function timestampSlug(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
}

export function exportAuditLogCsv(entries: ChurchAuditEntry[]): void {
  const header = ['Timestamp', 'User', 'Action', 'Resource Type', 'Resource', 'Field', 'Before', 'After'];
  const rows: string[] = [header.map(csvCell).join(',')];

  entries.forEach((e) => {
    if (e.changes.length === 0) {
      rows.push([e.timestamp, e.actorName, e.action, e.resourceType, e.resourceLabel, '', '', ''].map((v) => csvCell(String(v))).join(','));
    } else {
      e.changes.forEach((c) => {
        rows.push([
          e.timestamp, e.actorName, e.action, e.resourceType, e.resourceLabel,
          c.field, String(c.before ?? ''), String(c.after ?? ''),
        ].map((v) => csvCell(String(v))).join(','));
      });
    }
  });

  const blob = new Blob(['﻿' + rows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `audit-log-${timestampSlug()}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
