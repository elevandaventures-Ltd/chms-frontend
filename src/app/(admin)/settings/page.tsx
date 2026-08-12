import Link from 'next/link';
import { User, Shield, Bell, Church, Plug, Database, ChevronRight, Users, Palette, Settings2, ScrollText, ListChecks } from 'lucide-react';

const SETTINGS_SECTIONS = [
  {
    title: 'Account',
    items: [
      { href: '/settings/profile', label: 'Profile', desc: 'Update your name, photo, and password.', icon: <User size={20} strokeWidth={1.5} />, live: true },
    ],
  },
  {
    title: 'Church',
    items: [
      { href: '/onboarding', label: 'Church profile', desc: 'Edit your church name, denomination, and contact details.', icon: <Church size={20} strokeWidth={1.5} />, live: true },
      { href: '/settings/branding', label: 'Branding', desc: 'Logo, accent color, and welcome message — with a live preview.', icon: <Palette size={20} strokeWidth={1.5} />, live: true },
      { href: '/settings/general', label: 'General', desc: 'Denomination, timezone, currency, and language.', icon: <Settings2 size={20} strokeWidth={1.5} />, live: true },
      { href: '/settings/team', label: 'Team', desc: 'Invite staff and manage their roles.', icon: <Users size={20} strokeWidth={1.5} />, live: true },
      { href: '/settings/permissions', label: 'Roles & permissions', desc: 'See what each of the 6 roles can access.', icon: <Shield size={20} strokeWidth={1.5} />, live: true },
      { href: '/settings/custom-fields', label: 'Custom fields', desc: 'Add denomination-specific fields to member profiles.', icon: <ListChecks size={20} strokeWidth={1.5} />, live: true },
    ],
  },
  {
    title: 'Notifications',
    items: [
      { href: '/settings/notifications', label: 'Notification preferences', desc: 'Choose which updates you receive, and on which channel.', icon: <Bell size={20} strokeWidth={1.5} />, live: true },
    ],
  },
  {
    title: 'Integrations & Data',
    items: [
      { href: '#', label: 'Integrations', desc: 'Connect Twilio, Mailgun, Meilisearch, and other services.', icon: <Plug size={20} strokeWidth={1.5} />, live: false },
      { href: '/settings/audit-log', label: 'Audit log', desc: 'Every change made in this church, with before/after detail.', icon: <ScrollText size={20} strokeWidth={1.5} />, live: true },
      { href: '/settings/data-export', label: 'Data & exports', desc: 'Download members, households, attendance, events, and giving as CSV.', icon: <Database size={20} strokeWidth={1.5} />, live: true },
    ],
  },
];

export default function SettingsPage() {
  return (
    <div className="settings-page">
      {SETTINGS_SECTIONS.map((section) => (
        <section key={section.title} className="settings-section">
          <h2 className="settings-section__title">{section.title}</h2>
          <div className="settings-list">
            {section.items.map((item) =>
              item.live ? (
                <Link key={item.label} href={item.href} className="settings-row">
                  <span className="settings-row__icon">{item.icon}</span>
                  <div className="settings-row__copy">
                    <strong>{item.label}</strong>
                    <p>{item.desc}</p>
                  </div>
                  <ChevronRight size={16} className="settings-row__arrow" />
                </Link>
              ) : (
                <div key={item.label} className="settings-row settings-row--soon">
                  <span className="settings-row__icon">{item.icon}</span>
                  <div className="settings-row__copy">
                    <strong>{item.label}</strong>
                    <p>{item.desc}</p>
                  </div>
                  <span className="settings-row__badge">Soon</span>
                </div>
              )
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
