/**
 * site.ts — ChMS application data and type definitions.
 *
 * UserRole matches the 6 roles defined in the Day 9 RBAC spec.
 * The hardcoded currentUser has been removed — use useCurrentUser()
 * from @/hooks/useCurrentUser to get the real signed-in user.
 */

// ── Role types ────────────────────────────────────────────────────────────────

export type UserRole =
  | 'admin'
  | 'pastor'
  | 'finance'
  | 'ministry_leader'
  | 'staff'
  | 'member';

// ── Shared types ──────────────────────────────────────────────────────────────

export type SidebarItem = {
  label: string;
  href: string;
  icon: string;
  roles: UserRole[];
};

export type NotificationItem = {
  title: string;
  detail: string;
  time: string;
  unread?: boolean;
};

// ── Notifications (static; replace with real-time feed in a later sprint) ────

export const notifications: NotificationItem[] = [
  {
    title: 'Church onboarding wizard live',
    detail: 'Register a new church at /onboarding.',
    time: 'Just now',
    unread: true,
  },
  {
    title: 'Protected routes active',
    detail: 'Unauthenticated users are redirected to /login.',
    time: '1d ago',
    unread: true,
  },
  {
    title: 'Design system updated',
    detail: 'Tailwind CSS, Inter and Playfair Display fonts applied.',
    time: '2d ago',
    unread: false,
  },
];

// ── Sidebar navigation — ChMS routes with RBAC ───────────────────────────────

export const sidebarItems: SidebarItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: 'dashboard',
    roles: ['admin', 'pastor', 'finance', 'ministry_leader', 'staff', 'member'],
  },
  {
    label: 'Members',
    href: '/members',
    icon: 'members',
    roles: ['admin', 'pastor', 'ministry_leader', 'staff', 'member'],
  },
  {
    label: 'Households',
    href: '/households',
    icon: 'households',
    roles: ['admin', 'pastor', 'ministry_leader', 'staff'],
  },
  {
    label: 'Attendance',
    href: '/attendance',
    icon: 'attendance',
    roles: ['admin', 'pastor', 'ministry_leader', 'staff'],
  },
  {
    label: 'Events',
    href: '/events',
    icon: 'events',
    roles: ['admin', 'pastor', 'ministry_leader', 'staff', 'member'],
  },
  {
    label: 'Communication',
    href: '/communication',
    icon: 'communication',
    roles: ['admin', 'pastor', 'ministry_leader', 'staff'],
  },
  {
    label: 'Finance',
    href: '/finance',
    icon: 'finance',
    roles: ['admin', 'finance'],
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: 'settings',
    roles: ['admin'],
  },
  {
    label: 'Register a Church',
    href: '/onboarding',
    icon: 'onboarding',
    roles: ['admin'],
  },
];

// ── Sprint log ────────────────────────────────────────────────────────────────

export type DayEntry = {
  day: string;
  date: string;
  title: string;
  status: 'complete' | 'in-progress' | 'upcoming';
  detail: string;
  href?: string;
};

