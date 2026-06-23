'use client';

import { useEffect, useRef, useState } from 'react';
import { X, Check } from 'lucide-react';
import { MINISTRIES } from '@/lib/ministries';

type AssignMode = 'add' | 'replace';

type BulkMinistryModalProps = {
  memberIds: string[];
  onClose:   () => void;
  onDone:    (result: { updated: number; ministries: string[]; mode: AssignMode }) => void;
};

// ── Component ─────────────────────────────────────────────────────────────────

export function BulkMinistryModal({ memberIds, onClose, onDone }: BulkMinistryModalProps) {
  const [selected,    setSelected]    = useState<string[]>([]);
  const [mode,        setMode]        = useState<AssignMode>('add');
  const [saving,      setSaving]      = useState(false);
  const [serverError, setServerError] = useState('');

  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { closeRef.current?.focus(); }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  function toggle(name: string) {
    setSelected((cur) => (cur.includes(name) ? cur.filter((m) => m !== name) : [...cur, name]));
  }

  async function submit() {
    if (selected.length === 0) {
      setServerError('Select at least one ministry.');
      return;
    }
    setSaving(true);
    setServerError('');

    try {
      const res = await fetch('/api/members/bulk-ministries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: memberIds, ministries: selected, mode }),
      });
      const json = await res.json();
      if (!res.ok) {
        setServerError(json.error ?? 'Failed to assign ministries.');
        return;
      }
      onDone({ updated: json.updated ?? memberIds.length, ministries: selected, mode });
      onClose();
    } catch {
      setServerError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="msm-overlay" role="dialog" aria-modal="true" aria-label="Assign members to ministry">
      <div className="msm-backdrop" onClick={onClose} aria-hidden="true" />

      <div className="msm-card msm-card--wide">
        <div className="msm-header">
          <h2 className="msm-title">Assign to Ministry</h2>
          <button ref={closeRef} type="button" className="msm-close" onClick={onClose} aria-label="Close">
            <X size={17} />
          </button>
        </div>

        <p className="msm-member-name">
          {memberIds.length} member{memberIds.length === 1 ? '' : 's'} selected
        </p>

        {/* Mode toggle */}
        <div className="bulk-mode" role="radiogroup" aria-label="Assignment mode">
          <button
            type="button"
            role="radio"
            aria-checked={mode === 'add' ? 'true' : 'false'}
            className={`bulk-mode__opt${mode === 'add' ? ' bulk-mode__opt--active' : ''}`}
            onClick={() => setMode('add')}
          >
            Add to existing
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={mode === 'replace' ? 'true' : 'false'}
            className={`bulk-mode__opt${mode === 'replace' ? ' bulk-mode__opt--active' : ''}`}
            onClick={() => setMode('replace')}
          >
            Replace all
          </button>
        </div>
        <p className="msm-option__blurb">
          {mode === 'add'
            ? 'Selected ministries are added to each member’s current teams.'
            : 'Each member’s ministries are replaced with the selection below.'}
        </p>

        {/* Ministry pills */}
        <div className="amf-ministry-grid" role="group" aria-label="Select ministries">
          {MINISTRIES.map((m) => {
            const active = selected.includes(m);
            return (
              <button
                key={m}
                type="button"
                className={`amf-ministry-pill${active ? ' amf-ministry-pill--active' : ''}`}
                aria-pressed={active}
                onClick={() => toggle(m)}
              >
                {active && <Check size={11} aria-hidden="true" />}
                {m}
              </button>
            );
          })}
        </div>

        {serverError && <p className="msm-server-error" role="alert">{serverError}</p>}

        <div className="msm-footer">
          <button type="button" className="msm-btn msm-btn--secondary" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="button" className="msm-btn msm-btn--primary" onClick={submit} disabled={saving || selected.length === 0}>
            {saving ? 'Applying…' : `Apply to ${memberIds.length}`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default BulkMinistryModal;
