/**
 * Backend API contract types.
 *
 * ⚠️ VENDORED from the chms-backend monorepo package `@repo/api-types`
 * (branch feat/pr-fix, packages/api-types/src/index.ts). The frontend is a
 * separate repository, so the shared types are copied here rather than imported.
 * Keep this file in lockstep with the backend package — the backend is the
 * source of truth. Only types consumed by the frontend are vendored.
 *
 * Note: API *responses* are snake_case (mirroring DB rows); request *bodies*
 * are camelCase. The frontend's own `Member` type in lib/site.ts is a different,
 * UI-oriented shape — map between them at the client boundary.
 */

// ── Roles & RBAC ───────────────────────────────────────────────────────────

export type UserRole =
  | 'owner'
  | 'admin'
  | 'senior_pastor'
  | 'admin_staff'
  | 'ministry_leader'
  | 'finance_officer'
  | 'member';

export type PermissionKey =
  | 'members.read'
  | 'members.write'
  | 'members.delete'
  | 'groups.read'
  | 'groups.write'
  | 'events.read'
  | 'events.write'
  | 'finances.read'
  | 'finances.write'
  | 'reports.read'
  | 'roles.read'
  | 'roles.assign'
  | 'church.manage';

// ── Churches ───────────────────────────────────────────────────────────────

export interface Church {
  id: string;
  slug: string;
  name: string;
  timezone: string;
  locale: string;
  created_at: string;
  updated_at: string;
}

export interface CreateChurchRequest {
  name: string;
  slug?: string;
  timezone?: string;
  locale?: string;
  denomination?: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  customFields?: Record<string, unknown>;
}

export interface CreateChurchResponse {
  church: Church;
  role: UserRole;
  message: string;
}

// ── Members ────────────────────────────────────────────────────────────────

export type MemberStatus =
  | 'prospect'
  | 'visitor'
  | 'active'
  | 'inactive'
  | 'transferred'
  | 'deceased'
  | 'archived';

export type MemberEventType =
  | 'check_in'
  | 'giving'
  | 'group_join'
  | 'group_leave'
  | 'event_attendance'
  | 'pastoral_note'
  | 'status_change'
  | 'milestone'
  | 'communication'
  | 'note';

