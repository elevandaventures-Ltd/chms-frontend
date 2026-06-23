/**
 * /attendance — Attendance sessions page (Day 21).
 *
 * AttendanceView handles its own data fetching via GET /api/attendance/sessions.
 * Falls back to mock test data when Supabase is not configured.
 */
import { AttendanceView } from '@/components/attendance/AttendanceView';

export default function AttendancePage() {
  return <AttendanceView />;
}
