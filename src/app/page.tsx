import Link from 'next/link';
import { CheckCircle2, Clock, Circle, ArrowRight, Users } from 'lucide-react';
import * as site from '@/lib/site';
import PageShell from '@/components/PageShell';
import Sidebar from '@/components/Sidebar';
import TopNav from '@/components/TopNav';

const STATUS_ICON: Record<site.DayEntry['status'], React.ReactNode> = {
  'complete':    <CheckCircle2 size={13} aria-hidden="true" />,
  'in-progress': <Clock        size={13} aria-hidden="true" />,
  'upcoming':    <Circle       size={13} aria-hidden="true" />,
};

const STATUS_LABEL: Record<site.DayEntry['status'], string> = {
  'complete':    'Complete',
  'in-progress': 'In progress',
  'upcoming':    'Upcoming',
};

const STATUS_COLOR: Record<site.DayEntry['status'], string> = {
  'complete':    'var(--accent-strong)',
  'in-progress': '#9a6000',
  'upcoming':    'var(--muted)',
};

export default function HomePage() {
  const completedDays  = site.sprintLog.filter((d) => d.status === 'complete').length;
  const totalDays      = site.sprintLog.length;
  const progressPct    = Math.round((completedDays / totalDays) * 100);

  return (
    <PageShell
      sidebar={<Sidebar items={site.sidebarItems} />}
      topNav={
        <TopNav
          notifications={site.notifications}
          title="Dashboard"
          subtitle={`${completedDays} of ${totalDays} sprint days complete · ${progressPct}% done`}
        />
      }
    >

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="hero" id="overview" aria-label="Project overview">
        <div className="hero-copy">
          <p className="eyebrow">Elevanda Ventures · CHMS</p>
          <h2>Church management system.</h2>
          <p className="lede">
            A full-stack church management platform built sprint by sprint.
            Authentication, protected routes, and the church onboarding wizard
            are live. Member management is next.
          </p>
          <div className="dash-progress-row">
            <div className="dash-progress-track" role="progressbar" aria-valuenow={progressPct} aria-valuemin={0} aria-valuemax={100} aria-label={`Sprint progress ${progressPct}%`}>
              <div className="dash-progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
            <span className="dash-progress-label">{progressPct}%</span>
          </div>
        </div>

        <div className="hero-panel">
          <p className="panel-label">Recent activity</p>
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

      {/* ── Quick actions ────────────────────────────────────────────────── */}
      <section aria-labelledby="quick-actions-heading">
        <h2 className="dash-section-title" id="quick-actions-heading">Quick actions</h2>
        <div className="cards-grid">
          {site.quickLinks.map((link) => (
            <Link key={link.href} href={link.href} className="dash-action-card">
              <p className="panel-label">Action</p>
              <h3>{link.label}</h3>
              <p>{link.description}</p>
              <span className="dash-action-arrow" aria-hidden="true">
                <ArrowRight size={16} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Sprint progress ──────────────────────────────────────────────── */}
      <section id="progress" aria-labelledby="sprint-heading">
        <h2 className="dash-section-title" id="sprint-heading">
          Sprint log
          <span className="dash-section-badge">{completedDays}/{totalDays} complete</span>
        </h2>
        <div className="dash-sprint-grid">
          {site.sprintLog.map((entry) => (
            <article
              key={entry.day}
              className={`content-card dash-sprint-card dash-sprint-card--${entry.status}`}
            >
              <div className="dash-sprint-card__meta">
                <span className="dash-sprint-card__day">{entry.day}</span>
                <span
                  className="dash-sprint-card__status"
                  style={{ color: STATUS_COLOR[entry.status], display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  {STATUS_ICON[entry.status]}
                  {STATUS_LABEL[entry.status]}
                </span>
              </div>
              <h3>{entry.title}</h3>
              <p>{entry.detail}</p>
              {entry.href && (
                <Link className="dash-sprint-card__link" href={entry.href}>
                  Open <ArrowRight size={13} aria-hidden="true" />
                </Link>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* ── Team ─────────────────────────────────────────────────────────── */}
      <section id="team" aria-labelledby="team-heading">
        <h2 className="dash-section-title" id="team-heading">Team</h2>
        <div className="dash-empty-state">
          <Users size={32} strokeWidth={1.5} className="dash-empty-state__icon" aria-hidden="true" />
          <h3 className="dash-empty-state__title">Member management coming in Day 9</h3>
          <p className="dash-empty-state__body">
            The invite flow, role assignment, and member list will be built in the next sprint.
            Once live, your team members will appear here.
          </p>
        </div>
      </section>

      {/* ── Tasks ────────────────────────────────────────────────────────── */}
      <section id="tasks" aria-labelledby="tasks-heading">
        <h2 className="dash-section-title" id="tasks-heading">Task board</h2>
        <div className="content-grid">
          {site.taskBoard.map((task) => (
            <article className="content-card" key={task.item}>
              <p className="panel-label">{task.lane}</p>
              <p>{task.item}</p>
            </article>
          ))}
        </div>
      </section>

    </PageShell>
  );
}
