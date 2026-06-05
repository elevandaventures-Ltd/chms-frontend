import AdminShell from '@/components/AdminShell';
import Link from 'next/link';
import { User, Shield, Bell } from 'lucide-react';

export default function SettingsPage() {
  return (
    <AdminShell title="Settings" subtitle="System configuration — admin only">
      <div className="settings-grid">
        <Link href="/settings/profile" className="settings-card">
          <span className="settings-card__icon"><User size={22} strokeWidth={1.5} /></span>
          <h3>Profile</h3>
          <p>Update your name, photo, and password.</p>
        </Link>
        <div className="settings-card settings-card--soon">
          <span className="settings-card__icon"><Shield size={22} strokeWidth={1.5} /></span>
          <h3>Roles &amp; permissions</h3>
          <p>RBAC configuration coming in Day 10.</p>
        </div>
        <div className="settings-card settings-card--soon">
          <span className="settings-card__icon"><Bell size={22} strokeWidth={1.5} /></span>
          <h3>Notifications</h3>
          <p>Email and in-app notification preferences.</p>
        </div>
      </div>
    </AdminShell>
  );
}
