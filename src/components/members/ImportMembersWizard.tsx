'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { X, UploadCloud, ArrowLeft, ArrowRight, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import { parseCsv, type ParsedCsv } from '@/lib/csv';
import {
  IMPORT_FIELDS, autoMap, normalizeRow,
  type Mapping, type NormalizedMember,
} from '@/lib/member-import';

type Estimate = { added: number; updated: number; skipped: number };
type Result   = Estimate & { persisted: boolean };

type ImportMembersWizardProps = {
  onClose: () => void;
  onImported: (result: Result) => void;
};

const STEPS = ['Upload', 'Map columns', 'Preview', 'Confirm'];
const PREVIEW_FIELDS = ['fullName', 'email', 'status', 'role', 'joinedDate', 'ministries'] as const;
const PREVIEW_LABELS: Record<string, string> = {
  fullName: 'Name', email: 'Email', status: 'Status', role: 'Role',
  joinedDate: 'Join date', ministries: 'Ministries',
};

// ── Component ─────────────────────────────────────────────────────────────────

export function ImportMembersWizard({ onClose, onImported }: ImportMembersWizardProps) {
  const [step,     setStep]     = useState(1);
  const [fileName, setFileName] = useState('');
  const [parsed,   setParsed]   = useState<ParsedCsv | null>(null);
  const [mapping,  setMapping]  = useState<Mapping>({});
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [busy,     setBusy]     = useState(false);
  const [error,    setError]    = useState('');

  const fileRef = useRef<HTMLInputElement>(null);
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // All rows normalised under the current mapping.
  const normalized: NormalizedMember[] = useMemo(() => {
    if (!parsed) return [];
    return parsed.rows.map((cells) => normalizeRow(cells, mapping, today));
  }, [parsed, mapping, today]);

  const validCount   = normalized.filter((m) => m.valid).length;
  const invalidCount = normalized.length - validCount;

  const canProceedMapping =
    mapping.email !== undefined && (mapping.fullName !== undefined || mapping.firstName !== undefined);

  // ── Step 1: file ────────────────────────────────────────────────────────
  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    try {
      const text = await file.text();
      const result = parseCsv(text);
      if (result.headers.length === 0 || result.rows.length === 0) {
        setError('That file has no data rows.');
        return;
      }
      setFileName(file.name);
      setParsed(result);
      setMapping(autoMap(result.headers));
      setStep(2);
    } catch {
      setError('Could not read that file.');
    }
  }

  function setFieldColumn(field: string, value: string) {
    setMapping((prev) => {
      const next = { ...prev };
      if (value === '') delete next[field as keyof Mapping];
      else next[field as keyof Mapping] = Number(value);
      return next;
    });
  }

  // ── Step 4: dry run + commit ──────────────────────────────────────────────
  async function runImport(dryRun: boolean) {
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/members/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ members: normalized, dryRun }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? 'Import failed.'); return null; }
      return json as Result;
    } catch {
      setError('Network error. Please try again.');
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function goToConfirm() {
    setStep(4);
    const r = await runImport(true);
    if (r) setEstimate({ added: r.added, updated: r.updated, skipped: r.skipped });
  }

  async function commit() {
    const r = await runImport(false);
    if (r) onImported(r);
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="msm-overlay" role="dialog" aria-modal="true" aria-label="Import members from CSV">
      <div className="msm-backdrop" onClick={onClose} aria-hidden="true" />

      <div className="imp-card">
        <div className="msm-header">
          <h2 className="msm-title">Import Members</h2>
          <button type="button" className="msm-close" onClick={onClose} aria-label="Close">
            <X size={17} />
          </button>
        </div>

        {/* Step indicator */}
        <ol className="imp-steps" aria-label="Import steps">
          {STEPS.map((label, i) => {
            const n = i + 1;
            const state = n === step ? 'current' : n < step ? 'done' : 'todo';
            return (
              <li key={label} className={`imp-step imp-step--${state}`}>
                <span className="imp-step__dot">{n < step ? <CheckCircle2 size={14} /> : n}</span>
                <span className="imp-step__label">{label}</span>
              </li>
            );
          })}
        </ol>

        <div className="imp-body">
          {/* ── Step 1: Upload ─────────────────────────────────────────── */}
          {step === 1 && (
            <div className="imp-upload">
              <button type="button" className="imp-dropzone" onClick={() => fileRef.current?.click()}>
                <UploadCloud size={34} strokeWidth={1.5} aria-hidden="true" />
                <strong>Choose a CSV file</strong>
                <span>The first row should contain column headers.</span>
              </button>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,text/csv"
                className="amf-hidden-input"
                aria-label="CSV file"
                onChange={handleFile}
              />
            </div>
          )}

          {/* ── Step 2: Map columns ────────────────────────────────────── */}
          {step === 2 && parsed && (
            <div className="imp-map">
              <p className="imp-note">
                <FileText size={14} aria-hidden="true" /> {fileName} · {parsed.rows.length} row
                {parsed.rows.length === 1 ? '' : 's'} · {parsed.headers.length} columns
              </p>
              <p className="msm-option__blurb">
                Match each member field to a column from your file. Email and a name are required.
              </p>
              <div className="imp-map__grid">
                {IMPORT_FIELDS.map((f) => (
                  <div key={f.key} className="imp-map__row">
                    <label className="imp-map__label" htmlFor={`map-${f.key}`}>
                      {f.label}
                      {f.required && <span className="msm-required" aria-hidden="true"> *</span>}
                      {f.hint && <span className="imp-map__hint">{f.hint}</span>}
                    </label>
                    <select
                      id={`map-${f.key}`}
                      className="amf-select"
                      value={mapping[f.key] ?? ''}
                      onChange={(e) => setFieldColumn(f.key, e.target.value)}
                    >
                      <option value="">— Not mapped —</option>
                      {parsed.headers.map((h, i) => (
                        <option key={i} value={i}>{h || `Column ${i + 1}`}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 3: Preview ────────────────────────────────────────── */}
          {step === 3 && (
            <div className="imp-preview">
              <p className="imp-note">
                Showing the first {Math.min(5, normalized.length)} of {normalized.length} rows.
                {invalidCount > 0 && (
                  <span className="imp-note__warn">
                    {' '}<AlertTriangle size={13} aria-hidden="true" /> {invalidCount} row
                    {invalidCount === 1 ? '' : 's'} will be skipped (missing email or name).
                  </span>
                )}
              </p>
              <div className="imp-table-wrap">
                <table className="imp-table">
                  <thead>
                    <tr>
                      <th aria-label="Row status"></th>
                      {PREVIEW_FIELDS.map((k) => <th key={k}>{PREVIEW_LABELS[k]}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {normalized.slice(0, 5).map((m, i) => (
                      <tr key={i} className={m.valid ? '' : 'imp-table__row--invalid'}>
                        <td>
                          {m.valid
                            ? <CheckCircle2 size={15} className="imp-ok" aria-label="Valid" />
                            : <AlertTriangle size={15} className="imp-bad" aria-label={m.error} />}
                        </td>
                        <td>{m.fullName || <em>—</em>}</td>
                        <td>{m.email || <em>—</em>}</td>
                        <td>{m.status}</td>
                        <td>{m.role}</td>
                        <td>{m.joinedDate}</td>
                        <td>{m.ministries.join(', ') || <em>—</em>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Step 4: Confirm ────────────────────────────────────────── */}
          {step === 4 && (
            <div className="imp-confirm">
              {busy && !estimate ? (
                <p className="imp-note">Calculating changes…</p>
              ) : estimate ? (
                <>
                  <p className="msm-option__blurb">Ready to import. Here’s what will change:</p>
                  <div className="imp-stats">
                    <div className="imp-stat imp-stat--add">
                      <span className="imp-stat__num">{estimate.added}</span>
                      <span className="imp-stat__label">New members</span>
                    </div>
                    <div className="imp-stat imp-stat--update">
                      <span className="imp-stat__num">{estimate.updated}</span>
                      <span className="imp-stat__label">Updated (matched by email)</span>
                    </div>
                    <div className="imp-stat imp-stat--skip">
                      <span className="imp-stat__num">{estimate.skipped}</span>
                      <span className="imp-stat__label">Skipped</span>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          )}

          {error && <p className="msm-server-error" role="alert">{error}</p>}
        </div>

        {/* Footer */}
        <div className="msm-footer">
          {step > 1 && step < 4 && (
            <button type="button" className="msm-btn msm-btn--secondary" onClick={() => setStep(step - 1)}>
              <ArrowLeft size={15} aria-hidden="true" /> Back
            </button>
          )}
          {step === 4 && (
            <button type="button" className="msm-btn msm-btn--secondary" onClick={() => setStep(3)} disabled={busy}>
              <ArrowLeft size={15} aria-hidden="true" /> Back
            </button>
          )}

          {step === 1 && (
            <button type="button" className="msm-btn msm-btn--secondary" onClick={onClose}>Cancel</button>
          )}
          {step === 2 && (
            <button
              type="button"
              className="msm-btn msm-btn--primary"
              onClick={() => setStep(3)}
              disabled={!canProceedMapping}
              title={canProceedMapping ? undefined : 'Map Email and a name column first'}
            >
              Next <ArrowRight size={15} aria-hidden="true" />
            </button>
          )}
          {step === 3 && (
            <button
              type="button"
              className="msm-btn msm-btn--primary"
              onClick={goToConfirm}
              disabled={validCount === 0}
            >
              Next <ArrowRight size={15} aria-hidden="true" />
            </button>
          )}
          {step === 4 && (
            <button
              type="button"
              className="msm-btn msm-btn--primary"
              onClick={commit}
              disabled={busy || !estimate || (estimate.added + estimate.updated === 0)}
            >
              {busy ? 'Importing…' : `Import ${estimate ? estimate.added + estimate.updated : ''} members`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ImportMembersWizard;
