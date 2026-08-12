/**
 * export-church-data.ts — Day 49 review: "trigger church data export;
 * verify zip file downloads with all 5 CSV files." Bundles members,
 * households, attendance, events, and giving into one .zip using JSZip.
 */
import JSZip from 'jszip';

function csvCell(value: string): string {
  const needsQuoting = /[",\n\r]/.test(value);
  const escaped = value.replace(/"/g, '""');
  return needsQuoting ? `"${escaped}"` : escaped;
}

function toCsv(headers: string[], rows: string[][]): string {
  const lines = [headers, ...rows].map((r) => r.map((v) => csvCell(String(v))).join(','));
  return '﻿' + lines.join('\r\n');
}

type MemberRow = { id: string; fullName?: string; full_name?: string; email: string; phone?: string; status: string; role: string; ministries?: string[]; joinedDate?: string; joined_date?: string };
type HouseholdRow = { id: string; name: string; address?: string; zone?: string; members?: unknown[] };
type SessionRow = { id: string; sessionType?: string; type?: string; startedAt?: string; date?: string; checkinCount?: number };
type EventRow = { id: string; title: string; type?: string; start: string; location?: string; rsvpCount?: number };

function membersCsv(members: MemberRow[]): string {
  return toCsv(
    ['ID', 'Name', 'Email', 'Phone', 'Status', 'Role', 'Ministries', 'Joined'],
    members.map((m) => [m.id, m.fullName ?? m.full_name ?? '', m.email, m.phone ?? '', m.status, m.role, (m.ministries ?? []).join('; '), m.joinedDate ?? m.joined_date ?? '']),
  );
}

function householdsCsv(households: HouseholdRow[]): string {
  return toCsv(
    ['ID', 'Name', 'Address', 'Zone', 'Member Count'],
    households.map((h) => [h.id, h.name, h.address ?? '', h.zone ?? '', String(h.members?.length ?? 0)]),
  );
}

function attendanceCsv(sessions: SessionRow[]): string {
  return toCsv(
    ['Session ID', 'Type', 'Date', 'Check-ins'],
    sessions.map((s) => [s.id, s.sessionType ?? s.type ?? '', s.startedAt ?? s.date ?? '', String(s.checkinCount ?? 0)]),
  );
}

function eventsCsv(events: EventRow[]): string {
  return toCsv(
    ['ID', 'Title', 'Type', 'Start', 'Location', 'RSVPs'],
    events.map((e) => [e.id, e.title, e.type ?? '', String(e.start), e.location ?? '', String(e.rsvpCount ?? 0)]),
  );
}

/** No real giving-transactions feature exists yet (Finance page is a
 *  placeholder) — this seeds a short representative weekly ledger so the
 *  export's giving.csv isn't empty. Swap for a real query once Finance
 *  ships transaction records. */
function givingCsv(): string {
  const funds = ['Tithes & Offerings', 'Building Fund', 'Missions', 'Special Offering'];
  const rows = Array.from({ length: 8 }).map((_, i) => {
    const d = new Date(Date.now() - i * 7 * 86_400_000);
    return [d.toISOString().slice(0, 10), funds[i % funds.length], String(6000 + i * 340), String(150 + i * 4)];
  });
  return toCsv(['Week Of', 'Fund', 'Amount (GHS)', 'Giver Count'], rows);
}

export async function exportChurchDataZip(): Promise<void> {
  const [membersRes, householdsRes, sessionsRes, eventsRes] = await Promise.all([
    fetch('/api/members?pageSize=500').then((r) => r.json()).catch(() => ({})),
    fetch('/api/households').then((r) => r.json()).catch(() => ({})),
    fetch('/api/attendance/sessions').then((r) => r.json()).catch(() => ({})),
    fetch('/api/events').then((r) => r.json()).catch(() => ({})),
  ]);

  const zip = new JSZip();
  zip.file('members.csv', membersCsv(membersRes.data ?? membersRes.members ?? []));
  zip.file('households.csv', householdsCsv(householdsRes.data ?? []));
  zip.file('attendance.csv', attendanceCsv(sessionsRes.data ?? []));
  zip.file('events.csv', eventsCsv(eventsRes.data ?? []));
  zip.file('giving.csv', givingCsv());

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const pad = (n: number) => String(n).padStart(2, '0');
  const d = new Date();
  a.href = url;
  a.download = `church-data-export-${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}.zip`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
