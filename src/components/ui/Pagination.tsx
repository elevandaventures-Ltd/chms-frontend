"use client";

/**
 * Pagination — page navigation component for all list views.
 *
 * Used in Member Directory, Attendance records, Finance transactions, etc.
 *
 * Usage:
 * ```tsx
 * <Pagination
 *   page={1}
 *   pageSize={20}
 *   total={153}
 *   onPageChange={(page) => setPage(page)}
 * />
 * ```
 */
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

type PaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  className?: string;
};

function getPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  if (current <= 4) return [1, 2, 3, 4, 5, 'ellipsis', total];
  if (current >= total - 3) return [1, 'ellipsis', total - 4, total - 3, total - 2, total - 1, total];

  return [1, 'ellipsis', current - 1, current, current + 1, 'ellipsis', total];
}

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  className,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = Math.min((page - 1) * pageSize + 1, total);
  const to   = Math.min(page * pageSize, total);
  const pages = getPageNumbers(page, totalPages);

  if (totalPages <= 1) return null;

  return (
    <nav
      className={cn('pagination', className)}
      aria-label="Pagination"
    >
      {/* Summary */}
      <p className="pagination__summary">
        Showing <strong>{from}</strong>–<strong>{to}</strong> of <strong>{total}</strong>
      </p>

      <div className="pagination__controls">
        {/* Previous */}
        <button
          type="button"
          className="pagination__btn"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} aria-hidden="true" />
        </button>

        {/* Page numbers */}
        {pages.map((p, idx) =>
          p === 'ellipsis' ? (
            <span key={`ellipsis-${idx}`} className="pagination__ellipsis">
              <MoreHorizontal size={16} aria-hidden="true" />
            </span>
          ) : (
            <button
              key={p}
              type="button"
              className={cn('pagination__btn', p === page && 'pagination__btn--active')}
              onClick={() => onPageChange(p)}
              aria-label={`Page ${p}`}
              aria-current={p === page ? 'page' : undefined}
            >
              {p}
            </button>
          )
        )}

        {/* Next */}
        <button
          type="button"
          className="pagination__btn"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          aria-label="Next page"
        >
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}

export default Pagination;
