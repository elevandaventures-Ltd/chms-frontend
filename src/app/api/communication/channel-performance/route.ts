/**
 * GET /api/communication/channel-performance — channel delivery-rate
 * comparison, best-time-to-send heatmap, and category breakdown (Day 40).
 */
import { NextResponse } from 'next/server';
import {
  channelDeliveryRates, heatmapEngagement, categoryPerformance,
  HEATMAP_DAYS, HEATMAP_HOURS,
} from '@/lib/channel-performance';

export async function GET() {
  return NextResponse.json({
    data: {
      channels: channelDeliveryRates,
      heatmap: { days: HEATMAP_DAYS, hours: HEATMAP_HOURS, values: heatmapEngagement },
      categories: categoryPerformance,
    },
  });
}
