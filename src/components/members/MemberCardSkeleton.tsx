/**
 * MemberCardSkeleton — shimmer placeholder card matching MemberCard dimensions.
 * Shown in a grid while the API is loading.
 */
export function MemberCardSkeleton() {
  return (
    <div className="member-card member-card--skeleton" aria-hidden="true">
      {/* Photo area */}
      <div className="member-card__photo-wrap">
        <div className="skeleton-shimmer" style={{ width: '100%', height: '100%' }} />
      </div>

      {/* Body */}
      <div className="member-card__body">
        <div className="member-card__identity">
          <div className="skeleton-shimmer skeleton-line skeleton-line--name" />
          <div className="skeleton-shimmer skeleton-line skeleton-line--role" />
        </div>
        <div className="member-card__contact">
          <div className="skeleton-shimmer skeleton-line skeleton-line--email" />
          <div className="skeleton-shimmer skeleton-line skeleton-line--phone" />
        </div>
        <div className="member-card__tags">
          <div className="skeleton-shimmer skeleton-tag" />
          <div className="skeleton-shimmer skeleton-tag" />
        </div>
      </div>
    </div>
  );
}

export function MemberDirectorySkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="member-dir__grid" aria-label="Loading members" aria-busy="true">
      {Array.from({ length: count }).map((_, i) => (
        <MemberCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default MemberCardSkeleton;
