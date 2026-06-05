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
    date: '2026-06-02',
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
    detail: '6-step wizard: identity, denomination, contact, plan selection, review + confirm, done. React context state, progress bar, step-back navigation.',
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
    day: 'Day 10',
    date: '2026-06-05',
    title: 'Admin layout with role-aware navigation',
    status: 'complete',
    detail: 'AdminShell with dark sidebar, active link highlighting, breadcrumbs, Finance hidden for non-finance roles, logout button in top nav, and placeholder pages for all ChMS routes.',
  },
];

// ── Team pulse (populated from database in a later sprint) ───────────────────

export const teamPulse: { name: string; role: string; update: string }[] = [];

// ── Task board ────────────────────────────────────────────────────────────────

export const taskBoard = [
  {
    lane: 'Done',
    item: 'Admin layout with role-aware sidebar, breadcrumbs, and logout.',
  },
  {
    lane: 'Done',
    item: '6-step church onboarding wizard with plan selection.',
  },
  {
    lane: 'Next up',
    item: 'Configure NEXT_PUBLIC_SUPABASE_URL + ANON_KEY and run migrations.',
  },
  {
    lane: 'Next up',
    item: 'Day 11 — Member directory with DataTable, search, and filters.',
  },
];

// ── Quick links ───────────────────────────────────────────────────────────────

export const quickLinks = [
  { label: 'Register a church', href: '/onboarding',        description: 'Run the 6-step church registration wizard.' },
  { label: 'Profile settings',  href: '/settings/profile',  description: 'Update your name, photo, and password.' },
  { label: 'Sign in',           href: '/login',              description: 'Access your workspace with magic link or password.' },
];
