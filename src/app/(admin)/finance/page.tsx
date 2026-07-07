import Link from 'next/link';
import { TrendingUp, TrendingDown, DollarSign, Users, Lock } from 'lucide-react';

const SUMMARY_CARDS = [
  { label: 'Total Giving (Month)',  value: 'RWF 0',  trend: '+0%',  up: true,  icon: <DollarSign size={18} /> },
  { label: 'Total Giving (Year)',   value: 'RWF 0',  trend: '+0%',  up: true,  icon: <TrendingUp size={18} /> },
  { label: 'Active Givers',         value: '0',      trend: '0%',   up: true,  icon: <Users size={18} /> },
  { label: 'Avg. Gift Size',        value: 'RWF 0',  trend: '+0%',  up: false, icon: <TrendingDown size={18} /> },
];

const BUDGET_LINES = [
  { category: 'Tithes & Offerings', budgeted: 'RWF 0', received: 'RWF 0', pct: 0 },
  { category: 'Special Offerings',  budgeted: 'RWF 0', received: 'RWF 0', pct: 0 },
  { category: 'Building Fund',      budgeted: 'RWF 0', received: 'RWF 0', pct: 0 },
  { category: 'Missions',           budgeted: 'RWF 0', received: 'RWF 0', pct: 0 },
];

export default function FinancePage() {
  return (
    <div className="finance-page">

      {/* Access notice */}
      <div className="finance-access-notice">
        <Lock size={14} aria-hidden="true" />
        <span>Visible to <strong>Admin</strong> and <strong>Finance</strong> roles only. Full giving records will be connected in a future sprint.</span>
      </div>

      {/* Summary cards */}
      <div className="finance-stats">
        {SUMMARY_CARDS.map((c) => (
          <div key={c.label} className="finance-stat">
            <div className="finance-stat__icon">{c.icon}</div>
            <div className="finance-stat__body">
              <span className="finance-stat__value">{c.value}</span>
              <span className="finance-stat__label">{c.label}</span>
            </div>
            <span className={`finance-stat__trend ${c.up ? 'finance-stat__trend--up' : 'finance-stat__trend--down'}`}>
              {c.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {c.trend}
            </span>
          </div>
        ))}
      </div>

      {/* Budget overview */}
      <section className="finance-section">
        <h2 className="finance-section__title">Budget overview</h2>
        <div className="finance-table-wrap">
          <table className="finance-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Budgeted</th>
                <th>Received</th>
                <th>Progress</th>
              </tr>
            </thead>
            <tbody>
              {BUDGET_LINES.map((row) => (
                <tr key={row.category}>
                  <td>{row.category}</td>
                  <td>{row.budgeted}</td>
                  <td>{row.received}</td>
                  <td>
                    <div className="finance-bar">
                      <div className="finance-bar__fill" style={{ width: `${row.pct}%` }} />
                    </div>
                    <span className="finance-bar__label">{row.pct}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Recent transactions */}
      <section className="finance-section">
        <div className="finance-section__head">
          <h2 className="finance-section__title">Recent transactions</h2>
          <span className="finance-section__badge">Coming soon</span>
        </div>
        <div className="finance-empty">
          <DollarSign size={32} strokeWidth={1.2} />
          <strong>No transactions yet</strong>
          <p>Connect your Supabase database and run the finance migration to start recording giving records.</p>
          <Link href="/settings" className="finance-empty__link">Configure settings →</Link>
        </div>
      </section>

    </div>
  );
}
