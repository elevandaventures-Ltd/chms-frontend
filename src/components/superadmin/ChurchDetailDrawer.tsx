'use client';

/**
 * ChurchDetailDrawer — Day 41/43/44.
 *
 * Slide-out panel opened by clicking a row in the church management table.
 * Shows contact/plan info, the Setup Completion health-score widget
 * (Day 44), and the suspend/restore control that drives church-admin
 * read-only mode (Day 43 review flow).
 */
import { useState } from 'react';
import Link from 'next/link';
import { Ban, CheckCircle2, Mail, MapPin, ShieldAlert, ToggleLeft } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { Badge } from '@/components/ui/Badge';
import { PLAN_LABEL, STATUS_LABEL, getSetupSteps, type SuperadminChurch } from '@/lib/superadmin';

type Props = {
  church: SuperadminChurch | null;
  open: boolean;
  onClose: () => void;
  onChanged: (church: SuperadminChurch) => void;
};

const STATUS_TONE: Record<SuperadminChurch['status'], 'success' | 'warning' | 'danger' | 'default'> = {
  active: 'success', trial: 'warning', suspended: 'danger', churned: 'default',
};

export function ChurchDetailDrawer({ church, open, onClose, onChanged }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!church) return <Drawer open={open} onClose={onClose} title="Church detail" />;

  const steps = getSetupSteps(church);
  const donePct = Math.round((steps.filter((s) => s.done).length / steps.length) * 100);
  const isSuspended = church.status === 'suspended';

  async function toggleSuspend() {
    if (!church) return;
    setBusy(true);
    setError('');
    try {
      const res = await fetch(`/api/superadmin/churches/${church.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isSuspended: !isSuspended }),
      });
      const json = await res.json() as { data?: SuperadminChurch; error?: string };
      if (!res.ok || !json.data) throw new Error(json.error ?? 'Request failed');
      onChanged(json.data);
    } catch {
      setError('Could not update church status. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Drawer open={open} onClose={onClose} title={church.name}>
      <div className="sa-church-detail">
        <div className="sa-church-detail__head">
          <Badge tone={STATUS_TONE[church.status]}>{STATUS_LABEL[church.status]}</Badge>
          <span className="sa-church-detail__plan">{PLAN_LABEL[church.plan]} plan</span>
        </div>

        {isSuspended && (
          <div className="sa-church-detail__notice">
            <ShieldAlert size={15} aria-hidden="true" />
            This church is suspended — its admins see a read-only workspace until restored.
          </div>
        )}

        <dl className="sa-church-detail__facts">
          <div>
            <dt>Denomination</dt>
            <dd>{church.denomination || '—'}</dd>
          </div>
          <div>
            <dt>Contact</dt>
            <dd>
              {church.contactName}
              <a href={`mailto:${church.contactEmail}`} className="sa-church-detail__mail">
                <Mail size={12} aria-hidden="true" /> {church.contactEmail}
              </a>
            </dd>
          </div>
          <div>
            <dt>Location</dt>
            <dd>
              <MapPin size={12} aria-hidden="true" /> {church.city}, {church.country}
            </dd>
          </div>
          <div>
            <dt>Members</dt>
            <dd>{church.membersCount.toLocaleString()}</dd>
          </div>
          <div>
            <dt>MRR</dt>
            <dd>${church.mrr.toLocaleString()}/mo</dd>
          </div>
        </dl>

        <section className="sa-setup-widget">
          <div className="sa-setup-widget__head">
            <h4>Setup completion</h4>
            <span className="sa-setup-widget__pct">{donePct}%</span>
          </div>
          <div className="sa-setup-widget__track">
            <div className="sa-setup-widget__fill" style={{ width: `${donePct}%` }} />
          </div>
          <ul className="sa-setup-widget__steps">
            {steps.map((s) => (
              <li key={s.key} className={s.done ? 'sa-setup-widget__step--done' : ''}>
                <CheckCircle2 size={13} aria-hidden="true" />
                {s.label}
              </li>
            ))}
          </ul>
        </section>

        {error && <p className="sa-church-detail__error">{error}</p>}

        <div className="sa-church-detail__actions">
          <button
            type="button"
            className={isSuspended ? 'sa-btn sa-btn--primary' : 'sa-btn sa-btn--danger'}
            onClick={toggleSuspend}
            disabled={busy}
          >
            {isSuspended ? <CheckCircle2 size={14} aria-hidden="true" /> : <Ban size={14} aria-hidden="true" />}
            {busy ? 'Working…' : isSuspended ? 'Restore access' : 'Suspend church'}
          </button>
          <Link href={`/superadmin/feature-flags?churchId=${church.id}`} className="sa-btn sa-btn--secondary">
            <ToggleLeft size={14} aria-hidden="true" />
            Manage feature flags
          </Link>
        </div>
      </div>
    </Drawer>
  );
}

export default ChurchDetailDrawer;
