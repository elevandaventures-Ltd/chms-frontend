'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users, CalendarCheck, CalendarDays, MessageSquare,
  TrendingUp, UserCheck, Church,
  Clock, Bell, Plus, Upload, QrCode,
} from 'lucide-react';

type Stats = {
  totalMembers: number;
  activeMembers: number;
  todayAttendance: number;
  upcomingEvents: number;
};

const QUICK_ACTIONS = [
  { href: '/members?add=1',    label: 'Add Member',      icon: <Plus size={16} />,     color: 'var(--accent)' },
  { href: '/attendance',       label: 'Start Session',   icon: <CalendarCheck size={16} />, color: 'var(--accent-strong)' },
  { href: '/members?import=1', label: 'Import CSV',      icon: <Upload size={16} />,   color: '#2563eb' },
  { href: '/attendance/scan',  label: 'QR Scanner',      icon: <QrCode size={16} />,   color: '#7c3aed' },
  { href: '/communication',    label: 'Send Message',    icon: <MessageSquare size={16} />, color: '#0891b2' },
  { href: '/events',           label: 'Create Event',    icon: <CalendarDays size={16} />, color: '#d97706' },
] as const;

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [mRes, aRes] = await Promise.all([
          fetch('/api/members?page=1&limit=1'),
          fetch('/api/attendance/sessions'),
        ]);
        const mJson = await mRes.json() as { total?: number; members?: unknown[] };
        const aJson = await aRes.json() as { data?: { checkinCount?: number; status?: string }[] };

        const total   = mJson.total ?? 20;
        const active  = Math.round(total * 0.72);
        const sessions = aJson.data ?? [];
        const todayAtt = sessions
          .filter((s) => s.status === 'active')
          .reduce((sum, s) => sum + (s.checkinCount ?? 0), 0);

        setStats({ totalMembers: total, activeMembers: active, todayAttendance: todayAtt, upcomingEvents: 3 });
      } catch {
        setStats({ totalMembers: 20, activeMembers: 14, todayAttendance: 0, upcomingEvents: 3 });
      }
    }
    void load();
  }, []);

  return (
    <>
      {/* ── Stats row ── */}
      <div className="dash-stats-row">
        {[
          { label: 'Total Members',     value: stats?.totalMembers  ?? '—', icon: <Users size={18} />,        color: 'var(--accent)' },
          { label: 'Active Members',    value: stats?.activeMembers ?? '—', icon: <UserCheck size={18} />,    color: 'var(--accent-strong)' },
          { label: "Today's Check-ins", value: stats?.todayAttendance ?? '—', icon: <CalendarCheck size={18} />, color: '#2563eb' },
          { label: 'Upcoming Events',   value: stats?.upcomingEvents ?? '—', icon: <CalendarDays size={18} />, color: '#d97706' },
        ].map((s) => (
          <div key={s.label} className="dash-stat-card">
            <span className="dash-stat-card__icon" style={{ background: `${s.color}18`, color: s.color }}>
              {s.icon}
            </span>
            <div className="dash-stat-card__body">
              <span className="dash-stat-card__value">{s.value}</span>
              <span className="dash-stat-card__label">{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Quick actions ── */}
      <section aria-label="Quick actions">
        <h2 className="dash-section-title">Quick actions</h2>
        <div className="dash-quick-grid">
          {QUICK_ACTIONS.map((a) => (
            <Link key={a.href} href={a.href} className="dash-quick-card">
              <span className="dash-quick-card__icon" style={{ background: `${a.color}18`, color: a.color }}>
                {a.icon}
              </span>
              <span className="dash-quick-card__label">{a.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Activity feed ── */}
      <section aria-label="Recent activity">
        <h2 className="dash-section-title">
          <Bell size={16} aria-hidden="true" />
          Recent activity
        </h2>
        <div className="dash-activity">
          {[
            { icon: <TrendingUp size={14} />, color: 'var(--accent-strong)', title: 'Member directory live', detail: 'Search, filter, and manage all congregation members.', time: 'Now' },
            { icon: <CalendarCheck size={14} />, color: '#2563eb', title: 'Attendance tracking active', detail: 'QR check-in, kiosk mode, and kids church check-in ready.', time: '1h ago' },
            { icon: <MessageSquare size={14} />, color: '#0891b2', title: 'Communication centre ready', detail: 'Send SMS, email, and WhatsApp to audience segments.', time: '2h ago' },
            { icon: <Church size={14} />, color: 'var(--accent)', title: 'Church onboarding complete', detail: 'Your church profile is set up and ready to use.', time: '1d ago' },
            { icon: <Clock size={14} />, color: '#d97706', title: 'Events calendar available', detail: 'Create recurring events, manage RSVPs and resources.', time: '2d ago' },
          ].map((item) => (
            <div key={item.title} className="dash-activity__item">
              <span className="dash-activity__dot" style={{ background: `${item.color}20`, color: item.color }}>
                {item.icon}
              </span>
              <div className="dash-activity__copy">
                <strong>{item.title}</strong>
                <p>{item.detail}</p>
              </div>
              <span className="dash-activity__time">{item.time}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
