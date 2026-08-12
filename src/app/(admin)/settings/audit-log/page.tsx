'use client';

/**
 * /settings/audit-log — Day 48. Filterable table (Timestamp, User,
 * Action, Resource, Details); expandable row shows an old-vs-new diff
 * side-by-side. Download filtered results as CSV for compliance.
 */
import { Fragment, useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Download, Search } from 'lucide-react';
import { exportAuditLogCsv } from '@/lib/export-audit-log';
import type { ChurchAuditEntry } from '@/lib/church-audit';

function fmt(iso: string) {
  return new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function AuditLogPage() {
  const [entries, setEntries] = useState<ChurchAuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/church/audit-log')
      .then((r) => r.json())
      .then((json: { data?: ChurchAuditEntry[] }) => setEntries(json.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  const actions = useMemo(() => ['all', ...new Set(entries.map((e) => e.action))], [entries]);

  const filtered = entries.filter((e) => {
    if (actionFilter !== 'all' && e.action !== actionFilter) return false;
    if (!query.trim()) return true;
    const q = query.trim().toLowerCase();
    return e.actorName.toLowerCase().includes(q) || e.resourceLabel.toLowerCase().includes(q) || e.action.toLowerCase().includes(q);
  });

  return (
    <div className="sa-page">
      <div className="sa-page__toolbar">
        <div className="sa-search">
          <Search size={14} aria-hidden="true" />
          <input type="search" placeholder="Search by user, resource, or action…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <label className="sa-select">
          <span>Action</span>
          <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
            {actions.map((a) => <option key={a} value={a}>{a === 'all' ? 'All actions' : a}</option>)}
          </select>
        </label>
        <button type="button" className="sa-btn sa-btn--secondary" onClick={() => exportAuditLogCsv(filtered)} disabled={filtered.length === 0}>
          <Download size={13} aria-hidden="true" /> Export CSV
        </button>
      </div>

      <div className="al-table-wrap">
        <table className="al-table">
          <thead>
            <tr>
              <th aria-hidden="true" />
              <th>Timestamp</th>
              <th>User</th>
              <th>Action</th>
              <th>Resource</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6}><div className="skeleton-shimmer" style={{ height: 14, borderRadius: 6 }} /></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="al-empty">No actions recorded yet — edit a member, change a role, or update settings to see entries here.</td></tr>
            ) : filtered.map((e) => {
              const isOpen = expanded === e.id;
              return (
                <Fragment key={e.id}>
                  <tr className="al-row--clickable" onClick={() => setExpanded(isOpen ? null : e.id)}>
                    <td>{e.changes.length > 0 && (isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}</td>
                    <td className="al-table__timestamp">{fmt(e.timestamp)}</td>
                    <td>{e.actorName}</td>
                    <td><span className="al-action">{e.action}</span></td>
                    <td>{e.resourceType}: {e.resourceLabel}</td>
                    <td>{e.changes.length} field{e.changes.length !== 1 ? 's' : ''} changed</td>
                  </tr>
                  {isOpen && e.changes.length > 0 && (
                    <tr className="al-detail-row">
                      <td colSpan={6}>
                        <table className="al-diff-table">
                          <thead><tr><th>Field</th><th>Before</th><th>After</th></tr></thead>
                          <tbody>
                            {e.changes.map((c) => (
                              <tr key={c.field}>
                                <td>{c.field}</td>
                                <td className="al-diff-table__before">{c.before === null || c.before === undefined ? '—' : String(c.before)}</td>
                                <td className="al-diff-table__after">{c.after === null || c.after === undefined ? '—' : String(c.after)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
