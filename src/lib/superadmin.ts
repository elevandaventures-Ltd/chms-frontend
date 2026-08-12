/**
 * superadmin.ts — Platform Owner data and mock fixtures.
 *
 * Every API route under /api/superadmin/* tries Supabase first and falls
 * back to this mock data when env vars are absent or the query errors —
 * same convention as lib/site.ts and the rest of the platform.
 */

export type ChurchPlan = 'community' | 'growth' | 'enterprise';
export type ChurchStatus = 'active' | 'trial' | 'suspended' | 'churned';

export type SuperadminChurch = {
  id: string;
  name: string;
  denomination: string;
  plan: ChurchPlan;
  status: ChurchStatus;
  membersCount: number;
  country: string;
  city: string;
  latitude: number;
  longitude: number;
  mrr: number;
  lastActiveAt: string; // ISO
  contactName: string;
  contactEmail: string;
  createdAt: string; // ISO
};

export const PLAN_LABEL: Record<ChurchPlan, string> = {
  community: 'Community',
  growth: 'Growth',
  enterprise: 'Enterprise',
};

export const STATUS_LABEL: Record<ChurchStatus, string> = {
  active: 'Active',
  trial: 'Trial',
  suspended: 'Suspended',
  churned: 'Churned',
};

// ── Mock church registry — 16 churches across Africa ─────────────────────────

