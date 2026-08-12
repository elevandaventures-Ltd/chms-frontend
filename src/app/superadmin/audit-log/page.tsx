'use client';

/**
 * /superadmin/audit-log — every recorded superadmin action: suspensions,
 * restores, plan changes, and feature-flag toggles, newest first.
 */
import { useEffect, useState } from 'react';
import { Ban, CheckCircle2, ArrowUpRight, ToggleLeft, ScrollText } from 'lucide-react';
import type { AuditLogEntry } from '@/lib/superadmin';

const ACTION_ICON: Record<string, React.ReactNode> = {
  'church.suspended': <Ban size={14} />,
  'church.restored': <CheckCircle2 size={14} />,
  'subscription.plan_changed': <ArrowUpRight size={14} />,
  'subscription.cancel_scheduled': <ArrowUpRight size={14} />,
  'subscription.cancel_reverted': <ArrowUpRight size={14} />,
  'feature_flag.toggled': <ToggleLeft size={14} />,
  'church.churned': <ScrollText size={14} />,
};

const ACTION_LABEL: Record<string, string> = {
  'church.suspended': 'Suspended church',
  'church.restored': 'Restored church',
  'subscription.plan_changed': 'Changed plan',
  'subscription.cancel_scheduled': 'Scheduled cancellation',
  'subscription.cancel_reverted': 'Reverted cancellation',
  'feature_flag.toggled': 'Toggled feature flag',
  'church.churned': 'Church churned',
};

export default function AuditLogPage() {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/superadmin/audit-log')
      .then((r) => r.json())
      .then((json: { data?: AuditLogEntry[] }) => setEntries(json.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="sa-page">
      <div className="al-table-wrap">
        <table className="al-table">
          <thead>
            <tr>
              <th>Action</th>
              <th>Target</th>
              <th>Actor</th>
              <th>When</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={4}><div className="skeleton-shimmer" style={{ height: 14, borderRadius: 6 }} /></td></tr>
              ))
            ) : entries.length === 0 ? (
              <tr><td colSpan={4} className="al-empty">No actions recorded yet.</td></tr>
            ) : entries.map((entry) => (
              <tr key={entry.id}>
                <td>
                  <span className="al-action">
                    {ACTION_ICON[entry.action] ?? <ScrollText size={14} />}
                    {ACTION_LABEL[entry.action] ?? entry.action}
                  </span>
                </td>
                <td>{entry.churchName ?? entry.targetId}</td>
                <td>{entry.actorLabel}</td>
                <td>{new Date(entry.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
