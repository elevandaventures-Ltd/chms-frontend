'use client';

/**
 * /settings/data-export — Day 49 review: trigger a full church data
 * export and download a .zip with 5 CSVs (members, households,
 * attendance, events, giving).
 */
import { useState } from 'react';
import { Download, FileArchive, CheckCircle2 } from 'lucide-react';
import { exportChurchDataZip } from '@/lib/export-church-data';

const FILES = ['members.csv', 'households.csv', 'attendance.csv', 'events.csv', 'giving.csv'];

export default function DataExportPage() {
  const [exporting, setExporting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleExport() {
    setExporting(true);
    setDone(false);
    try {
      await exportChurchDataZip();
      setDone(true);
      setTimeout(() => setDone(false), 4000);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="cf-page">
      <div className="bulletin-editor__head">
        <div>
          <h1>Data &amp; exports</h1>
          <p>Download every member, household, attendance, event, and giving record as CSV — bundled into one .zip.</p>
        </div>
      </div>

      <div className="export-card">
        <FileArchive size={28} strokeWidth={1.3} aria-hidden="true" />
        <div className="export-card__files">
          {FILES.map((f) => <span key={f} className="export-card__file">{f}</span>)}
        </div>
        {done && (
          <div className="unsub-card__banner unsub-card__banner--success" style={{ width: '100%' }}>
            <CheckCircle2 size={14} aria-hidden="true" /> Export downloaded.
          </div>
        )}
        <button type="button" className="sa-btn sa-btn--primary" onClick={handleExport} disabled={exporting}>
          <Download size={14} aria-hidden="true" /> {exporting ? 'Preparing export…' : 'Download export (.zip)'}
        </button>
      </div>
    </div>
  );
}
