'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { MemberForm } from '@/components/members/MemberForm';
import type { MemberFormValues } from '@/lib/member-schema';

// Shape returned by GET /api/members/:id — form values plus the current photo.
type EditMemberPayload = Partial<MemberFormValues> & { photoUrl?: string | null };

type EditMemberFormProps = {
  memberId:  string;
  onClose:   () => void;
  onUpdated: (member: { id: string; fullName: string }) => void;
};

// ── Component ─────────────────────────────────────────────────────────────────
//
// Loads the full member record, then renders the shared MemberForm in "edit"
// mode pre-populated with the fetched values. Shares the exact same Zod schema
// and fields as the Add Member form.

export function EditMemberForm({ memberId, onClose, onUpdated }: EditMemberFormProps) {
  const [values,   setValues]   = useState<EditMemberPayload | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [error,    setError]    = useState('');

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/members/${memberId}`)
      .then(async (r) => {
        if (!r.ok) throw new Error('Could not load member.');
        return r.json();
      })
      .then((j: { data?: EditMemberPayload }) => {
        if (cancelled) return;
        if (!j.data) throw new Error('Member not found.');
        const { photoUrl: url, ...rest } = j.data;
        setValues(rest);
        setPhotoUrl(url ?? null);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load member.');
      });

    return () => { cancelled = true; };
  }, [memberId]);

  // ── Loading / error state — render inside the same overlay/sheet shell ──────
  if (!values) {
    return (
      <div className="amf-overlay" role="dialog" aria-modal="true" aria-label="Edit member">
        <div className="amf-sheet">
          <div className="amf-header">
            <h2 className="amf-header__title">Edit Member</h2>
            <button type="button" className="amf-header__close" onClick={onClose} aria-label="Close">
              <X size={18} />
            </button>
          </div>
          <div className="amf-body">
            {error
              ? <p className="amf-server-error" role="alert">{error}</p>
              : <p className="amf-photo-hint">Loading member details…</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <MemberForm
      mode="edit"
      memberId={memberId}
      initialValues={values}
      initialPhotoUrl={photoUrl}
      onClose={onClose}
      onSaved={onUpdated}
    />
  );
}

export default EditMemberForm;
