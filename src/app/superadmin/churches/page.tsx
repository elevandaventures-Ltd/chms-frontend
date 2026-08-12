'use client';

/**
 * /superadmin/churches — Day 41 church management table.
 *
 * Columns: Church Name, Plan, Members, Status, Country, MRR, Last Active,
 * Actions. Sortable via DataTable. Row click opens the detail panel.
 */
import { useCallback, useEffect, useState } from 'react';
import { Search, Ban, CheckCircle2 } from 'lucide-react';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { ChurchDetailDrawer } from '@/components/superadmin/ChurchDetailDrawer';
import { PLAN_LABEL, STATUS_LABEL, type SuperadminChurch } from '@/lib/superadmin';

const STATUS_TONE: Record<SuperadminChurch['status'], 'success' | 'warning' | 'danger' | 'default'> = {
  active: 'success', trial: 'warning', suspended: 'danger', churned: 'default',
};

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diffMs / 3_600_000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function SuperadminChurchesPage() {
  const [churches, setChurches] = useState<SuperadminChurch[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<SuperadminChurch | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/superadmin/churches');
      const json = await res.json() as { data?: SuperadminChurch[] };
      setChurches(json.data ?? []);
    } catch {
      setChurches([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const filtered = churches.filter((c) => {
    if (!query.trim()) return true;
    const q = query.trim().toLowerCase();
    return c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q) || c.city.toLowerCase().includes(q);
  });

  function handleRowClick(row: SuperadminChurch) {
    setSelected(row);
    setDrawerOpen(true);
  }

  function handleChanged(updated: SuperadminChurch) {
    setChurches((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setSelected(updated);
  }

  const columns: Column<SuperadminChurch>[] = [
    { key: 'name', label: 'Church Name', sortable: true },
    { key: 'plan', label: 'Plan', sortable: true, render: (v) => PLAN_LABEL[v as SuperadminChurch['plan']] },
    { key: 'membersCount', label: 'Members', sortable: true, render: (v) => (v as number).toLocaleString() },
    {
      key: 'status', label: 'Status', sortable: true,
      render: (v) => <Badge tone={STATUS_TONE[v as SuperadminChurch['status']]}>{STATUS_LABEL[v as SuperadminChurch['status']]}</Badge>,
    },
    { key: 'country', label: 'Country', sortable: true },
    { key: 'mrr', label: 'MRR', sortable: true, render: (v) => `$${(v as number).toLocaleString()}` },
    { key: 'lastActiveAt', label: 'Last Active', sortable: true, render: (v) => relativeTime(v as string) },
    {
      key: 'id', label: 'Actions',
      render: (_v, row) => (
        <button
          type="button"
          className={row.status === 'suspended' ? 'sa-btn sa-btn--primary sa-btn--sm' : 'sa-btn sa-btn--danger sa-btn--sm'}
          onClick={(e) => { e.stopPropagation(); handleRowClick(row); }}
        >
          {row.status === 'suspended' ? <CheckCircle2 size={12} aria-hidden="true" /> : <Ban size={12} aria-hidden="true" />}
          {row.status === 'suspended' ? 'Restore' : 'Suspend'}
        </button>
      ),
    },
  ];

  return (
    <div className="sa-page">
      <div className="sa-page__toolbar">
        <div className="sa-search">
          <Search size={14} aria-hidden="true" />
          <input
            type="search"
            placeholder="Search churches by name, city, or country…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search churches"
          />
        </div>
        <span className="sa-page__count">{filtered.length} of {churches.length} churches</span>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        rowKey="id"
        loading={loading}
        emptyMessage="No churches match your search."
        onRowClick={handleRowClick}
      />

      <ChurchDetailDrawer
        church={selected}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onChanged={handleChanged}
      />
    </div>
  );
}
