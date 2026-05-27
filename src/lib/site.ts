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

export const currentUser: TeamMember = {
  name: 'Solomon Leek',
  role: 'manager',
  title: 'Project Lead',
  initials: 'SL',
};

export const notifications = [
  {
    title: 'Sprint review at 3:00 PM',
    detail: 'Prepare the foundation walkthrough for the new shell.',
  },
  {
    title: 'Layout QA pending',
    detail: 'Verify sidebar, top bar, and page shell across breakpoints.',
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
