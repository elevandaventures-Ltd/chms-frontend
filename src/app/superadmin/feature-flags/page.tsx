'use client';

/**
 * /superadmin/feature-flags — Day 44. Table of every feature flag for a
 * selected church, with an on/off toggle switch and last-changed
 * timestamp per row.
 */
import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { SuperadminChurch } from '@/lib/superadmin';

type FlagRow = {
  key: string;
  label: string;
  description: string;
  category: string;
  enabled: boolean;
  changedAt: string | null;
  changedBy: string | null;
};

function formatTimestamp(iso: string | null): string {
  if (!iso) return 'Never changed';
  return new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function FeatureFlagsPage() {
  return (
    <Suspense fallback={null}>
      <FeatureFlagsPageInner />
    </Suspense>
  );
}

function FeatureFlagsPageInner() {
  const searchParams = useSearchParams();
  const [churches, setChurches] = useState<SuperadminChurch[]>([]);
  const [churchId, setChurchId] = useState<string>(searchParams.get('churchId') ?? '');
  const [flags, setFlags] = useState<FlagRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    fetch('/api/superadmin/churches')
      .then((r) => r.json())
      .then((json: { data?: SuperadminChurch[] }) => {
        const list = json.data ?? [];
        setChurches(list);
        setChurchId((current) => current || list[0]?.id || '');
      })
      .catch(() => {});
  }, []);

  const loadFlags = useCallback(async (id: string) => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/superadmin/feature-flags?churchId=${id}`);
      const json = await res.json() as { data?: FlagRow[] };
      setFlags(json.data ?? []);
    } catch {
      setFlags([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadFlags(churchId); }, [churchId, loadFlags]);

  async function toggleFlag(flagKey: string, enabled: boolean) {
    setPending(flagKey);
    try {
      const res = await fetch('/api/superadmin/feature-flags', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ churchId, flagKey, enabled }),
      });
      if (!res.ok) throw new Error('failed');
      await loadFlags(churchId);
      const flagLabel = flags.find((f) => f.key === flagKey)?.label ?? flagKey;
      setToast(`${flagLabel} ${enabled ? 'enabled' : 'disabled'} for this church.`);
      setTimeout(() => setToast(''), 3500);
    } catch {
      setToast('Could not update the flag. Try again.');
      setTimeout(() => setToast(''), 3500);
    } finally {
      setPending(null);
    }
  }

  const selectedChurch = churches.find((c) => c.id === churchId);

  return (
    <div className="sa-page">
      <div className="sa-page__toolbar">
        <label className="sa-select">
          <span>Church</span>
          <select value={churchId} onChange={(e) => setChurchId(e.target.value)}>
            {churches.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
        {selectedChurch && <span className="sa-page__count">{selectedChurch.city}, {selectedChurch.country}</span>}
      </div>

      {toast && <div className="comm-toast" role="status" aria-live="polite">{toast}</div>}

      <div className="ff-table-wrap">
        <table className="ff-table">
          <thead>
            <tr>
              <th>Flag</th>
              <th>Category</th>
              <th>Enabled</th>
              <th>Last changed</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}><td colSpan={4}><div className="skeleton-shimmer" style={{ height: 14, borderRadius: 6 }} /></td></tr>
              ))
            ) : flags.map((flag) => (
              <tr key={flag.key}>
                <td>
                  <strong className="ff-table__label">{flag.label}</strong>
                  <span className="ff-table__desc">{flag.description}</span>
                </td>
                <td><span className="ff-table__category">{flag.category}</span></td>
                <td>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={flag.enabled}
                    className={`ff-toggle${flag.enabled ? ' ff-toggle--on' : ''}`}
                    onClick={() => toggleFlag(flag.key, !flag.enabled)}
                    disabled={pending === flag.key}
                  >
                    <span className="ff-toggle__thumb" />
                  </button>
                </td>
                <td className="ff-table__timestamp">
                  {formatTimestamp(flag.changedAt)}
                  {flag.changedBy && <span> · {flag.changedBy}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
