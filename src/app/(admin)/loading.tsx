/**
 * loading.tsx — instant navigation feedback for every page under the
 * (admin) route group. Next.js shows this the moment a click starts a
 * navigation, before the destination page's own JS/data has finished —
 * without it, clicking a nav link shows nothing at all until the target
 * page is fully ready, which is what made navigation feel slow.
 */
export default function AdminSectionLoading() {
  return (
    <div className="route-loading" role="status" aria-label="Loading page">
      <div className="route-loading__bar" style={{ width: '38%' }} />
      <div className="route-loading__row">
        <div className="skeleton-shimmer route-loading__block" style={{ height: 96 }} />
        <div className="skeleton-shimmer route-loading__block" style={{ height: 96 }} />
        <div className="skeleton-shimmer route-loading__block" style={{ height: 96 }} />
      </div>
      <div className="skeleton-shimmer route-loading__block" style={{ height: 220 }} />
    </div>
  );
}
