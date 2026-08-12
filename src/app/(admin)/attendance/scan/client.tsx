'use client';

import dynamic from 'next/dynamic';

const ScanView = dynamic(
  () => import('@/components/attendance/ScanView').then(m => m.ScanView),
  { ssr: false },
);

export default function ScanClient() {
  return <ScanView />;
}