export const mockChurches: SuperadminChurch[] = [
  { id: 'c1',  name: 'Elevanda Chapel Accra',        denomination: 'Pentecostal',    plan: 'enterprise', status: 'active',    membersCount: 842, country: 'Ghana',        city: 'Accra',         latitude: 5.6037,   longitude: -0.1870, mrr: 199, lastActiveAt: hoursAgo(1),    contactName: 'Solomon Leek',    contactEmail: 's.leek@elevanda.org',     createdAt: monthsAgo(30) },
  { id: 'c2',  name: 'Redeemed House Lagos',         denomination: 'Baptist',        plan: 'growth',     status: 'active',    membersCount: 613, country: 'Nigeria',      city: 'Lagos',         latitude: 6.5244,   longitude: 3.3792,  mrr: 49,  lastActiveAt: hoursAgo(3),    contactName: 'Chidinma Okafor', contactEmail: 'chidinma@rhlagos.org',    createdAt: monthsAgo(26) },
  { id: 'c3',  name: 'Grace Assembly Nairobi',       denomination: 'Anglican',       plan: 'growth',     status: 'active',    membersCount: 401, country: 'Kenya',        city: 'Nairobi',       latitude: -1.2921,  longitude: 36.8219, mrr: 49,  lastActiveAt: hoursAgo(5),    contactName: 'Wanjiru Kamau',   contactEmail: 'wanjiru@graceassembly.ke', createdAt: monthsAgo(22) },
  { id: 'c4',  name: 'Kampala Covenant Church',      denomination: 'Non-denominational', plan: 'community', status: 'trial',  membersCount: 58,  country: 'Uganda',       city: 'Kampala',       latitude: 0.3476,   longitude: 32.5825, mrr: 0,   lastActiveAt: hoursAgo(9),    contactName: 'Moses Okello',    contactEmail: 'moses@covenantkla.org',    createdAt: daysAgo(12) },
  { id: 'c5',  name: 'Kigali Living Word',           denomination: 'Pentecostal',    plan: 'growth',     status: 'active',    membersCount: 287, country: 'Rwanda',       city: 'Kigali',        latitude: -1.9441,  longitude: 30.0619, mrr: 49,  lastActiveAt: hoursAgo(2),    contactName: 'Aline Uwase',     contactEmail: 'aline@livingwordkgl.rw',   createdAt: monthsAgo(18) },
  { id: 'c6',  name: 'Dar Harvest Fellowship',       denomination: 'Methodist',      plan: 'community',  status: 'active',    membersCount: 134, country: 'Tanzania',     city: 'Dar es Salaam', latitude: -6.7924,  longitude: 39.2083, mrr: 0,   lastActiveAt: daysAgo(1),     contactName: 'Furaha Mwakalinga',contactEmail: 'furaha@harvestdar.tz',    createdAt: monthsAgo(9) },
  { id: 'c7',  name: 'Lusaka Rock Chapel',           denomination: 'Baptist',        plan: 'community',  status: 'churned',   membersCount: 76,  country: 'Zambia',       city: 'Lusaka',        latitude: -15.3875, longitude: 28.3228, mrr: 0,   lastActiveAt: daysAgo(64),    contactName: 'Bwalya Mumba',     contactEmail: 'bwalya@rockchapel.zm',    createdAt: monthsAgo(20) },
  { id: 'c8',  name: 'Johannesburg Fellowship Hall', denomination: 'Anglican',       plan: 'enterprise', status: 'active',    membersCount: 1204,country: 'South Africa', city: 'Johannesburg',  latitude: -26.2041, longitude: 28.0473, mrr: 199, lastActiveAt: hoursAgo(1),    contactName: 'Thabo Nkosi',      contactEmail: 'thabo@jhbfellowship.co.za',createdAt: monthsAgo(34) },
  { id: 'c9',  name: 'Cape Town Vineyard',           denomination: 'Non-denominational', plan: 'growth', status: 'active',    membersCount: 358, country: 'South Africa', city: 'Cape Town',     latitude: -33.9249, longitude: 18.4241, mrr: 49,  lastActiveAt: hoursAgo(6),    contactName: 'Lerato van Wyk',  contactEmail: 'lerato@ctvineyard.co.za',  createdAt: monthsAgo(15) },
  { id: 'c10', name: 'Cairo Nile Congregation',      denomination: 'Coptic Orthodox',plan: 'growth',     status: 'active',    membersCount: 522, country: 'Egypt',        city: 'Cairo',         latitude: 30.0444,  longitude: 31.2357, mrr: 49,  lastActiveAt: hoursAgo(4),    contactName: 'Mariam Fahmy',     contactEmail: 'mariam@nilecongregation.eg',createdAt: monthsAgo(28) },
  { id: 'c11', name: 'Addis Grace Tabernacle',       denomination: 'Ethiopian Orthodox', plan: 'community', status: 'trial', membersCount: 41,  country: 'Ethiopia',     city: 'Addis Ababa',   latitude: 9.0250,   longitude: 38.7469, mrr: 0,   lastActiveAt: daysAgo(2),     contactName: 'Selamawit Tadesse',contactEmail: 'selam@gracetab.et',       createdAt: daysAgo(6) },
  { id: 'c12', name: 'Abidjan Bethel Church',        denomination: 'Pentecostal',    plan: 'community',  status: 'active',    membersCount: 97,  country: 'Ivory Coast',  city: 'Abidjan',       latitude: 5.3600,   longitude: -4.0083, mrr: 0,   lastActiveAt: daysAgo(3),     contactName: 'Kouassi Yao',      contactEmail: 'kouassi@betheladj.ci',    createdAt: monthsAgo(7) },
  { id: 'c13', name: 'Dakar Renewal Center',         denomination: 'Baptist',        plan: 'growth',     status: 'suspended', membersCount: 210, country: 'Senegal',      city: 'Dakar',         latitude: 14.7167,  longitude: -17.4677, mrr: 49, lastActiveAt: daysAgo(19),    contactName: 'Awa Diop',         contactEmail: 'awa@renewaldkr.sn',       createdAt: monthsAgo(11) },
  { id: 'c14', name: 'Kinshasa Restoration House',   denomination: 'Non-denominational', plan: 'community', status: 'active', membersCount: 165, country: 'DR Congo',     city: 'Kinshasa',      latitude: -4.4419,  longitude: 15.2663, mrr: 0,   lastActiveAt: hoursAgo(11),   contactName: 'Patrick Kabongo',  contactEmail: 'patrick@restorationkin.cd',createdAt: monthsAgo(5) },
  { id: 'c15', name: 'Casablanca Hope Fellowship',   denomination: 'Evangelical',    plan: 'community',  status: 'trial',    membersCount: 29,  country: 'Morocco',      city: 'Casablanca',    latitude: 33.5731,  longitude: -7.5898, mrr: 0,   lastActiveAt: daysAgo(1),     contactName: 'Yassine El Amrani',contactEmail: 'yassine@hopecasa.ma',     createdAt: daysAgo(20) },
  { id: 'c16', name: 'Harare New Life Assembly',     denomination: 'Pentecostal',    plan: 'growth',     status: 'active',    membersCount: 245, country: 'Zimbabwe',     city: 'Harare',        latitude: -17.8252, longitude: 31.0335, mrr: 49,  lastActiveAt: daysAgo(1),     contactName: 'Tendai Moyo',      contactEmail: 'tendai@newlifehre.zw',    createdAt: monthsAgo(13) },
];

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 3_600_000).toISOString();
}
function daysAgo(d: number): string {
  return new Date(Date.now() - d * 86_400_000).toISOString();
}
function monthsAgo(m: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - m);
  return d.toISOString();
}

// ── Derived platform metrics ─────────────────────────────────────────────────

