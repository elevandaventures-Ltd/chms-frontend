'use client';

import dynamic from 'next/dynamic';
import { MemberCardSkeleton } from '@/components/members/MemberCardSkeleton';

const MemberDirectory = dynamic(
  () => import('@/components/members/MemberDirectory').then(m => m.MemberDirectory),
  {
    ssr: false,
    loading: () => (
      <div className="member-dir__grid">
        {Array.from({ length: 12 }).map((_, i) => <MemberCardSkeleton key={i} />)}
      </div>
    ),
  },
);

export default function MembersClient() {
  return <MemberDirectory />;
}
