import Link from 'next/link';
import * as site from '@/lib/site';
import PageShell from '@/components/PageShell';
import Sidebar from '@/components/Sidebar';
import TopNav from '@/components/TopNav';

const STATUS_LABEL: Record<site.DayEntry['status'], string> = {
  'complete':    'Complete',
  'in-progress': 'In progress',
  'upcoming':    'Upcoming',
};

export default function HomePage() {
  const completedDays = site.sprintLog.filter((d) => d.status === 'complete').length;

  return (
    <PageShell
      sidebar={<Sidebar user={site.currentUser} items={site.sidebarItems} />}
      topNav={<TopNav user={site.currentUser} notifications={site.notifications} />}
    >
      {/* ── Hero ── */}
      <section className="hero" id="overview">
        <div className="hero-copy">
          <p className="eyebrow">Elevanda Ventures · CHMS</p>
          <h2>Church management system in progress.</h2>
          <p className="lede">
            {completedDays} of {site.sprintLog.length} sprint days complete. Authentication,
            protected routes, and the church onboarding wizard are all live.
          </p>
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

      {/* ── Quick links ── */}
      <section className="cards-grid" aria-label="Quick actions" id="overview">
        {site.quickLinks.map((link) => (
          <Link key={link.href} href={link.href} className="content-card" style={{ textDecoration: 'none' }}>
            <p className="panel-label">Quick action</p>
            <h3>{link.label}</h3>
            <p>{link.description}</p>
          </Link>
        ))}
      </section>

      {/* ── Sprint log ── */}
      <section className="content-grid" id="progress" aria-label="Sprint progress">
        {site.sprintLog.map((entry) => (
          <article className="content-card" key={entry.day}>
            <p className="panel-label">{entry.day} · {STATUS_LABEL[entry.status]}</p>
            <h3>{entry.title}</h3>
            <p>{entry.detail}</p>
            {entry.href ? (
              <Link
                href={entry.href}
                style={{
                  marginTop: '8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  color: 'var(--accent-strong)',
                  textDecoration: 'underline',
                  textUnderlineOffset: '0.18em',
                }}
              >
                Open →
              </Link>
            ) : null}
          </article>
        ))}
      </section>

      {/* ── Team ── */}
      <section className="content-grid" id="team" aria-label="Team updates">
        {site.teamPulse.map((member) => (
          <article className="content-card" key={member.name}>
            <p className="panel-label">{member.role}</p>
            <h3>{member.name}</h3>
            <p>{member.update}</p>
          </article>
        ))}
      </section>

      {/* ── Tasks ── */}
      <section className="content-grid" id="tasks" aria-label="Task board">
        {site.taskBoard.map((task) => (
          <article className="content-card" key={task.item}>
            <p className="panel-label">{task.lane}</p>
            <h3>Action item</h3>
            <p>{task.item}</p>
          </article>
        ))}
      </section>
    </PageShell>
  );
}
