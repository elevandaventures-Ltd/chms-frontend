/**
 * /attendance/scan — QR check-in scanner (Day 22).
 *
 * Requests camera permission, shows a live preview, and scans for member QR
 * codes 5×/second via jsQR. A valid scan records a check-in and plays a success
 * animation before resetting for the next member.
 */
import { ScanView } from '@/components/attendance/ScanView';

export default function ScanPage() {
  return <ScanView />;
}
