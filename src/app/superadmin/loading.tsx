/**
 * loading.tsx — instant navigation feedback for the superadmin workspace,
 * same reasoning as (admin)/loading.tsx.
 */
export default function SuperadminSectionLoading() {
  return (
    <div className="route-loading" role="status" aria-label="Loading page">
      <div className="route-loading__bar" style={{ width: '32%' }} />
      <div className="route-loading__row">
        <div className="skeleton-shimmer route-loading__block" style={{ height: 88 }} />
        <div className="skeleton-shimmer route-loading__block" style={{ height: 88 }} />
      </div>
      <div className="skeleton-shimmer route-loading__block" style={{ height: 260 }} />
    </div>
  );
}
