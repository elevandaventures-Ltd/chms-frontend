'use client';

/**
 * /superadmin — Platform health dashboard.
 * Day 43: MRR/ARR/Active Churches/New Signups/Churned KPI row + MRR trend,
 *         signups bar chart, churn gauge.
 * Day 45: Geographic distribution map, support volume trend, recent
 *         platform activity feed.
 */
import { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, Building2, UserPlus, TrendingDown } from 'lucide-react';
import { MrrTrendChart, SignupsBarChart, ChurnRateGauge } from '@/components/superadmin/PlatformCharts';
import { GeoDistributionMap } from '@/components/superadmin/GeoDistributionMap';
import { SupportVolumeChart } from '@/components/superadmin/SupportVolumeChart';
import { RecentActivityFeed } from '@/components/superadmin/RecentActivityFeed';
import type { SuperadminChurch, PlatformActivityItem } from '@/lib/superadmin';

type Metrics = {
  mrr: number; arr: number; activeChurches: number; newSignupsThisMonth: number;
  churnedChurches: number; churnRate: number; totalChurches: number;
  mrrTrend: { month: string; mrr: number }[];
  signupsByMonth: { month: string; count: number }[];
};

export default function SuperadminDashboardPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [churches, setChurches] = useState<SuperadminChurch[]>([]);
  const [activity, setActivity] = useState<PlatformActivityItem[]>([]);
  const [supportVolume, setSupportVolume] = useState<{ week: string; opened: number; resolved: number }[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const [mRes, cRes, aRes, sRes] = await Promise.all([
          fetch('/api/superadmin/metrics'),
          fetch('/api/superadmin/churches'),
          fetch('/api/superadmin/activity'),
          fetch('/api/superadmin/support-volume'),
        ]);
        const [mJson, cJson, aJson, sJson] = await Promise.all([
          mRes.json() as Promise<{ data?: Metrics }>,
          cRes.json() as Promise<{ data?: SuperadminChurch[] }>,
          aRes.json() as Promise<{ data?: PlatformActivityItem[] }>,
          sRes.json() as Promise<{ data?: typeof supportVolume }>,
        ]);
        if (mJson.data) setMetrics(mJson.data);
        if (cJson.data) setChurches(cJson.data);
        if (aJson.data) setActivity(aJson.data);
        if (sJson.data) setSupportVolume(sJson.data);
      } catch { /* keep empty state */ }
    }
    void load();
  }, []);

  const kpis = metrics ? [
    { label: 'MRR', value: `$${metrics.mrr.toLocaleString()}`, sub: 'Monthly recurring revenue', icon: <DollarSign size={18} />, color: '#274c3f' },
    { label: 'ARR', value: `$${metrics.arr.toLocaleString()}`, sub: 'Annualized run rate', icon: <TrendingUp size={18} />, color: '#2563eb' },
    { label: 'Active Churches', value: metrics.activeChurches, sub: `of ${metrics.totalChurches} total`, icon: <Building2 size={18} />, color: '#b25131' },
    { label: 'New Signups', value: metrics.newSignupsThisMonth, sub: 'This month', icon: <UserPlus size={18} />, color: '#7c3aed' },
    { label: 'Churned Churches', value: metrics.churnedChurches, sub: `${(metrics.churnRate * 100).toFixed(1)}% churn rate`, icon: <TrendingDown size={18} />, color: '#9a6000' },
  ] : [];

  return (
    <div className="sa-dashboard">
      <div className="sa-dashboard__kpi-row">
        {kpis.length === 0
          ? Array.from({ length: 5 }).map((_, i) => <div key={i} className="sa-kpi-card sa-kpi-card--skeleton" />)
          : kpis.map((k) => (
            <div key={k.label} className="sa-kpi-card">
              <span className="sa-kpi-card__icon" style={{ background: `${k.color}14`, color: k.color }}>{k.icon}</span>
              <div className="sa-kpi-card__value">{k.value}</div>
              <div className="sa-kpi-card__label">{k.label}</div>
              <div className="sa-kpi-card__sub">{k.sub}</div>
            </div>
          ))}
      </div>

      <div className="sa-dashboard__grid">
        <section className="sa-panel sa-panel--span2">
          <h2 className="sa-panel__title">MRR trend — last 12 months</h2>
          {metrics && <MrrTrendChart data={metrics.mrrTrend} />}
        </section>

        <section className="sa-panel">
          <h2 className="sa-panel__title">Churn rate</h2>
          {metrics && <ChurnRateGauge rate={metrics.churnRate} />}
        </section>

        <section className="sa-panel">
          <h2 className="sa-panel__title">New signups by month</h2>
          {metrics && <SignupsBarChart data={metrics.signupsByMonth} />}
        </section>

        <section className="sa-panel sa-panel--span2">
          <h2 className="sa-panel__title">Support ticket volume</h2>
          {supportVolume.length > 0 && <SupportVolumeChart data={supportVolume} />}
        </section>

        <section className="sa-panel sa-panel--span2">
          <h2 className="sa-panel__title">Geographic distribution</h2>
          <p className="sa-panel__subtitle">{churches.filter((c) => c.latitude).length} churches across Africa</p>
          <GeoDistributionMap churches={churches} />
        </section>

        <section className="sa-panel">
          <h2 className="sa-panel__title">Recent activity</h2>
          <RecentActivityFeed items={activity} />
        </section>
      </div>
    </div>
  );
}
