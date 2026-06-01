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
    title: 'Sprint review at 3:00 PM',
    detail: 'Prepare the foundation walkthrough for the new shell.',
    time: '5m ago',
    unread: true,
  },
  {
    title: 'Layout QA pending',
    detail: 'Verify sidebar, top bar, and page shell across breakpoints.',
    time: '24m ago',
    unread: true,
  },
  {
    title: 'JWT decoded in API logs',
    detail: 'Signin payload is now visible in the server terminal during auth tests.',
    time: '1h ago',
    unread: false,
  },
];

export const sidebarItems: SidebarItem[] = [
  { label: 'Overview', href: '#overview', icon: '◌', roles: ['admin', 'manager', 'member'] },
  { label: 'Projects', href: '#projects', icon: '▣', roles: ['admin', 'manager'] },
  { label: 'Team', href: '#team', icon: '✦', roles: ['admin', 'manager'] },
  { label: 'Tasks', href: '#tasks', icon: '↳', roles: ['admin', 'manager', 'member'] },
  { label: 'Reports', href: '#reports', icon: '▤', roles: ['admin'] },
];

export const setupChecklist: string[] = [
  'Next.js 14 App Router',
  'TypeScript strict mode',
  'ESLint + Prettier',
  'Absolute path aliases',
  'Environment template',
];

export const setupHighlights = [
  {
    title: 'Role-aware sidebar',
    description:
      'Navigation items filter by user role and collapse into a compact rail on smaller screens.',
  },
  {
    title: 'Top navigation shell',
    description:
      'The header keeps the avatar, notifications, and quick actions visible without crowding content.',
  },
  {
    title: 'Responsive page shell',
    description:
      'The main container stays centered and adapts cleanly from mobile through desktop widths.',
  },
];

export const projectMilestones = [
  {
    title: 'Dashboard shell hardening',
    status: 'In progress',
    detail: 'Polish sticky navigation behavior and complete section anchors for all sidebar links.',
  },
  {
    title: 'Storybook adoption',
    status: 'Ready for review',
    detail: 'Document core UI controls and state variants so product and engineering can validate faster.',
  },
];

export const teamPulse = [
  {
    name: 'Amina Choi',
    role: 'Product Design',
    update: 'Finalizing responsive nav spacing and interaction states.',
  },
  {
    name: 'Jay Mensah',
    role: 'Frontend',
    update: 'Connecting form primitives into Storybook stories and docs.',
  },
];

export const taskBoard = [
  {
    lane: 'Today',
    item: 'Audit mobile layout at 768px and 1024px breakpoints.',
  },
  {
    lane: 'Next up',
    item: 'Add CI workflow for typecheck, app build, and Storybook build.',
  },
];