export const sprintLog: DayEntry[] = [
  {
    day: 'Day 1',
    date: '2026-05-25',
    title: 'Project baseline',
    status: 'complete',
    detail: 'Next.js 14 App Router with TypeScript strict mode, ESLint, Prettier, path aliases, and environment templates.',
  },
  {
    day: 'Day 2',
    date: '2026-05-26',
    title: 'Design system foundation',
    status: 'complete',
    detail: 'Tailwind CSS v3 + shadcn/ui + Radix UI. Design token system in tailwind.config.ts. Playfair Display (display) + Inter (body). Full typography scale in global CSS.',
  },
  {
    day: 'Day 3',
    date: '2026-05-27',
    title: 'Workspace shell',
    status: 'complete',
    detail: 'Collapsible sidebar with role-aware nav, sticky top navigation, and a responsive max-width page shell across all breakpoints.',
  },
  {
    day: 'Day 4',
    date: '2026-05-28',
    title: 'UI component library + Storybook',
    status: 'complete',
    detail: 'Button, Input, Textarea, Select, Checkbox, and Radio primitives documented with Storybook 8 stories and a11y addon.',
  },
  {
    day: 'Day 5',
    date: '2026-05-31',
    title: 'Extended UI components',
    status: 'complete',
    detail: 'Modal, Drawer, Dropdown, Toast (Sonner), Card, Badge, Avatar, Skeleton — all with Storybook stories.',
  },
  {
    day: 'Day 6',
    date: '2026-06-01',
    title: 'Authentication flows',
    status: 'complete',
    detail: 'Login and signup pages with magic-link and password auth via Supabase. Explicit error states for all failure cases.',
    href: '/login',
  },
  {
    day: 'Day 7',
    date: '2026-06-02',
    title: 'Protected routes + session persistence',
    status: 'complete',
    detail: 'Edge middleware redirects unauthenticated users to /login. Supabase browser client with autoRefreshToken and persistSession.',
  },
  {
    day: 'Day 8',
    date: '2026-06-03',
    title: 'Church onboarding wizard',
    status: 'complete',
    detail: '5-step wizard: church name + logo + denomination (merged step 1), contact, plan selection, review + confirm, done. React context state, progress bar, step-back navigation.',
    href: '/onboarding',
  },
  {
    day: 'Day 9',
    date: '2026-06-04',
    title: 'Plan selection, review step, profile settings',
    status: 'complete',
    detail: 'Plan selection step (Community/Growth/Enterprise), review + confirm step with Supabase insert, profile settings page with avatar upload and password change.',
    href: '/settings/profile',
  },
  {
    day: 'Day 10',
    date: '2026-06-05',
    title: 'Admin layout + role-aware navigation',
    status: 'complete',
    detail: 'AdminShell with dark sidebar, breadcrumbs, and top nav with logout. Role-aware menu — Finance hidden from non-finance roles. Active link highlighting. All ChMS routes scaffolded.',
  },
  {
    day: 'Day 11',
    date: '2026-06-06',
    title: 'Member Directory',
    status: 'complete',
    detail: 'Masonry photo-card grid with 2/3/4 column breakpoints. MemberCard with photo, status badge (Active/Inactive/Visitor), ministry tags, and role label. Live search and status filter. Members table SQL migration with RLS policies.',
    href: '/members',
  },
  {
    day: 'Day 12',
    date: '2026-06-07',
    title: 'Skeleton loading + API connection',
    status: 'complete',
    detail: 'Skeleton shimmer cards during load, GET /api/members with search/filter/pagination, debounced search, error banner with retry, Pagination component wired to directory.',
    href: '/members',
  },
  {
    day: 'Day 13',
    date: '2026-06-08',
    title: 'Meilisearch instant search',
    status: 'complete',
    detail: 'MemberSearchBar with 300ms debounce, fuzzy matching, highlighted matched terms from Meilisearch _formatted fields. /api/search/members endpoint with Meilisearch → Supabase → mock fallback chain. Soft-delete SQL migration.',
    href: '/members',
  },
  {
    day: 'Day 14',
    date: '2026-06-09',
    title: 'Member filter bar',
    status: 'complete',
    detail: 'Filter bar with Ministry dropdown (multi-select), Status pills, Age Group range, Join Date range picker, and Geographic Zone. Active filter count badge, chip summary, clear all. Filters combine with Meilisearch search. Household SQL migration.',
    href: '/members',
  },
  {
    day: 'Day 15',
    date: '2026-06-10',
    title: 'Member profile drawer',
    status: 'complete',
    detail: 'Slide-out profile drawer from member directory cards: header with photo, name, status badge, and quick actions (email, call, message, activate/deactivate); Info tab with contact, church details, ministry teams, and notes; Family & Household tab with one-click member navigation. Groups hierarchy table + member_groups assignment table SQL migration with RLS. POST/DELETE /api/members/groups for group assignment.',
    href: '/members',
  },
  {
    day: 'Day 16',
    date: '2026-06-11',
    title: 'Profile drawer — Timeline, Groups, Notes + enhanced quick actions',
    status: 'complete',
    detail: 'Three new drawer tabs: Timeline (chronological interactions, group joins, milestones), Groups (memberships with join dates, type labels, role badges), Notes (pastoral notes with inline compose form, visibility selector, optimistic add). Quick actions upgraded: WhatsApp (wa.me link), Add Note and Prayer Request (jump to Notes tab), Call (tel: link), Email (mailto:), Message, Activate/Deactivate.',
    href: '/members',
  },
  {
    day: 'Day 17',
    date: '2026-06-12',
    title: 'Add Member form',
    status: 'complete',
    detail: 'Full Add Member form in a slide-out drawer: photo upload (JPEG/PNG/WebP ≤ 2 MB), personal details, contact info + address, family/household linking, denomination custom fields, ministry assignment pill grid, pastoral notes. Zod schema + React Hook Form validation: required fields, email format, phone regex. POST /api/members with Supabase Storage photo upload and mock fallback. Add Member button wired into Member Directory.',
    href: '/members',
  },
  {
    day: 'Day 18',
    date: '2026-06-23',
    title: 'Edit Member form + Status change modal + Aging alerts',
    status: 'complete',
    detail: 'Shared MemberForm powers both Add and Edit (same Zod schema + fields); Edit pre-populates from GET /api/members/:id and saves via PUT (photo replace/remove, mock fallback). Member Status change modal shows current status, lists allowed transitions with a reason field, and requires a confirmation step for destructive (deactivate) changes — PATCH /api/members/:id/status records the transition in member_status_history and auto-resolves open alerts on re-activation. Aging-alert job (POST /api/jobs/aging-alerts → run_aging_alerts) populates member_alerts for stale visitors and dormant members. Edit + Change status wired into the profile drawer.',
    href: '/members',
  },
  {
    day: 'Day 19',
    date: '2026-06-24',
    title: 'Multi-select + bulk actions in member directory',
    status: 'complete',
    detail: 'Hover checkboxes on member cards, "Select all on this page" with indeterminate state, and a sliding bottom bulk-actions bar that appears when members are selected (selection persists across pages via an id→Member map). Bulk menus: Assign to Ministry (pill selector with add/replace modes → POST /api/members/bulk-ministries), Export Selected (dependency-free CSV download + print-to-PDF), and Send Message (composer pre-populated with recipient chips, SMS/Email channel, unreachable-recipient skipping → POST /api/members/messages via Twilio with mock fallback). Shared MINISTRIES list extracted to lib/ministries.ts.',
    href: '/members',
  },
  {
    day: 'Day 20',
    date: '2026-06-25',
    title: 'CSV import flow + standalone household view',
    status: 'complete',
    detail: 'Four-step CSV import wizard: Upload (dependency-free RFC-4180 parser), Map columns (auto-mapped by header name, required Email + name), Preview first 5 normalised rows with per-row validity, and Confirm (dry-run estimate of add/update/skip → commit). POST /api/members/import upserts by email with a dryRun mode and mock fallback. Standalone /households page: household cards listing every member with relationship badges (Head/Spouse/Child) and status dots, fetched from GET /api/households (real households table when populated, otherwise synthesised). Households added to the sidebar.',
    href: '/households',
  },
  {
    day: 'Day 21',
    date: '2026-06-26',
    title: 'Attendance page + session cards',
    status: 'complete',
    detail: 'Attendance page with a "Start New Session" composer (session-type selector — Sunday Service, Midweek, Sunday School, Special Event — optional title + date), an Active Sessions list and a Recent Sessions list. SessionCard shows type, date/time, a live (pulsing) check-in count badge, and contextual Start/End/Reopen buttons. attendance_sessions + attendance_records schema migrated with RLS and a count-sync trigger. GET/POST /api/attendance/sessions and PATCH /api/attendance/sessions/:id, with mock test sessions when Supabase is absent.',
    href: '/attendance',
  },
  {
    day: 'Day 22',
    date: '2026-06-27',
    title: 'QR code check-in scanner',
    status: 'complete',
    detail: 'QR scanner page (/attendance/scan): requests camera permission, renders a live preview, and scans for member QR codes 5×/second (every 200ms) with jsQR. A valid scan posts to POST /api/attendance/sessions/:id/checkin and plays a success animation (green flash + member photo + name + checkmark) for 2 seconds before resetting. Members carry a namespaced QR token (lib/qr); their printable check-in QR is generated with the qrcode library and shown in the profile drawer Info tab. Closes the loop: print QR from profile → scan on camera → attendance recorded.',
    href: '/attendance/scan',
  },
];

