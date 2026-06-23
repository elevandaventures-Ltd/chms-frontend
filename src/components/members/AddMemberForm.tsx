'use client';

import { MemberForm } from '@/components/members/MemberForm';

// ── Props ─────────────────────────────────────────────────────────────────────

type AddMemberFormProps = {
  onClose:   () => void;
  onCreated: (member: { id: string; fullName: string }) => void;
};

// ── Component ─────────────────────────────────────────────────────────────────
//
// Thin wrapper over the shared MemberForm in "add" mode. Kept as its own
// component so the public API used by MemberDirectory (onCreated) is unchanged.

export function AddMemberForm({ onClose, onCreated }: AddMemberFormProps) {
  return (
    <MemberForm
      mode="add"
      onClose={onClose}
      onSaved={onCreated}
    />
  );
}

export default AddMemberForm;
