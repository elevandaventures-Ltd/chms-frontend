'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';

const AttendanceView   = dynamic(() => import('@/components/attendance/AttendanceView').then(m => m.AttendanceView), { ssr: false, loading: () => <div className="att-card att-card--skeleton" style={{ height: 200 }} /> });
const KidsCheckIn      = dynamic(() => import('@/components/attendance/KidsCheckIn').then(m => m.KidsCheckIn), { ssr: false });
const AttendanceHistory = dynamic(() => import('@/components/attendance/AttendanceHistory').then(m => m.AttendanceHistory), { ssr: false });

export default function AttendancePage() {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  return (
    <div className="att-tabs-page">
      <Tabs defaultValue="sessions">
        <TabsList>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="kids">Kids Church</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="sessions">
          <AttendanceView onActiveSession={setActiveSessionId} />
        </TabsContent>

        <TabsContent value="kids">
          <KidsCheckIn sessionId={activeSessionId ?? 'demo'} />
        </TabsContent>

        <TabsContent value="history">
          <AttendanceHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}
