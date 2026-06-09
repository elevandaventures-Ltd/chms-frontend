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
    href: '/',
    icon: 'dashboard',
    roles: ['admin', 'pastor', 'finance', 'ministry_leader', 'staff', 'member'],
  },
  {
    label: 'Members',
    href: '/members',
    icon: 'members',
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
];

// ── Member types (Day 11) ─────────────────────────────────────────────────────

export type MemberStatus = 'active' | 'inactive' | 'visitor';

export type Member = {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  photoUrl?: string;
  status: MemberStatus;
  role: UserRole;
  ministries: string[];
  joinedDate: string; // ISO date string
  notes?: string;
};

// ── Mock member data — 20 realistic members for development ──────────────────

export const mockMembers: Member[] = [
  { id: 'm1',  fullName: 'Abena Mensah',       email: 'abena@elevanda.org',    phone: '+233 24 111 2233', status: 'active',   role: 'pastor',          ministries: ['Worship', 'Prayer'],              joinedDate: '2021-03-15' },
  { id: 'm2',  fullName: 'Kwame Asante',        email: 'kwame@elevanda.org',    phone: '+233 20 234 5678', status: 'active',   role: 'ministry_leader', ministries: ['Youth', 'Evangelism'],            joinedDate: '2020-08-22' },
  { id: 'm3',  fullName: 'Ama Boateng',         email: 'ama@elevanda.org',      phone: '+233 26 345 6789', status: 'active',   role: 'staff',           ministries: ['Children', 'Admin'],              joinedDate: '2022-01-10' },
  { id: 'm4',  fullName: 'Kofi Owusu',          email: 'kofi@elevanda.org',     phone: '+233 55 456 7890', status: 'visitor',  role: 'member',          ministries: [],                                 joinedDate: '2024-04-01' },
  { id: 'm5',  fullName: 'Efua Darko',          email: 'efua@elevanda.org',     phone: '+233 24 567 8901', status: 'active',   role: 'finance',         ministries: ['Finance', 'Admin'],               joinedDate: '2019-11-30' },
  { id: 'm6',  fullName: 'Yaw Appiah',          email: 'yaw@elevanda.org',      phone: '+233 20 678 9012', status: 'active',   role: 'ministry_leader', ministries: ['Men\'s Ministry', 'Evangelism'],  joinedDate: '2021-06-18' },
  { id: 'm7',  fullName: 'Akosua Frimpong',     email: 'akosua@elevanda.org',   phone: '+233 26 789 0123', status: 'inactive', role: 'member',          ministries: ['Women\'s Ministry'],              joinedDate: '2018-02-14' },
  { id: 'm8',  fullName: 'Nana Ama Tetteh',     email: 'nana@elevanda.org',     phone: '+233 55 890 1234', status: 'active',   role: 'staff',           ministries: ['Ushering', 'Hospitality'],        joinedDate: '2023-07-05' },
  { id: 'm9',  fullName: 'Kwabena Adjei',       email: 'kwabena@elevanda.org',  phone: '+233 24 901 2345', status: 'active',   role: 'member',          ministries: ['Choir', 'Worship'],               joinedDate: '2022-09-12' },
  { id: 'm10', fullName: 'Adwoa Osei',          email: 'adwoa@elevanda.org',    phone: '+233 20 012 3456', status: 'visitor',  role: 'member',          ministries: [],                                 joinedDate: '2024-05-20' },
  { id: 'm11', fullName: 'Ekow Hammond',        email: 'ekow@elevanda.org',     phone: '+233 26 123 4567', status: 'active',   role: 'admin',           ministries: ['Leadership', 'Admin'],            joinedDate: '2017-01-01' },
  { id: 'm12', fullName: 'Maame Serwaa',        email: 'maame@elevanda.org',    phone: '+233 55 234 5678', status: 'active',   role: 'member',          ministries: ['Women\'s Ministry', 'Prayer'],    joinedDate: '2021-12-03' },
  { id: 'm13', fullName: 'Fiifi Barimah',       email: 'fiifi@elevanda.org',    phone: '+233 24 345 6789', status: 'inactive', role: 'member',          ministries: ['Youth'],                          joinedDate: '2020-04-17' },
  { id: 'm14', fullName: 'Esi Kyere',           email: 'esi@elevanda.org',      phone: '+233 20 456 7890', status: 'active',   role: 'ministry_leader', ministries: ['Children', 'Sunday School'],      joinedDate: '2019-08-25' },
  { id: 'm15', fullName: 'Kweku Annan',         email: 'kweku@elevanda.org',    phone: '+233 26 567 8901', status: 'active',   role: 'staff',           ministries: ['Media', 'Tech'],                  joinedDate: '2022-03-30' },
  { id: 'm16', fullName: 'Abeba Asiedu',        email: 'abeba@elevanda.org',    phone: '+233 55 678 9012', status: 'visitor',  role: 'member',          ministries: [],                                 joinedDate: '2024-06-07' },
  { id: 'm17', fullName: 'Kojo Dankwa',         email: 'kojo@elevanda.org',     phone: '+233 24 789 0123', status: 'active',   role: 'member',          ministries: ['Choir', 'Worship'],               joinedDate: '2023-01-14' },
  { id: 'm18', fullName: 'Akua Gyamfi',         email: 'akua@elevanda.org',     phone: '+233 20 890 1234', status: 'active',   role: 'ministry_leader', ministries: ['Prayer', 'Intercession'],         joinedDate: '2020-10-09' },
  { id: 'm19', fullName: 'Nii Teye Lartey',     email: 'nii@elevanda.org',      phone: '+233 26 901 2345', status: 'active',   role: 'finance',         ministries: ['Finance', 'Stewardship'],         joinedDate: '2021-05-22' },
  { id: 'm20', fullName: 'Afia Boadu',          email: 'afia@elevanda.org',     phone: '+233 55 012 3456', status: 'inactive', role: 'member',          ministries: ['Women\'s Ministry'],              joinedDate: '2019-03-11' },
];

// ── Team pulse (populated from database in a later sprint) ───────────────────

export const teamPulse: { name: string; role: string; update: string }[] = [];

// ── Task board ────────────────────────────────────────────────────────────────

export const taskBoard = [
  {
    lane: 'Done',
    item: 'Member Directory with skeleton loading, API, search, filter and pagination.',
  },
  {
    lane: 'Done',
    item: 'Admin layout with role-aware sidebar, breadcrumbs, and logout.',
  },
  {
    lane: 'Next up',
    item: 'Configure NEXT_PUBLIC_SUPABASE_URL + ANON_KEY and run the members migration.',
  },
  {
    lane: 'Next up',
    item: 'Day 13 — Member profile page with Tabs, edit form, attendance history.',
  },
];

// ── Quick links ───────────────────────────────────────────────────────────────

export const quickLinks = [
  { label: 'Register a church', href: '/onboarding',        description: 'Run the 6-step church registration wizard.' },
  { label: 'Profile settings',  href: '/settings/profile',  description: 'Update your name, photo, and password.' },
  { label: 'Sign in',           href: '/login',              description: 'Access your workspace with magic link or password.' },
];