// ── Member types (Day 11) ─────────────────────────────────────────────────────

export type MemberStatus = 'active' | 'inactive' | 'visitor';

export type AgeGroup = 'child' | 'youth' | 'young_adult' | 'adult' | 'senior';

export type Member = {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  photoUrl?: string;
  status: MemberStatus;
  role: UserRole;
  ministries: string[];
  joinedDate: string;   // ISO date string YYYY-MM-DD
  ageGroup?: AgeGroup;  // Day 14
  zone?: string;        // Geographic zone — Day 14
  notes?: string;
};

// ── Mock member data — 20 realistic members for development ──────────────────

export const mockMembers: Member[] = [
  { id: 'm1',  fullName: 'Abena Mensah',       email: 'abena@elevanda.org',    phone: '+233 24 111 2233', status: 'active',   role: 'pastor',          ministries: ['Worship', 'Prayer'],             joinedDate: '2021-03-15', ageGroup: 'adult',       zone: 'North' },
  { id: 'm2',  fullName: 'Kwame Asante',        email: 'kwame@elevanda.org',    phone: '+233 20 234 5678', status: 'active',   role: 'ministry_leader', ministries: ['Youth', 'Evangelism'],           joinedDate: '2020-08-22', ageGroup: 'young_adult', zone: 'South' },
  { id: 'm3',  fullName: 'Ama Boateng',         email: 'ama@elevanda.org',      phone: '+233 26 345 6789', status: 'active',   role: 'staff',           ministries: ['Children', 'Admin'],             joinedDate: '2022-01-10', ageGroup: 'adult',       zone: 'East' },
  { id: 'm4',  fullName: 'Kofi Owusu',          email: 'kofi@elevanda.org',     phone: '+233 55 456 7890', status: 'visitor',  role: 'member',          ministries: [],                                joinedDate: '2024-04-01', ageGroup: 'youth',       zone: 'West' },
  { id: 'm5',  fullName: 'Efua Darko',          email: 'efua@elevanda.org',     phone: '+233 24 567 8901', status: 'active',   role: 'finance',         ministries: ['Finance', 'Admin'],              joinedDate: '2019-11-30', ageGroup: 'senior',      zone: 'North' },
  { id: 'm6',  fullName: 'Yaw Appiah',          email: 'yaw@elevanda.org',      phone: '+233 20 678 9012', status: 'active',   role: 'ministry_leader', ministries: ["Men's Ministry", 'Evangelism'],  joinedDate: '2021-06-18', ageGroup: 'adult',       zone: 'Central' },
  { id: 'm7',  fullName: 'Akosua Frimpong',     email: 'akosua@elevanda.org',   phone: '+233 26 789 0123', status: 'inactive', role: 'member',          ministries: ["Women's Ministry"],              joinedDate: '2018-02-14', ageGroup: 'senior',      zone: 'South' },
  { id: 'm8',  fullName: 'Nana Ama Tetteh',     email: 'nana@elevanda.org',     phone: '+233 55 890 1234', status: 'active',   role: 'staff',           ministries: ['Ushering', 'Hospitality'],       joinedDate: '2023-07-05', ageGroup: 'young_adult', zone: 'East' },
  { id: 'm9',  fullName: 'Kwabena Adjei',       email: 'kwabena@elevanda.org',  phone: '+233 24 901 2345', status: 'active',   role: 'member',          ministries: ['Choir', 'Worship'],              joinedDate: '2022-09-12', ageGroup: 'adult',       zone: 'West' },
  { id: 'm10', fullName: 'Adwoa Osei',          email: 'adwoa@elevanda.org',    phone: '+233 20 012 3456', status: 'visitor',  role: 'member',          ministries: [],                                joinedDate: '2024-05-20', ageGroup: 'youth',       zone: 'North' },
  { id: 'm11', fullName: 'Ekow Hammond',        email: 'ekow@elevanda.org',     phone: '+233 26 123 4567', status: 'active',   role: 'admin',           ministries: ['Leadership', 'Admin'],           joinedDate: '2017-01-01', ageGroup: 'adult',       zone: 'Central' },
  { id: 'm12', fullName: 'Maame Serwaa',        email: 'maame@elevanda.org',    phone: '+233 55 234 5678', status: 'active',   role: 'member',          ministries: ["Women's Ministry", 'Prayer'],    joinedDate: '2021-12-03', ageGroup: 'adult',       zone: 'South' },
  { id: 'm13', fullName: 'Fiifi Barimah',       email: 'fiifi@elevanda.org',    phone: '+233 24 345 6789', status: 'inactive', role: 'member',          ministries: ['Youth'],                         joinedDate: '2020-04-17', ageGroup: 'youth',       zone: 'East' },
  { id: 'm14', fullName: 'Esi Kyere',           email: 'esi@elevanda.org',      phone: '+233 20 456 7890', status: 'active',   role: 'ministry_leader', ministries: ['Children', 'Sunday School'],     joinedDate: '2019-08-25', ageGroup: 'young_adult', zone: 'West' },
  { id: 'm15', fullName: 'Kweku Annan',         email: 'kweku@elevanda.org',    phone: '+233 26 567 8901', status: 'active',   role: 'staff',           ministries: ['Media', 'Tech'],                 joinedDate: '2022-03-30', ageGroup: 'young_adult', zone: 'North' },
  { id: 'm16', fullName: 'Abeba Asiedu',        email: 'abeba@elevanda.org',    phone: '+233 55 678 9012', status: 'visitor',  role: 'member',          ministries: [],                                joinedDate: '2024-06-07', ageGroup: 'adult',       zone: 'Central' },
  { id: 'm17', fullName: 'Kojo Dankwa',         email: 'kojo@elevanda.org',     phone: '+233 24 789 0123', status: 'active',   role: 'member',          ministries: ['Choir', 'Worship'],              joinedDate: '2023-01-14', ageGroup: 'young_adult', zone: 'South' },
  { id: 'm18', fullName: 'Akua Gyamfi',         email: 'akua@elevanda.org',     phone: '+233 20 890 1234', status: 'active',   role: 'ministry_leader', ministries: ['Prayer', 'Intercession'],        joinedDate: '2020-10-09', ageGroup: 'adult',       zone: 'East' },
  { id: 'm19', fullName: 'Nii Teye Lartey',     email: 'nii@elevanda.org',      phone: '+233 26 901 2345', status: 'active',   role: 'finance',         ministries: ['Finance', 'Stewardship'],        joinedDate: '2021-05-22', ageGroup: 'senior',      zone: 'West' },
  { id: 'm20', fullName: 'Afia Boadu',          email: 'afia@elevanda.org',     phone: '+233 55 012 3456', status: 'inactive', role: 'member',          ministries: ["Women's Ministry"],              joinedDate: '2019-03-11', ageGroup: 'senior',      zone: 'Central' },
];

