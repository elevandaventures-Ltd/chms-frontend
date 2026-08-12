'use client';

/**
 * /invite/:token — public "Accept Invitation" landing page reached from
 * the invitation email (Day 46 review). No login required to view the
 * invite; accepting adds the person straight into the team roster.
 */
import { use, useEffect, useState } from 'react';
import { CheckCircle2, Church } from 'lucide-react';

type InviteDetails = { email: string; role: string; roleLabel: string; status: string; invitedBy: string };

export default function AcceptInvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [invite, setInvite] = useState<InviteDetails | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    fetch(`/api/team/invitations/${token}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((json: { data?: InviteDetails }) => { if (json.data) setInvite(json.data); else setNotFound(true); })
      .catch(() => setNotFound(true));
  }, [token]);

  async function handleAccept() {
    setAccepting(true);
    try {
      const res = await fetch(`/api/team/invitations/${token}/accept`, { method: 'POST' });
      if (res.ok) setAccepted(true);
    } finally {
      setAccepting(false);
    }
  }

  return (
    <div className="unsub-page">
      <div className="unsub-card team-accept-card">
        <div className="unsub-card__brand"><Church size={14} aria-hidden="true" style={{ verticalAlign: -2, marginRight: 4 }} />Elevanda ChMS</div>

        {notFound && <p>This invitation link is invalid or has expired.</p>}

        {!notFound && !invite && <p>Loading invitation…</p>}

        {invite && !accepted && invite.status === 'pending' && (
          <>
            <h1 className="unsub-card__title">You&apos;re invited!</h1>
            <p className="unsub-card__sub">
              {invite.invitedBy} invited <strong>{invite.email}</strong> to join as <strong>{invite.roleLabel}</strong>.
            </p>
            <button type="button" className="sa-btn sa-btn--primary" onClick={handleAccept} disabled={accepting} style={{ justifyContent: 'center', width: '100%' }}>
              {accepting ? 'Joining…' : 'Accept Invitation'}
            </button>
          </>
        )}

        {invite && invite.status !== 'pending' && !accepted && (
          <p>This invitation has already been used.</p>
        )}

        {accepted && (
          <div className="unsub-card__banner unsub-card__banner--success">
            <CheckCircle2 size={14} aria-hidden="true" />
            Welcome to the team! You can now sign in.
          </div>
        )}
      </div>
    </div>
  );
}
