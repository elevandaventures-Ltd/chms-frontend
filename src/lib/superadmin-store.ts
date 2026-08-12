/**
 * superadmin-store.ts — in-memory mock "database" for the superadmin API
 * routes when Supabase env vars are absent.
 *
 * A plain module-level array (not a fresh copy per request) so that
 * suspend/restore, plan changes, and feature-flag toggles made during a
 * dev session are immediately visible across the churches table, the
 * metrics dashboard, the audit log, and the activity feed — without this,
 * every mock mutation would silently no-op like the read-only mock PATCH
 * routes elsewhere in the app, which would make the suspend/restore review
 * flow (Day 43) impossible to verify without a real Supabase project.
 * Resets on server restart — this is a dev convenience, not persistence.
 */
import {
  mockChurches, type SuperadminChurch,
  mockAuditLog, type AuditLogEntry,
  mockPlatformActivity, type PlatformActivityItem,
  mockChurchFlags, featureFlagCatalog, getChurchFlags,
  type ChurchFeatureFlagState, type FeatureFlagKey,
} from '@/lib/superadmin';
import { mockSubscription, mockInvoices, planById, type Subscription, type Invoice } from '@/lib/billing';

const churches: SuperadminChurch[] = mockChurches.map((c) => ({ ...c }));
let auditLog: AuditLogEntry[] = [...mockAuditLog];
let activity: PlatformActivityItem[] = [...mockPlatformActivity];
const churchFlags = new Map<string, ChurchFeatureFlagState[]>(
  Object.entries(mockChurchFlags).map(([id, flags]) => [id, flags.map((f) => ({ ...f }))]),
);

// ── Churches ──────────────────────────────────────────────────────────────────

export function listChurches(): SuperadminChurch[] {
  return churches;
}

export function getChurch(id: string): SuperadminChurch | undefined {
  return churches.find((c) => c.id === id);
}

export function setChurchSuspended(id: string, suspended: boolean, actorLabel = 'Platform Owner'): SuperadminChurch | undefined {
  const church = churches.find((c) => c.id === id);
  if (!church) return undefined;

  church.status = suspended ? 'suspended' : 'active';

  addAuditEntry({
    actorLabel,
    action: suspended ? 'church.suspended' : 'church.restored',
    targetType: 'church',
    targetId: id,
    churchName: church.name,
  });
  addActivity({
    type: suspended ? 'suspend' : 'restore',
    churchName: church.name,
    description: suspended ? 'Suspended for a policy or billing review.' : 'Restored — access returned to normal.',
  });

  return church;
}

export function setChurchPlan(id: string, plan: SuperadminChurch['plan'], actorLabel = 'Platform Owner'): SuperadminChurch | undefined {
  const church = churches.find((c) => c.id === id);
  if (!church) return undefined;

  const prevPlan = church.plan;
  church.plan = plan;
  church.mrr = plan === 'enterprise' ? 199 : plan === 'growth' ? 49 : 0;

  addAuditEntry({
    actorLabel,
    action: 'subscription.plan_changed',
    targetType: 'subscription',
    targetId: id,
    churchName: church.name,
  });
  if (prevPlan !== plan) {
    addActivity({
      type: 'plan_change',
      churchName: church.name,
      description: `Changed plan from ${prevPlan} to ${plan}.`,
    });
  }

  return church;
}

// ── Audit log ─────────────────────────────────────────────────────────────────

export function listAuditLog(): AuditLogEntry[] {
  return auditLog;
}

export function addAuditEntry(entry: Omit<AuditLogEntry, 'id' | 'createdAt'>): AuditLogEntry {
  const full: AuditLogEntry = { ...entry, id: `a${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, createdAt: new Date().toISOString() };
  auditLog = [full, ...auditLog];
  return full;
}

// ── Activity feed ─────────────────────────────────────────────────────────────

export function listActivity(): PlatformActivityItem[] {
  return activity;
}

export function addActivity(entry: Omit<PlatformActivityItem, 'id' | 'createdAt'>): PlatformActivityItem {
  const full: PlatformActivityItem = { ...entry, id: `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, createdAt: new Date().toISOString() };
  activity = [full, ...activity];
  return full;
}

// ── Feature flags ─────────────────────────────────────────────────────────────

export function listChurchFlags(churchId: string): ChurchFeatureFlagState[] {
  return churchFlags.get(churchId) ?? getChurchFlags(churchId);
}

// ── Billing — subscription + invoices for the church-admin side (Day 42) ────

const subscriptions = new Map<string, Subscription>([[mockSubscription.churchId, { ...mockSubscription }]]);
const invoicesByChurch = new Map<string, Invoice[]>([[mockSubscription.churchId, mockInvoices.map((i) => ({ ...i }))]]);

export function getSubscription(churchId: string): Subscription {
  return subscriptions.get(churchId) ?? {
    churchId, plan: 'community', status: 'active', mrr: 0,
    currentPeriodStart: new Date().toISOString(),
    currentPeriodEnd: new Date(Date.now() + 30 * 86_400_000).toISOString(),
    cancelAtPeriodEnd: false,
  };
}

export function changeSubscriptionPlan(churchId: string, plan: SuperadminChurch['plan']): Subscription {
  const current = getSubscription(churchId);
  const next: Subscription = { ...current, plan, mrr: planById(plan).price, cancelAtPeriodEnd: false, status: 'active' };
  subscriptions.set(churchId, next);
  setChurchPlan(churchId, plan);
  return next;
}

export function setSubscriptionCancelAtPeriodEnd(churchId: string, cancel: boolean): Subscription {
  const current = getSubscription(churchId);
  const next: Subscription = { ...current, cancelAtPeriodEnd: cancel };
  subscriptions.set(churchId, next);
  const church = churches.find((c) => c.id === churchId);
  addAuditEntry({
    actorLabel: church?.contactName ?? 'Church admin',
    action: cancel ? 'subscription.cancel_scheduled' : 'subscription.cancel_reverted',
    targetType: 'subscription',
    targetId: churchId,
    churchName: church?.name,
  });
  return next;
}

export function listInvoices(churchId: string): Invoice[] {
  return invoicesByChurch.get(churchId) ?? [];
}

export function addInvoice(churchId: string, invoice: Invoice): Invoice[] {
  const current = invoicesByChurch.get(churchId) ?? [];
  const next = [invoice, ...current];
  invoicesByChurch.set(churchId, next);
  return next;
}

export function setChurchFlag(
  churchId: string,
  flagKey: FeatureFlagKey,
  enabled: boolean,
  actorLabel = 'Platform Owner',
): ChurchFeatureFlagState[] {
  const current = (churchFlags.get(churchId) ?? getChurchFlags(churchId)).map((f) => ({ ...f }));
  const idx = current.findIndex((f) => f.flagKey === flagKey);
  const changedAt = new Date().toISOString();

  if (idx >= 0) {
    current[idx] = { ...current[idx], enabled, changedAt, changedBy: actorLabel };
  } else {
    current.push({ flagKey, enabled, changedAt, changedBy: actorLabel });
  }
  churchFlags.set(churchId, current);

  const church = churches.find((c) => c.id === churchId);
  const flagMeta = featureFlagCatalog.find((f) => f.key === flagKey);

  addAuditEntry({
    actorLabel,
    action: 'feature_flag.toggled',
    targetType: 'flag',
    targetId: flagKey,
    churchName: church?.name,
  });
  addActivity({
    type: 'flag_change',
    churchName: church?.name ?? 'Unknown church',
    description: `${enabled ? 'Enabled' : 'Disabled'} "${flagMeta?.label ?? flagKey}".`,
  });

  return current;
}
