import { FeatureCard } from '@/components/FeatureCard';
import * as site from '@/lib/site';
import PageShell from '@/components/PageShell';
import Sidebar from '@/components/Sidebar';
import TopNav from '@/components/TopNav';

export default function HomePage() {
  return (
    <PageShell
      sidebar={<Sidebar user={site.currentUser} items={site.sidebarItems} />}
      topNav={<TopNav user={site.currentUser} notificationCount={site.notifications.length} />}
    >
      <section className="hero" id="overview">
        <div className="hero-copy">
          <p className="eyebrow">Day 3 assignment</p>
          <h2>Base layout components with responsive breakpoints.</h2>
          <p className="lede">
            The shell now includes a collapsible sidebar, a top nav with notifications and avatar,
            and a max-width page container that stays balanced across mobile, tablet, and desktop.
          </p>
        </div>

        <div className="hero-panel">
          <p className="panel-label">Latest notifications</p>
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

      <section className="cards-grid" aria-label="Project highlights">
        {site.setupHighlights.map((item) => (
          <FeatureCard key={item.title} title={item.title} description={item.description} />
        ))}
      </section>

      <section className="content-grid" id="projects" aria-label="Projects">
        {site.projectMilestones.map((project) => (
          <article className="content-card" key={project.title}>
            <p className="panel-label">{project.status}</p>
            <h3>{project.title}</h3>
            <p>{project.detail}</p>
          </article>
        ))}
      </section>

      <section className="content-grid" id="team" aria-label="Team updates">
        {site.teamPulse.map((member) => (
          <article className="content-card" key={member.name}>
            <p className="panel-label">{member.role}</p>
            <h3>{member.name}</h3>
            <p>{member.update}</p>
          </article>
        ))}
      </section>

      <section className="content-grid" id="tasks" aria-label="Tasks">
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