import Link from 'next/link';
import { User, Shield, Bell, Church, Plug, Database, ChevronRight } from 'lucide-react';

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
      { href: '#', label: 'Roles & permissions', desc: 'Assign admin, pastor, finance, and staff roles to members.', icon: <Shield size={20} strokeWidth={1.5} />, live: false },
    ],
  },
  {
    title: 'Notifications',
    items: [
      { href: '#', label: 'Notification preferences', desc: 'Email and in-app notification settings.', icon: <Bell size={20} strokeWidth={1.5} />, live: false },
    ],
  },
  {
    title: 'Integrations & Data',
    items: [
      { href: '#', label: 'Integrations', desc: 'Connect Twilio, Mailgun, Meilisearch, and other services.', icon: <Plug size={20} strokeWidth={1.5} />, live: false },
      { href: '#', label: 'Data & exports', desc: 'Export member data, attendance records, and financial reports.', icon: <Database size={20} strokeWidth={1.5} />, live: false },
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
