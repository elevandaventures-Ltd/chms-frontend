/**
 * Shared definitions for the CSV member-import flow (Day 20).
 *
 * Used by both the import wizard (preview) and POST /api/members/import (commit)
 * so the column mapping and row normalisation stay identical on both sides.
 */
import type { MemberStatus, AgeGroup, UserRole } from '@/lib/site';

export type ImportFieldKey =
  | 'fullName' | 'firstName' | 'lastName' | 'email' | 'phone'
  | 'status' | 'role' | 'joinedDate' | 'ageGroup' | 'zone'
  | 'ministries' | 'gender' | 'denomination' | 'notes';

export type ImportField = {
  key: ImportFieldKey;
  label: string;
  required?: boolean;
  hint?: string;
};

// Email is the match key for add-vs-update; a name (fullName OR first+last) is
// also required, validated at normalisation time.
export const IMPORT_FIELDS: ImportField[] = [
  { key: 'fullName',     label: 'Full name',    hint: 'or map First + Last name' },
  { key: 'firstName',    label: 'First name' },
  { key: 'lastName',     label: 'Last name' },
  { key: 'email',        label: 'Email',        required: true },
  { key: 'phone',        label: 'Phone' },
  { key: 'status',       label: 'Status',       hint: 'active / inactive / visitor' },
  { key: 'role',         label: 'Role' },
  { key: 'joinedDate',   label: 'Join date' },
  { key: 'ageGroup',     label: 'Age group' },
  { key: 'zone',         label: 'Zone' },
  { key: 'ministries',   label: 'Ministries',   hint: 'separated by ; or ,' },
  { key: 'gender',       label: 'Gender' },
  { key: 'denomination', label: 'Denomination' },
  { key: 'notes',        label: 'Notes' },
];

export type Mapping = Partial<Record<ImportFieldKey, number>>; // field → CSV column index

export type NormalizedMember = {
  fullName: string;
  email: string;
  phone: string;
  status: MemberStatus;
  role: UserRole;
  joinedDate: string;
  ageGroup: AgeGroup | '';
  zone: string;
  ministries: string[];
  gender: string;
  denomination: string;
  notes: string;
  valid: boolean;
  error?: string;
};

const STATUSES: MemberStatus[] = ['active', 'inactive', 'visitor'];
const ROLES: UserRole[] = ['admin', 'pastor', 'finance', 'ministry_leader', 'staff', 'member'];
const AGE_GROUPS: AgeGroup[] = ['child', 'youth', 'young_adult', 'adult', 'senior'];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function coerceStatus(raw: string): MemberStatus {
  const v = raw.trim().toLowerCase();
  return (STATUSES as string[]).includes(v) ? (v as MemberStatus) : 'active';
}

function coerceRole(raw: string): UserRole {
  const v = raw.trim().toLowerCase().replace(/\s+/g, '_');
  return (ROLES as string[]).includes(v) ? (v as UserRole) : 'member';
}

function coerceAgeGroup(raw: string): AgeGroup | '' {
  const v = raw.trim().toLowerCase().replace(/\s+/g, '_');
  return (AGE_GROUPS as string[]).includes(v) ? (v as AgeGroup) : '';
}

// Accept YYYY-MM-DD as-is; otherwise try Date.parse and fall back to today.
function coerceDate(raw: string, today: string): string {
  const v = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  if (!v) return today;
  const t = Date.parse(v);
  if (Number.isNaN(t)) return today;
  return new Date(t).toISOString().slice(0, 10);
}

/**
 * Apply a column mapping to one raw CSV row and normalise it into a member.
 * `today` is passed in so callers control the default join date.
 */
export function normalizeRow(cells: string[], mapping: Mapping, today: string): NormalizedMember {
  const get = (key: ImportFieldKey): string => {
    const idx = mapping[key];
    return idx === undefined ? '' : (cells[idx] ?? '').trim();
  };

  const fullName = (get('fullName') || `${get('firstName')} ${get('lastName')}`).trim();
  const email = get('email').trim();
  const ministries = get('ministries')
    .split(/[;,]/)
    .map((s) => s.trim())
    .filter(Boolean);

  let valid = true;
  let error: string | undefined;
  if (!email || !EMAIL_RE.test(email)) { valid = false; error = 'Missing or invalid email'; }
  else if (!fullName)                  { valid = false; error = 'Missing name'; }

  return {
    fullName,
    email,
    phone:        get('phone'),
    status:       coerceStatus(get('status')),
    role:         coerceRole(get('role')),
    joinedDate:   coerceDate(get('joinedDate'), today),
    ageGroup:     coerceAgeGroup(get('ageGroup')),
    zone:         get('zone'),
    ministries,
    gender:       get('gender'),
    denomination: get('denomination'),
    notes:        get('notes'),
    valid,
    error,
  };
}

// Best-effort auto-mapping: match a CSV header to a field by fuzzy name.
export function autoMap(headers: string[]): Mapping {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '');
  const aliases: Record<ImportFieldKey, string[]> = {
    fullName:     ['fullname', 'name', 'membername'],
    firstName:    ['firstname', 'first', 'givenname'],
    lastName:     ['lastname', 'last', 'surname', 'familyname'],
    email:        ['email', 'emailaddress', 'mail'],
    phone:        ['phone', 'mobile', 'phonenumber', 'tel', 'cell'],
    status:       ['status', 'memberstatus'],
    role:         ['role', 'churchrole'],
    joinedDate:   ['joineddate', 'joined', 'joindate', 'datejoined', 'membersince'],
    ageGroup:     ['agegroup', 'age'],
    zone:         ['zone', 'area', 'region'],
    ministries:   ['ministries', 'ministry', 'teams', 'groups'],
    gender:       ['gender', 'sex'],
    denomination: ['denomination'],
    notes:        ['notes', 'note', 'comments'],
  };

  const mapping: Mapping = {};
  const used = new Set<number>();
  (Object.keys(aliases) as ImportFieldKey[]).forEach((key) => {
    const idx = headers.findIndex((h, i) => !used.has(i) && aliases[key].includes(norm(h)));
    if (idx !== -1) { mapping[key] = idx; used.add(idx); }
  });
  return mapping;
}
