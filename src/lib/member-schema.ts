import { z } from 'zod';

const PHONE_RE = /^\+?[0-9\s\-().]{7,20}$/;

export const memberSchema = z.object({
  // ── Personal ──────────────────────────────────────────────────────────────
  firstName:    z.string().min(1, 'First name is required').max(60),
  lastName:     z.string().min(1, 'Last name is required').max(60),
  email:        z.string().min(1, 'Email is required').email('Enter a valid email address'),
  phone:        z.string().regex(PHONE_RE, 'Enter a valid phone number').or(z.literal('')).optional(),
  dateOfBirth:  z.string().optional(),
  gender:       z.enum(['male', 'female', 'other', '']).optional(),
  ageGroup:     z.enum(['child', 'youth', 'young_adult', 'adult', 'senior', '']).optional(),

  // ── Church details ────────────────────────────────────────────────────────
  status:       z.enum(['active', 'inactive', 'visitor']),
  role:         z.enum(['admin', 'pastor', 'finance', 'ministry_leader', 'staff', 'member']),
  joinedDate:   z.string().min(1, 'Join date is required'),
  zone:         z.string().optional(),
  denomination: z.string().optional(),
  baptised:     z.boolean().optional(),

  // ── Contact / address ─────────────────────────────────────────────────────
  address:      z.string().optional(),
  city:         z.string().optional(),
  country:      z.string().optional(),

  // ── Family linking ────────────────────────────────────────────────────────
  householdHeadId: z.string().optional(),
  householdRole:   z.enum(['head', 'spouse', 'child', 'other', '']).optional(),

  // ── Ministry assignment ───────────────────────────────────────────────────
  ministries:   z.array(z.string()).optional(),

  // ── Notes ─────────────────────────────────────────────────────────────────
  notes:        z.string().max(1000).optional(),
});

export type MemberFormValues = z.infer<typeof memberSchema>;

// ── Status change (Day 18) ────────────────────────────────────────────────────
//
// Used by the Member Status change modal and PATCH /api/members/:id/status.
// Mirrors the `status` enum above so the same three values stay the single
// source of truth across add, edit, and status-change flows.

export const MEMBER_STATUSES = ['active', 'inactive', 'visitor'] as const;
export type MemberStatusValue = (typeof MEMBER_STATUSES)[number];

// Transitions that need an explicit confirmation step in the UI. Moving a
// member to "inactive" is treated as destructive — it removes them from active
// rosters and communications — so it requires a reason.
export const DESTRUCTIVE_STATUSES: readonly MemberStatusValue[] = ['inactive'];

export const statusChangeSchema = z
  .object({
    status: z.enum(MEMBER_STATUSES),
    reason: z.string().trim().max(500, 'Reason must be 500 characters or fewer').optional(),
  })
  .refine(
    (v) => !DESTRUCTIVE_STATUSES.includes(v.status) || Boolean(v.reason && v.reason.length > 0),
    { path: ['reason'], message: 'A reason is required when deactivating a member' },
  );

export type StatusChangeValues = z.infer<typeof statusChangeSchema>;
