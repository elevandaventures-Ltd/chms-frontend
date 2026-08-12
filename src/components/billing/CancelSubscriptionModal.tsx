'use client';

/**
 * CancelSubscriptionModal — Day 42. Confirmation step before scheduling a
 * cancellation at the end of the current billing period.
 */
import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

type Props = {
  open: boolean;
  onClose: () => void;
  periodEnd: string;
  onConfirm: () => Promise<void>;
};

export function CancelSubscriptionModal({ open, onClose, periodEnd, onConfirm }: Props) {
  const [busy, setBusy] = useState(false);

  async function handleConfirm() {
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      setBusy(false);
    }
  }

  const endDate = new Date(periodEnd).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <Modal open={open} onClose={onClose} title="Cancel subscription">
      <div className="csm">
        <div className="csm__warning">
          <AlertTriangle size={18} aria-hidden="true" />
          <p>
            Your church will keep full access until <strong>{endDate}</strong>, then drop to the free
            Community plan. Members, attendance, and events are never deleted.
          </p>
        </div>
        <div className="csm__actions">
          <button type="button" className="sa-btn sa-btn--secondary" onClick={onClose} disabled={busy}>
            Keep my plan
          </button>
          <button type="button" className="sa-btn sa-btn--danger" onClick={handleConfirm} disabled={busy}>
            {busy ? 'Canceling…' : 'Confirm cancellation'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default CancelSubscriptionModal;