export function computePlatformMetrics(churches: SuperadminChurch[]) {
  const active = churches.filter((c) => c.status === 'active' || c.status === 'trial');
  const mrr = churches
    .filter((c) => c.status === 'active' || c.status === 'suspended')
    .reduce((sum, c) => sum + c.mrr, 0);
  const arr = mrr * 12;
  const now = new Date();
  const newSignupsThisMonth = churches.filter((c) => {
    const d = new Date(c.createdAt);
    return d.getUTCFullYear() === now.getUTCFullYear() && d.getUTCMonth() === now.getUTCMonth();
  }).length;
  const churned = churches.filter((c) => c.status === 'churned').length;
  const churnRate = churches.length > 0 ? churned / churches.length : 0;

  return {
    mrr,
    arr,
    activeChurches: active.length,
    newSignupsThisMonth,
    churnedChurches: churned,
    churnRate,
    totalChurches: churches.length,
  };
}

/** 12-month MRR/ARR trend — hardcoded growth curve for the line chart. */
export const mrrTrend: { month: string; mrr: number }[] = [
  { month: '2025-08', mrr: 890 },
  { month: '2025-09', mrr: 980 },
  { month: '2025-10', mrr: 1120 },
  { month: '2025-11', mrr: 1230 },
  { month: '2025-12', mrr: 1180 },
  { month: '2026-01', mrr: 1340 },
  { month: '2026-02', mrr: 1490 },
  { month: '2026-03', mrr: 1610 },
  { month: '2026-04', mrr: 1690 },
  { month: '2026-05', mrr: 1750 },
  { month: '2026-06', mrr: 1830 },
  { month: '2026-07', mrr: 1902 },
];

/** New signups by month — bar chart. */
export const signupsByMonth: { month: string; count: number }[] = [
  { month: '2025-08', count: 3 },
  { month: '2025-09', count: 2 },
  { month: '2025-10', count: 4 },
  { month: '2025-11', count: 3 },
  { month: '2025-12', count: 1 },
  { month: '2026-01', count: 5 },
  { month: '2026-02', count: 4 },
  { month: '2026-03', count: 3 },
  { month: '2026-04', count: 2 },
  { month: '2026-05', count: 3 },
  { month: '2026-06', count: 4 },
  { month: '2026-07', count: 2 },
];

// ── Feature flags ─────────────────────────────────────────────────────────────

export type FeatureFlagKey =
  | 'communication_channels'
  | 'attendance_kiosk'
  | 'household_management'
  | 'bulk_member_import'
  | 'advanced_reporting'
  | 'meilisearch_search'
  | 'custom_domains'
  | 'api_access';

export type FeatureFlag = {
  key: FeatureFlagKey;
  label: string;
  description: string;
  category: string;
};

export const featureFlagCatalog: FeatureFlag[] = [
  { key: 'communication_channels', label: 'Communication Channels', description: 'SMS, email, WhatsApp, and push messaging.', category: 'Communication' },
  { key: 'attendance_kiosk',       label: 'Attendance Kiosk Mode',  description: 'Self check-in kiosk and QR scanner.',        category: 'Attendance' },
  { key: 'household_management',  label: 'Household Management',   description: 'Family/household linking and views.',        category: 'Members' },
  { key: 'bulk_member_import',     label: 'Bulk Member Import',     description: 'CSV import wizard for members.',             category: 'Members' },
  { key: 'advanced_reporting',     label: 'Advanced Reporting',     description: 'Analytics dashboards and trend charts.',     category: 'Analytics' },
  { key: 'meilisearch_search',     label: 'Instant Search',         description: 'Meilisearch-powered member search.',         category: 'Members' },
  { key: 'custom_domains',         label: 'Custom Domains',         description: 'Bring your own domain for the member portal.', category: 'Platform' },
  { key: 'api_access',             label: 'API Access',             description: 'Programmatic access via the ChMS API.',      category: 'Platform' },
];

export type ChurchFeatureFlagState = {
  flagKey: FeatureFlagKey;
  enabled: boolean;
  changedAt: string;
  changedBy: string;
};

/** Per-church flag state, keyed by church id. Defaults to all-enabled when absent. */
export const mockChurchFlags: Record<string, ChurchFeatureFlagState[]> = {
  c1: featureFlagCatalog.map((f, i) => ({ flagKey: f.key, enabled: true, changedAt: daysAgo(i + 2), changedBy: 'Platform Owner' })),
  c4: featureFlagCatalog.map((f) => ({
    flagKey: f.key,
    enabled: f.key !== 'custom_domains' && f.key !== 'api_access',
    changedAt: daysAgo(1),
    changedBy: 'Platform Owner',
  })),
};

