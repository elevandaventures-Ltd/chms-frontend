/**
 * Client-side export helpers for the member directory bulk actions (Day 19).
 *
 *   exportMembersCsv  — builds a CSV and triggers a file download.
 *   exportMembersPdf  — opens a print-ready window (browser "Save as PDF").
 *
 * Both are dependency-free: CSV via a Blob + object URL, PDF via window.print().
 */
import type { Member } from '@/lib/site';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin', pastor: 'Pastor', finance: 'Finance',
  ministry_leader: 'Ministry Leader', staff: 'Staff', member: 'Member',
};

const COLUMNS: { header: string; value: (m: Member) => string }[] = [
  { header: 'Name',       value: (m) => m.fullName },
  { header: 'Email',      value: (m) => m.email },
  { header: 'Phone',      value: (m) => m.phone ?? '' },
  { header: 'Status',     value: (m) => m.status },
  { header: 'Role',       value: (m) => ROLE_LABELS[m.role] ?? m.role },
  { header: 'Ministries', value: (m) => m.ministries.join('; ') },
  { header: 'Joined',     value: (m) => m.joinedDate },
  { header: 'Age Group',  value: (m) => m.ageGroup ?? '' },
  { header: 'Zone',       value: (m) => m.zone ?? '' },
];

// Wrap a value in quotes and escape embedded quotes per RFC 4180.
function csvCell(value: string): string {
  const needsQuoting = /[",\n\r]/.test(value);
  const escaped = value.replace(/"/g, '""');
  return needsQuoting ? `"${escaped}"` : escaped;
}

function timestampSlug(): string {
  // Locale-independent YYYY-MM-DD-HHmm.
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
}

export function exportMembersCsv(members: Member[], filename?: string): void {
  const rows = [
    COLUMNS.map((c) => csvCell(c.header)).join(','),
    ...members.map((m) => COLUMNS.map((c) => csvCell(c.value(m))).join(',')),
  ];
  // Prepend a BOM so Excel reads UTF-8 (e.g. names with accents) correctly.
  const blob = new Blob(['﻿' + rows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = filename ?? `members-${timestampSlug()}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function exportMembersPdf(members: Member[]): void {
  const win = window.open('', '_blank');
  if (!win) return; // popup blocked — caller surfaces a hint

  const headerCells = COLUMNS.map((c) => `<th>${escapeHtml(c.header)}</th>`).join('');
  const bodyRows = members
    .map((m) => `<tr>${COLUMNS.map((c) => `<td>${escapeHtml(c.value(m))}</td>`).join('')}</tr>`)
    .join('');

  const generatedOn = new Date().toLocaleString();

  win.document.write(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Member export (${members.length})</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: Inter, system-ui, sans-serif; color: #231d18; margin: 28px; }
    h1 { font-size: 18px; margin: 0 0 2px; }
    .meta { color: #6b625b; font-size: 12px; margin: 0 0 18px; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; }
    th, td { text-align: left; padding: 6px 8px; border-bottom: 1px solid #e5ddd3; vertical-align: top; }
    th { background: #f4efe8; text-transform: uppercase; letter-spacing: 0.04em; font-size: 10px; }
    tr:nth-child(even) td { background: #faf7f2; }
    @media print { body { margin: 12mm; } }
  </style>
</head>
<body>
  <h1>Member Export</h1>
  <p class="meta">${members.length} member${members.length === 1 ? '' : 's'} · generated ${escapeHtml(generatedOn)}</p>
  <table>
    <thead><tr>${headerCells}</tr></thead>
    <tbody>${bodyRows}</tbody>
  </table>
  <script>window.onload = function () { window.focus(); window.print(); };<\/script>
</body>
</html>`);
  win.document.close();
}
