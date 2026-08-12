'use client';

/**
 * RecentActivityFeed — Day 45. Latest church signups, plan changes,
 * suspensions/restores, and feature-flag changes across the platform.
 */
import { UserPlus, ArrowUpRight, Ban, CheckCircle2, TrendingDown, ToggleLeft } from 'lucide-react';
import type { PlatformActivityItem } from '@/lib/superadmin';

const TYPE_META: Record<PlatformActivityItem['type'], { icon: React.ReactNode; color: string }> = {
  signup: { icon: <UserPlus size={14} />, color: '#2563eb' },
  plan_change: { icon: <ArrowUpRight size={14} />, color: '#274c3f' },
  suspend: { icon: <Ban size={14} />, color: '#b91c1c' },
  restore: { icon: <CheckCircle2 size={14} />, color: '#16a34a' },
  churn: { icon: <TrendingDown size={14} />, color: '#9a6000' },
  flag_change: { icon: <ToggleLeft size={14} />, color: '#7c3aed' },
};

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diffMs / 3_600_000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function RecentActivityFeed({ items }: { items: PlatformActivityItem[] }) {
  if (items.length === 0) {
    return <p className="sa-activity__empty">No platform activity yet.</p>;
  }

  return (
    <div className="sa-activity">
      {items.map((item) => {
        const meta = TYPE_META[item.type];
        return (
          <div key={item.id} className="sa-activity__item">
            <span className="sa-activity__dot" style={{ background: `${meta.color}18`, color: meta.color }}>
              {meta.icon}
            </span>
            <div className="sa-activity__copy">
              <strong>{item.churchName}</strong>
              <p>{item.description}</p>
            </div>
            <span className="sa-activity__time">{relativeTime(item.createdAt)}</span>
          </div>
        );
      })}
    </div>
  );
}

export default RecentActivityFeed;
