import { FeatureCard } from '@/components/FeatureCard';
import * as site from '@/lib/site';

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Day 1 foundation</p>
          <h1>Next.js 14, TypeScript, and a clean local setup.</h1>
          <p className="lede">
            This starter captures the baseline asked for in the task: App Router, TypeScript,
            ESLint, Prettier, absolute aliases, and a clear environment template.
          </p>
        </div>

        <div className="hero-panel">
          <p className="panel-label">Included today</p>
          <ul className="checklist">
            {site.setupChecklist.map((item: string) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="cards-grid" aria-label="Project highlights">
        {site.setupHighlights.map((item) => (
          <FeatureCard key={item.title} title={item.title} description={item.description} />
        ))}
      </section>
    </main>
  );
}