export function getChurchFlags(churchId: string): ChurchFeatureFlagState[] {
  if (mockChurchFlags[churchId]) return mockChurchFlags[churchId];
  return featureFlagCatalog.map((f) => ({
    flagKey: f.key,
    enabled: true,
    changedAt: monthsAgo(1),
    changedBy: 'System default',
  }));
}

// ── Setup completion ──────────────────────────────────────────────────────────

export type SetupStep = { key: string; label: string; done: boolean };

export function getSetupSteps(church: SuperadminChurch): SetupStep[] {
  return [
    { key: 'denomination', label: 'Denomination selected', done: true },
    { key: 'logo', label: 'Logo uploaded', done: church.membersCount > 50 || church.plan !== 'community' },
    { key: 'first_member', label: 'First member added', done: church.membersCount > 0 },
    { key: 'first_event', label: 'First event created', done: church.status !== 'trial' },
    { key: 'communication', label: 'Communication channel connected', done: church.status === 'active' },
  ];
}

// ── Audit log ─────────────────────────────────────────────────────────────────

export type AuditLogEntry = {
  id: string;
  actorLabel: string;
  action: string;
  targetType: string;
  targetId: string;
  churchName?: string;
  createdAt: string;
};

export const mockAuditLog: AuditLogEntry[] = [
  { id: 'a1', actorLabel: 'Platform Owner', action: 'church.suspended', targetType: 'church', targetId: 'c13', churchName: 'Dakar Renewal Center', createdAt: daysAgo(19) },
  { id: 'a2', actorLabel: 'Platform Owner', action: 'feature_flag.toggled', targetType: 'flag', targetId: 'custom_domains', churchName: 'Kampala Covenant Church', createdAt: daysAgo(1) },
  { id: 'a3', actorLabel: 'Platform Owner', action: 'subscription.plan_changed', targetType: 'subscription', targetId: 'c9', churchName: 'Cape Town Vineyard', createdAt: daysAgo(4) },
  { id: 'a4', actorLabel: 'System', action: 'church.churned', targetType: 'church', targetId: 'c7', churchName: 'Lusaka Rock Chapel', createdAt: daysAgo(64) },
];

// ── Support tickets (support volume trend) ────────────────────────────────────

export const supportVolumeTrend: { week: string; opened: number; resolved: number }[] = [
  { week: 'Jun 1',  opened: 6,  resolved: 5 },
  { week: 'Jun 8',  opened: 9,  resolved: 7 },
  { week: 'Jun 15', opened: 7,  resolved: 8 },
  { week: 'Jun 22', opened: 11, resolved: 9 },
  { week: 'Jun 29', opened: 8,  resolved: 10 },
  { week: 'Jul 6',  opened: 12, resolved: 10 },
  { week: 'Jul 13', opened: 10, resolved: 11 },
  { week: 'Jul 20', opened: 6,  resolved: 8 },
];

// ── Recent platform activity feed ─────────────────────────────────────────────

export type PlatformActivityItem = {
  id: string;
  type: 'signup' | 'plan_change' | 'suspend' | 'restore' | 'churn' | 'flag_change';
  churchName: string;
  description: string;
  createdAt: string;
};

export const mockPlatformActivity: PlatformActivityItem[] = [
  { id: 'p1', type: 'signup',      churchName: 'Casablanca Hope Fellowship', description: 'Signed up on the Community plan.',        createdAt: daysAgo(20) },
  { id: 'p2', type: 'signup',      churchName: 'Addis Grace Tabernacle',      description: 'Signed up on the Community plan (trial).', createdAt: daysAgo(6) },
  { id: 'p3', type: 'plan_change', churchName: 'Cape Town Vineyard',          description: 'Upgraded from Community to Growth.',       createdAt: daysAgo(4) },
  { id: 'p4', type: 'suspend',     churchName: 'Dakar Renewal Center',        description: 'Suspended for a failed payment.',          createdAt: daysAgo(19) },
  { id: 'p5', type: 'churn',       churchName: 'Lusaka Rock Chapel',          description: 'Subscription canceled — churned.',        createdAt: daysAgo(64) },
  { id: 'p6', type: 'signup',      churchName: 'Kampala Covenant Church',     description: 'Signed up on the Community plan (trial).', createdAt: daysAgo(12) },
  { id: 'p7', type: 'plan_change', churchName: 'Kigali Living Word',          description: 'Upgraded from Community to Growth.',       createdAt: daysAgo(45) },
];
