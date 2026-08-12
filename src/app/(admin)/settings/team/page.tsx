'use client';

/**
 * /settings/team — Day 46. Staff list table (name, role, last active,
 * status), "Invite Staff Member" button, role dropdown per row.
 */
import { useCallback, useEffect, useState } from 'react';
import { UserPlus, Mail, Trash2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { ROLE_LABEL, INVITABLE_ROLES, type StaffMember, type Invitation } from '@/lib/team';
import type { UserRole } from '@/lib/site';

const STATUS_TONE: Record<StaffMember['status'], 'success' | 'warning' | 'danger' | 'default'> = {
  active: 'success', invited: 'warning', suspended: 'danger',
};

function relTime(iso: string): string {
  const diffH = Math.floor((Date.now() - new Date(iso).getTime()) / 3_600_000);
  if (diffH < 1) return 'Just now';
  if (diffH < 24) return `${diffH}h ago`;
  return `${Math.floor(diffH / 24)}d ago`;
}

export default function TeamManagementPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('staff');
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [toast, setToast] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sRes, iRes] = await Promise.all([fetch('/api/team'), fetch('/api/team/invitations')]);
      const sJson = await sRes.json() as { data?: StaffMember[] };
      const iJson = await iRes.json() as { data?: Invitation[] };
      setStaff(sJson.data ?? []);
      setInvitations(iJson.data ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  }

  async function handleRoleChange(id: string, role: UserRole) {
    setStaff((prev) => prev.map((s) => (s.id === id ? { ...s, role } : s)));
    await fetch(`/api/team/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    flash('Role updated.');
  }

  async function handleRemove(id: string) {
    await fetch(`/api/team/${id}`, { method: 'DELETE' });
    setStaff((prev) => prev.filter((s) => s.id !== id));
    flash('Staff member removed.');
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true);
    setInviteError('');
    try {
      const res = await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      });
      const json = await res.json() as { data?: Invitation; message?: string; mock?: boolean };
      if (!res.ok || !json.data) { setInviteError(json.message ?? 'Failed to send invitation.'); return; }
      setInvitations((prev) => [json.data!, ...prev]);
      setInviteOpen(false);
      setInviteEmail('');
      flash(`Invitation sent to ${json.data.email}${json.mock ? ' (mock email — no provider configured)' : ''}.`);
    } finally {
      setInviting(false);
    }
  }

  const pendingInvites = invitations.filter((i) => i.status === 'pending');

  return (
    <div className="team-page">
      <div className="team-page__head">
        <div>
          <h1>Team</h1>
          <p>Staff accounts and their roles for this church.</p>
        </div>
        <button type="button" className="sa-btn sa-btn--primary" onClick={() => setInviteOpen(true)}>
          <UserPlus size={14} aria-hidden="true" /> Invite Staff Member
        </button>
      </div>

      {toast && <div className="comm-toast" role="status" aria-live="polite">{toast}</div>}

      <div className="team-table-wrap">
        <table className="team-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Last active</th>
              <th>Status</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5}><div className="skeleton-shimmer" style={{ height: 14, borderRadius: 6 }} /></td></tr>
            ) : staff.map((s) => (
              <tr key={s.id}>
                <td>
                  <strong className="team-table__name">{s.name}</strong>
                  <span className="team-table__email">{s.email}</span>
                </td>
                <td>
                  <select
                    className="team-table__role-select"
                    value={s.role}
                    onChange={(e) => handleRoleChange(s.id, e.target.value as UserRole)}
                    disabled={s.role === 'admin' && staff.filter((x) => x.role === 'admin').length === 1}
                  >
                    {(['admin', 'pastor', 'finance', 'ministry_leader', 'staff', 'member'] as UserRole[]).map((r) => (
                      <option key={r} value={r}>{ROLE_LABEL[r]}</option>
                    ))}
                  </select>
                </td>
                <td>{relTime(s.lastActiveAt)}</td>
                <td><Badge tone={STATUS_TONE[s.status]}>{s.status}</Badge></td>
                <td>
                  <button type="button" className="team-table__remove" onClick={() => handleRemove(s.id)} aria-label={`Remove ${s.name}`}>
                    <Trash2 size={13} aria-hidden="true" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pendingInvites.length > 0 && (
        <section className="team-invites">
          <h2>Pending invitations</h2>
          <div className="team-invites__rows">
            {pendingInvites.map((i) => (
              <div key={i.id} className="team-invites__row">
                <Mail size={13} aria-hidden="true" />
                <span>{i.email}</span>
                <span className="team-invites__role">{ROLE_LABEL[i.role]}</span>
                <span className="team-invites__time">Sent {relTime(i.invitedAt)}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <Modal open={inviteOpen} onClose={() => setInviteOpen(false)} title="Invite Staff Member">
        <form className="team-invite-form" onSubmit={handleInvite}>
          <label className="bulletin-editor__field">
            <span>Email address</span>
            <input type="email" required value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="name@example.com" />
          </label>
          <label className="bulletin-editor__field">
            <span>Role</span>
            <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value as UserRole)}>
              {INVITABLE_ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
            </select>
          </label>
          {inviteError && <p className="comm-error" role="alert">{inviteError}</p>}
          <button type="submit" className="sa-btn sa-btn--primary" disabled={inviting} style={{ justifyContent: 'center' }}>
            {inviting ? 'Sending…' : 'Send Invitation'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
