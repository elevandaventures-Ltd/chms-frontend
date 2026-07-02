import Link from 'next/link';
import {
  Users, CalendarCheck, CalendarDays, MessageSquare,
  Landmark, Settings, Church, UserCircle, LogIn,
  ArrowRight, Bell,
} from 'lucide-react';
import * as site from '@/lib/site';
import PageShell from '@/components/PageShell';
import Sidebar from '@/components/Sidebar';
import TopNav from '@/components/TopNav';

// ── Navigation sections shown on the dashboard ────────────────────────────────

const NAV_SECTIONS = [
  {
    id:    'people',
    label: 'People',
    links: [
      { href: '/members',    label: 'Members',    desc: 'Directory, profiles, groups and households.', icon: <Users size={20} /> },
      { href: '/households', label: 'Households', desc: 'Family units and member relationships.',         icon: <Church size={20} /> },
    ],
  },
  {
    id:    'ministry',
    label: 'Ministry',
    links: [
      { href: '/attendance', label: 'Attendance',    desc: 'Sessions, QR check-in, kiosk mode, kids church.', icon: <CalendarCheck size={20} /> },
      { href: '/events',     label: 'Events',        desc: 'Calendar, RSVP, recurring events, resources.',    icon: <CalendarDays  size={20} /> },
      { href: '/communication', label: 'Communication', desc: 'Email and SMS messaging to members.',           icon: <MessageSquare size={20} /> },
    ],
  },
  {
    id:    'admin',
    label: 'Administration',
    links: [
      { href: '/finance',          label: 'Finance',          desc: 'Giving records, budgets, reports.',   icon: <Landmark    size={20} /> },
      { href: '/settings',         label: 'Settings',         desc: 'Roles, system configuration.',         icon: <Settings    size={20} /> },
      { href: '/settings/profile', label: 'Profile',          desc: 'Your name, photo, and password.',      icon: <UserCircle  size={20} /> },
    ],
  },
  {
    id:    'setup',
    label: 'Get started',
    links: [
      { href: '/onboarding', label: 'Register a church', desc: 'Run the 5-step church registration wizard.', icon: <Church  size={20} /> },
      { href: '/login',      label: 'Sign in',           desc: 'Magic link or password authentication.',      icon: <LogIn   size={20} /> },
    ],
  },
] as const;

export default function HomePage() {
  return (
    <PageShell
      sidebar={<Sidebar items={site.sidebarItems} />}
      topNav={
        <TopNav
          notifications={site.notifications}
          title="Dashboard"
          subtitle="Elevanda Church Management System"
        />
      }
    >
      {/* ── Hero ── */}
      <section className="hero" id="overview" aria-label="Dashboard overview">
        <div className="hero-copy">
          <p className="eyebrow">Elevanda ChMS</p>
          <h2>Your church, organised.</h2>
          <p className="lede">
            Manage members, track attendance, run events, and communicate
            with your congregation — all from one place.
          </p>
        </div>

        <div className="hero-panel">
          <p className="panel-label">
            <Bell size={13} aria-hidden="true" style={{ display: 'inline', marginRight: 6 }} />
            Recent activity
          </p>
          <ul className="notification-list">
            {site.notifications.map((n) => (
              <li key={n.title}>
                <strong>{n.title}</strong>
                <div>{n.detail}</div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Navigation sections ── */}
      {NAV_SECTIONS.map((section) => (
        <section key={section.id} aria-labelledby={`nav-${section.id}`}>
          <h2 className="dash-section-title" id={`nav-${section.id}`}>
            {section.label}
          </h2>
          <div className="dash-nav-grid">
            {section.links.map((link) => (
              <Link key={link.href} href={link.href} className="dash-nav-card">
                <span className="dash-nav-card__icon" aria-hidden="true">
                  {link.icon}
                </span>
                <div className="dash-nav-card__copy">
                  <h3 className="dash-nav-card__title">{link.label}</h3>
                  <p className="dash-nav-card__desc">{link.desc}</p>
                </div>
                <ArrowRight size={16} className="dash-nav-card__arrow" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>
      ))}
    </PageShell>
  );
}
