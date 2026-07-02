'use client';

/**
 * /attendance — Attendance page with tabs (Day 23 + 24).
 *
 * Tabs:
 *   - Sessions   — existing AttendanceView with live counter widget
 *   - Kids Church — KidsCheckIn component
 *   - History     — attendance history list (Day 25)
 */
import { useState } from 'react';
import { AttendanceView } from '@/components/attendance/AttendanceView';
import { KidsCheckIn }    from '@/components/attendance/KidsCheckIn';
import { AttendanceHistory } from '@/components/attendance/AttendanceHistory';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';

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