export interface Member {
  id: string;
  church_id: string;
  user_id: string | null;
  first_name: string;
  last_name: string | null;
  preferred_name: string | null;
  email: string | null;
  phone: string | null;
  date_of_birth: string | null;
  gender: string | null;
  marital_status: string | null;
  photo_url: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state_region: string | null;
  postal_code: string | null;
  country: string | null;
  geo_lat: number | null;
  geo_lng: number | null;
  neighbourhood: string | null;
  baptism_date: string | null;
  communion_date: string | null;
  confirmation_date: string | null;
  ordination_date: string | null;
  spiritual_milestones: unknown[];
  status: MemberStatus;
  joined_at: string | null;
  notes: string | null;
  custom_fields: Record<string, unknown>;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MemberTimelineEvent {
  id: string;
  church_id: string;
  member_id: string;
  event_type: MemberEventType;
  metadata: Record<string, unknown>;
  occurred_at: string;
  created_by: string | null;
  created_at: string;
}

export interface CreateMemberRequest {
  firstName: string;
  lastName?: string;
  preferredName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  maritalStatus?: string;
  photoUrl?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  stateRegion?: string;
  postalCode?: string;
  country?: string;
  geoLat?: number;
  geoLng?: number;
  neighbourhood?: string;
  baptismDate?: string;
  communionDate?: string;
  confirmationDate?: string;
  ordinationDate?: string;
  spiritualMilestones?: unknown[];
  status?: MemberStatus;
  joinedAt?: string;
  notes?: string;
  customFields?: Record<string, unknown>;
  userId?: string;
}

export type UpdateMemberRequest = Partial<{
  firstName: string;
  lastName: string | null;
  preferredName: string | null;
  email: string | null;
  phone: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  maritalStatus: string | null;
  photoUrl: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  stateRegion: string | null;
  postalCode: string | null;
  country: string | null;
  geoLat: number | null;
  geoLng: number | null;
  neighbourhood: string | null;
  baptismDate: string | null;
  communionDate: string | null;
  confirmationDate: string | null;
  ordinationDate: string | null;
  spiritualMilestones: unknown[];
  status: MemberStatus;
  joinedAt: string | null;
  notes: string | null;
  customFields: Record<string, unknown>;
  userId: string | null;
}>;

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface MemberListQuery {
  page?: number;
  pageSize?: number;
  status?: MemberStatus;
  search?: string;
  includeDeleted?: boolean;
}

export interface MemberListResponse {
  members: Member[];
  pagination: PaginationMeta;
}

export interface MemberProfileResponse {
  member: Member;
  timeline: MemberTimelineEvent[];
  household: MemberHouseholdSummary | null;
  groups: MemberGroupSummary[];
}

export interface CreateMemberResponse { member: Member; message: string }
export interface UpdateMemberResponse { member: Member; message: string }
export interface DeleteMemberResponse { member: Member; message: string }
export interface RestoreMemberResponse { member: Member; message: string }

export interface ChangeMemberStatusRequest { status: MemberStatus; reason?: string }
export interface ChangeMemberStatusResponse { member: Member; message: string }

export interface MemberSearchHit {
  id: string;
  church_id: string;
  first_name: string;
  last_name: string | null;
  preferred_name: string | null;
  email: string | null;
  phone: string | null;
  status: MemberStatus;
}

export interface MemberSearchResponse {
  query: string;
  hits: MemberSearchHit[];
  estimatedTotalHits: number;
  limit: number;
  offset: number;
}

// ── Bulk / import / export ───────────────────────────────────────────────────

export type BulkMemberAction = 'assign-ministry' | 'change-status' | 'export' | 'archive';

export interface BulkMemberActionRequest {
  action: BulkMemberAction;
  memberIds: string[];
  params?: {
    groupId?: string;
    status?: MemberStatus;
    format?: 'csv' | 'pdf';
  };
}

export interface BulkMemberActionResponse {
  action: BulkMemberAction;
  requested: number;
  succeeded: number;
  failed: number;
  errors: { memberId: string; message: string }[];
  download?: { format: 'csv' | 'pdf'; url: string; count: number };
}

export interface MemberImportSummary {
  totalRows: number;
  added: number;
  updated: number;
  skipped: number;
  failed: number;
}

export interface MemberImportResponse {
  dryRun: boolean;
  mode: 'skip' | 'update';
  summary: MemberImportSummary;
  errors: { row?: number; field?: string; message: string }[];
  skippedRows: { row: number; reason: string }[];
  ignoredColumns: string[];
  message: string;
}

// ── Alerts ───────────────────────────────────────────────────────────────────

export type MemberAlertType = 'inactive';

export interface MemberAlert {
  id: string;
  church_id: string;
  member_id: string;
  alert_type: MemberAlertType;
  threshold_days: number;
  days_inactive: number;
  last_activity_at: string | null;
  status: string;
  detected_at: string;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MemberAlertsResponse {
  alerts: { alert: MemberAlert; member: Member }[];
  pagination: PaginationMeta;
}

// ── Households ─────────────────────────────────────────────────────────────

export type HouseholdRelationshipType = 'parent' | 'child' | 'spouse' | 'sibling';

export interface Household {
  id: string;
  church_id: string;
  name: string;
  address: string | null;
  geo_lat: number | null;
  geo_lng: number | null;
  created_at: string;
  updated_at: string;
}

export interface HouseholdListResponse {
  households: Household[];
  pagination: PaginationMeta;
}

export interface HouseholdMemberEntry {
  member: Member;
  relationship_type: HouseholdRelationshipType;
}

export interface HouseholdDetailResponse {
  household: Household;
  members: HouseholdMemberEntry[];
}

export interface MemberHouseholdSummary {
  household: Household;
  relationship_type: HouseholdRelationshipType;
}

// ── Groups ─────────────────────────────────────────────────────────────────

export type GroupType = 'campus' | 'department' | 'ministry' | 'small_group';

export interface Group {
  id: string;
  church_id: string;
  parent_id: string | null;
  group_type: GroupType;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface GroupListResponse {
  groups: Group[];
}

export interface GroupMemberEntry {
  member: Member;
  role: string | null;
}

export interface GroupDetailResponse {
  group: Group;
  children: Group[];
  members: GroupMemberEntry[];
}

export interface MemberGroupSummary {
  group: Group;
  role: string | null;
}

// ── Auth ───────────────────────────────────────────────────────────────────

/** GET /auth/me → identity decoded from the bearer token. */
export interface AuthMeResponse {
  user: {
    userId: string;
    email: string | null;
    churchId: string | null;
    role: UserRole | null;
  } | null;
}

/** POST /auth/login → Supabase session tokens. */
export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

/** Standard error reply shape ({ error, message }). */
export interface ApiErrorBody {
  error: string;
  message: string;
}
