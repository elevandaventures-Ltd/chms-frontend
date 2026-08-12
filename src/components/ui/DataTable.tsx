"use client";

/**
 * DataTable — sortable, selectable data table for the Member Directory
 * and every other list view in the platform.
 *
 * Features:
 * - Generic column definitions (label, accessor, sortable, render)
 * - Client-side column sort (asc / desc toggle)
 * - Row selection with select-all checkbox
 * - Empty state slot
 * - Loading skeleton rows
 *
 * Usage:
 * ```tsx
 * type Member = { id: string; name: string; role: string };
 *
 * const columns: Column<Member>[] = [
 *   { key: 'name',  label: 'Name',  sortable: true },
 *   { key: 'role',  label: 'Role' },
 * ];
 *
 * <DataTable
 *   columns={columns}
 *   data={members}
 *   rowKey="id"
 * />
 * ```
 */
import { useState, type ReactNode } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Types ────────────────────────────────────────────────────────────────────

export type Column<T> = {
  key: keyof T & string;
  label: string;
  sortable?: boolean;
  /** Optional custom cell renderer */
  render?: (value: T[keyof T], row: T) => ReactNode;
  /** Optional column width class */
  className?: string;
};

type SortDir = 'asc' | 'desc';

type DataTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  rowKey: keyof T & string;
  selectable?: boolean;
  loading?: boolean;
  loadingRows?: number;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  className?: string;
};

// ── Component ─────────────────────────────────────────────────────────────────

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  rowKey,
  selectable = false,
  loading = false,
  loadingRows = 5,
  emptyMessage = 'No records found.',
  onRowClick,
  className,
}: DataTableProps<T>) {
  const [sortKey, setSortKey]       = useState<string | null>(null);
  const [sortDir, setSortDir]       = useState<SortDir>('asc');
  const [selected, setSelected]     = useState<Set<string>>(new Set());

  // ── Sorting ──────────────────────────────────────────────────────────────

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const sorted = sortKey
    ? [...data].sort((a, b) => {
        const av = a[sortKey];
        const bv = b[sortKey];
        const cmp = String(av ?? '').localeCompare(String(bv ?? ''), undefined, { numeric: true });
        return sortDir === 'asc' ? cmp : -cmp;
      })
    : data;

  // ── Selection ────────────────────────────────────────────────────────────

  const allSelected = data.length > 0 && selected.size === data.length;
  const someSelected = selected.size > 0 && !allSelected;

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(data.map((row) => String(row[rowKey]))));
    }
  }

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className={cn('data-table-wrap', className)}>
      <table className="data-table" aria-label="Data table">
        <thead className="data-table__head">
          <tr>
            {selectable && (
              <th className="data-table__th data-table__th--check" scope="col">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={allSelected}
                  ref={(el) => { if (el) el.indeterminate = someSelected; }}
                  onChange={toggleAll}
                  aria-label="Select all rows"
                />
                <span className="data-table__check-box" aria-hidden="true" />
              </th>
            )}
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={cn(
                  'data-table__th',
                  col.sortable && 'data-table__th--sortable',
                  col.className,
                )}
                aria-sort={
                  sortKey === col.key
                    ? sortDir === 'asc' ? 'ascending' : 'descending'
                    : col.sortable ? 'none' : undefined
                }
              >
                {col.sortable ? (
                  <button
                    type="button"
                    className="data-table__sort-btn"
                    onClick={() => handleSort(col.key)}
                  >
                    {col.label}
                    <span className="data-table__sort-icon" aria-hidden="true">
                      {sortKey === col.key
                        ? sortDir === 'asc'
                          ? <ChevronUp size={13} />
                          : <ChevronDown size={13} />
                        : <ChevronsUpDown size={13} />}
                    </span>
                  </button>
                ) : (
                  col.label
                )}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="data-table__body">
          {loading ? (
            Array.from({ length: loadingRows }).map((_, i) => (
              <tr key={i} className="data-table__row data-table__row--skeleton">
                {selectable && <td className="data-table__td"><div className="data-table__skeleton" /></td>}
                {columns.map((col) => (
                  <td key={col.key} className="data-table__td">
                    <div className="data-table__skeleton" />
                  </td>
                ))}
              </tr>
            ))
          ) : sorted.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (selectable ? 1 : 0)}
                className="data-table__empty"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sorted.map((row) => {
              const id = String(row[rowKey]);
              const isSelected = selected.has(id);
              return (
                <tr
                  key={id}
                  className={cn(
                    'data-table__row',
                    isSelected && 'data-table__row--selected',
                    onRowClick && 'data-table__row--clickable',
                  )}
                  onClick={() => onRowClick?.(row)}
                  tabIndex={onRowClick ? 0 : undefined}
                  onKeyDown={(e) => { if (onRowClick && (e.key === 'Enter' || e.key === ' ')) onRowClick(row); }}
                >
                  {selectable && (
                    <td
                      className="data-table__td data-table__td--check"
                      onClick={(e) => { e.stopPropagation(); toggleRow(id); }}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={isSelected}
                        onChange={() => toggleRow(id)}
                        aria-label={`Select row ${id}`}
                      />
                      <span className="data-table__check-box" aria-hidden="true" />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} className={cn('data-table__td', col.className)}>
                      {col.render
                        ? col.render(row[col.key], row)
                        : String(row[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
