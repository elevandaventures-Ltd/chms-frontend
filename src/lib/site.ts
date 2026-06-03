export type UserRole = 'admin' | 'manager' | 'member';

export type SidebarItem = {
  label: string;
  href: string;
  icon: string;
  roles: UserRole[];
};

export type TeamMember = {
  name: string;
  role: UserRole;
  title: string;
  initials: string;
};

export type NotificationItem = {
  title: string;
  detail: string;
  time: string;
  unread?: boolean;
};

export const currentUser: TeamMember = {
  name: 'Solomon Leek',
  role: 'manager',
  title: 'Project Lead',
  initials: 'SL',
};

export const notifications: NotificationItem[] = [
  {
    title: 'Day 8 wizard is live',
    detail: 'Church onboarding wizard is available at /onboarding.',
    time: 'Just now',
    unread: true,
  },
  {
    title: 'Protected routes active',
    detail: 'Middleware now redirects unauthenticated users to /login.',
    time: '1d ago',
    unread: true,
  },
  {
    title: 'Supabase session persistence',
    detail: 'Auto token refresh and localStorage persistence are wired up.',
    time: '2d ago',
    unread: false,
  },
];

export const sidebarItems: SidebarItem[] = [
  { label: 'Overview',  href: '#overview',  icon: 'overview',  roles: ['admin', 'manager', 'member'] },
  { label: 'Progress',  href: '#progress',  icon: 'progress',  roles: ['admin', 'manager'] },
  { label: 'Team',      href: '#team',      icon: 'team',      roles: ['admin', 'manager'] },
  { label: 'Tasks',     href: '#tasks',     icon: 'tasks',     roles: ['admin', 'manager', 'member'] },
  { label: 'Reports',   href: '#reports',   icon: 'reports',   roles: ['admin'] },
];

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
    detail: 'Modal, Drawer, Dropdown, Toast (Sonner), Card, Badge, Avatar, and Skeleton components — all with Storybook stories.',
  },
  {
    day: 'Day 6',
    date: '2026-06-02',
    title: 'Authentication flows',
    status: 'complete',
    detail: 'Login and signup pages with magic-link and password auth, Supabase client integration, and explicit error states.',
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
    detail: '5-step wizard: church name + logo upload, denomination selector, contact + address, review, and confirmation. React context state, animated progress bar, step-back navigation.',
    href: '/onboarding',
  },
];

export const teamPulse: { name: string; role: string; update: string }[] = [];
// Day 9 — member management (invite flow, role assignment, member list) will populate this.

export const taskBoard = [
  {
    lane: 'Done',
    item: 'Church onboarding wizard — all 5 steps complete and pushed.',
  },
  {
    lane: 'Done',
    item: 'Protected route middleware with Supabase session cookie validation.',
  },
  {
    lane: 'Next up',
    item: 'Add NEXT_PUBLIC_SUPABASE_URL + ANON_KEY to .env.local and run the churches table migration.',
  },
  {
    lane: 'Next up',
    item: 'Day 9 — member management: invite flow, role assignment, and member list.',
  },
];

export const quickLinks = [
  { label: 'Start onboarding',  href: '/onboarding', description: 'Register a new church through the 5-step wizard.' },
  { label: 'Sign in',           href: '/login',       description: 'Access your workspace with magic link or password.' },
  { label: 'Sign up',           href: '/signup',      description: 'Create a new workspace account.' },
];
