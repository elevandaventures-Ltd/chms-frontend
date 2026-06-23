'use client';

import { useEffect, useRef, useState } from 'react';
import { X, Users, Download, MessageCircle, FileSpreadsheet, FileText, ChevronDown } from 'lucide-react';

type BulkActionsBarProps = {
  count:            number;
  onClear:          () => void;
  onAssignMinistry: () => void;
  onExportCsv:      () => void;
  onExportPdf:      () => void;
  onSendMessage:    () => void;
};

// ── Component ─────────────────────────────────────────────────────────────────
//
// Fixed toolbar that slides up from the bottom of the directory whenever one or
// more members are selected.

export function BulkActionsBar({
  count,
  onClear,
  onAssignMinistry,
  onExportCsv,
  onExportPdf,
  onSendMessage,
}: BulkActionsBarProps) {
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  // Close the export menu on outside click / Escape.
  useEffect(() => {
    if (!exportOpen) return;
    const onDown = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) setExportOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setExportOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [exportOpen]);

  return (
    <div className="bulk-bar" role="region" aria-label="Bulk actions">
      <div className="bulk-bar__inner">

        {/* Selection count + clear */}
        <div className="bulk-bar__count-group">
          <button type="button" className="bulk-bar__clear" onClick={onClear} aria-label="Clear selection">
            <X size={15} aria-hidden="true" />
          </button>
          <span className="bulk-bar__count">
            <strong>{count}</strong> selected
          </span>
        </div>

        {/* Actions */}
        <div className="bulk-bar__actions">
          <button type="button" className="bulk-bar__btn" onClick={onAssignMinistry}>
            <Users size={15} aria-hidden="true" />
            <span>Assign to Ministry</span>
          </button>

          {/* Export dropdown */}
          <div className="bulk-bar__export" ref={exportRef}>
            <button
              type="button"
              className="bulk-bar__btn"
              aria-haspopup="menu"
              aria-expanded={exportOpen ? 'true' : 'false'}
              onClick={() => setExportOpen((v) => !v)}
            >
              <Download size={15} aria-hidden="true" />
              <span>Export Selected</span>
              <ChevronDown size={13} aria-hidden="true" />
            </button>
            {exportOpen && (
              <div className="bulk-bar__menu" role="menu">
                <button
                  type="button"
                  role="menuitem"
                  className="bulk-bar__menu-item"
                  onClick={() => { setExportOpen(false); onExportCsv(); }}
                >
                  <FileSpreadsheet size={15} aria-hidden="true" />
                  Export as CSV
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="bulk-bar__menu-item"
                  onClick={() => { setExportOpen(false); onExportPdf(); }}
                >
                  <FileText size={15} aria-hidden="true" />
                  Export as PDF
                </button>
              </div>
            )}
          </div>

          <button type="button" className="bulk-bar__btn bulk-bar__btn--primary" onClick={onSendMessage}>
            <MessageCircle size={15} aria-hidden="true" />
            <span>Send Message</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default BulkActionsBar;
