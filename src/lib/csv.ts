/**
 * Minimal, dependency-free CSV parser (RFC 4180-ish) for the member import flow.
 *
 * Handles quoted fields, escaped quotes ("" inside quotes), and commas / newlines
 * inside quoted values. Good enough for spreadsheet exports; not a full streaming
 * parser.
 */

export type ParsedCsv = {
  headers: string[];
  rows: string[][];
};

export function parseCsv(text: string): ParsedCsv {
  // Strip a UTF-8 BOM if present and normalise line endings.
  const clean = text.replace(/^﻿/, '');

  const records: string[][] = [];
  let field = '';
  let record: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];

    if (inQuotes) {
      if (ch === '"') {
        if (clean[i + 1] === '"') { field += '"'; i++; }  // escaped quote
        else inQuotes = false;
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      record.push(field);
      field = '';
    } else if (ch === '\n' || ch === '\r') {
      // Consume \r\n as a single break.
      if (ch === '\r' && clean[i + 1] === '\n') i++;
      record.push(field);
      field = '';
      records.push(record);
      record = [];
    } else {
      field += ch;
    }
  }

  // Flush trailing field/record (file may not end with a newline).
  if (field.length > 0 || record.length > 0) {
    record.push(field);
    records.push(record);
  }

  // Drop fully-empty trailing records.
  const nonEmpty = records.filter((r) => !(r.length === 1 && r[0].trim() === ''));
  if (nonEmpty.length === 0) return { headers: [], rows: [] };

  const headers = nonEmpty[0].map((h) => h.trim());
  const rows = nonEmpty.slice(1).map((r) => {
    // Pad/truncate to header length so every row aligns to the columns.
    const out = headers.map((_, idx) => (r[idx] ?? '').trim());
    return out;
  });

  return { headers, rows };
}