// ── Team pulse (populated from database in a later sprint) ───────────────────

export const teamPulse: { name: string; role: string; update: string }[] = [];

// ── Task board ────────────────────────────────────────────────────────────────

export const taskBoard = [
  {
    lane: 'Done',
    item: 'Timeline tab — chronological interactions, group joins, prayer requests, milestones.',
  },
  {
    lane: 'Done',
    item: 'Groups tab — memberships with join dates, type labels, and role badges (Leader/Co-leader/Member).',
  },
  {
    lane: 'Done',
    item: 'Notes tab — pastoral notes list with inline compose, visibility selector, optimistic add.',
  },
  {
    lane: 'Done',
    item: 'Quick actions upgraded: WhatsApp, Add Note, Prayer Request, Call, Email, Message.',
  },
  {
    lane: 'Next up',
    item: 'Configure NEXT_PUBLIC_SUPABASE_URL + ANON_KEY and run migrations (members, households, groups).',
  },
  {
    lane: 'Next up',
    item: 'Day 17 — CSV member import with 50-row test file and summary report.',
  },
];

// ── Quick links ───────────────────────────────────────────────────────────────

export const quickLinks = [
  { label: 'Register a church', href: '/onboarding',        description: 'Run the 6-step church registration wizard.' },
  { label: 'Profile settings',  href: '/settings/profile',  description: 'Update your name, photo, and password.' },
  { label: 'Sign in',           href: '/login',              description: 'Access your workspace with magic link or password.' },
];
