'use client';

/**
 * KidsCheckIn — Day 24
 *
 * Kids Church tab in the attendance page.
 * Shows list of children checked in, generates a unique 4-char pickup code
 * displayed prominently on screen.  "Print Label" triggers browser print.
 */
import { useCallback, useEffect, useState } from 'react';
import { Baby, Printer, RefreshCw, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type KidCheckin = {
  id: string;
  childName: string;
  parentName: string;
  allergies?: string;
  pickupCode: string;
  checkedInAt: string;
};

type KidsCheckInProps = {
  sessionId: string;
};

// ── Mock data fallback ────────────────────────────────────────────────────────

function generateCode(): string {
  return Math.random().toString(36).slice(2, 6).toUpperCase();
}

const MOCK_KIDS: KidCheckin[] = [
  { id: 'k1', childName: 'Emma Mensah',    parentName: 'Abena Mensah',  pickupCode: 'X7K2', checkedInAt: '09:05', allergies: 'Peanuts' },
  { id: 'k2', childName: 'Daniel Asante',  parentName: 'Kwame Asante',  pickupCode: 'P3F9', checkedInAt: '09:08' },
  { id: 'k3', childName: 'Grace Boateng',  parentName: 'Ama Boateng',   pickupCode: 'M1V4', checkedInAt: '09:12', allergies: 'Gluten' },
  { id: 'k4', childName: 'Samuel Tetteh',  parentName: 'Nana Ama Tetteh', pickupCode: 'B8Q6', checkedInAt: '09:15' },
];

export function KidsCheckIn({ sessionId }: KidsCheckInProps) {
  const [kids,      setKids]      = useState<KidCheckin[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [selected,  setSelected]  = useState<KidCheckin | null>(null);
  const [checking,  setChecking]  = useState(false);
  const [childName, setChildName] = useState('');
  const [parentName,setParentName]= useState('');
  const [allergies, setAllergies] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/attendance/sessions/${sessionId}/kids`);
      if (res.ok) {
        const json = await res.json() as { data: KidCheckin[] };
        setKids(json.data);
      } else {
        setKids(MOCK_KIDS);
      }
    } catch {
      setKids(MOCK_KIDS);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => { void load(); }, [load]);

  async function handleCheckIn() {
    if (!childName.trim() || !parentName.trim()) return;
    setChecking(true);
    const code = generateCode();

    try {
      const res = await fetch(`/api/attendance/sessions/${sessionId}/kids`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childName: childName.trim(), parentName: parentName.trim(), allergies: allergies.trim() || undefined }),
      });

      const newKid: KidCheckin = res.ok
        ? (await res.json() as { data: KidCheckin }).data
        : { id: `k${Date.now()}`, childName: childName.trim(), parentName: parentName.trim(), allergies: allergies.trim() || undefined, pickupCode: code, checkedInAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };

      setKids((prev) => [newKid, ...prev]);
      setSelected(newKid);
      setChildName(''); setParentName(''); setAllergies('');
    } catch {
      const fallback: KidCheckin = { id: `k${Date.now()}`, childName: childName.trim(), parentName: parentName.trim(), allergies: allergies.trim() || undefined, pickupCode: code, checkedInAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      setKids((prev) => [fallback, ...prev]);
      setSelected(fallback);
    } finally {
      setChecking(false);
    }
  }

  function handlePrint(kid: KidCheckin) {
    const win = window.open('', '_blank', 'width=320,height=200');
    if (!win) return;
    win.document.write(`
      <html><head><title>Pickup Label</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 12px; width: 80mm; }
        h1 { font-size: 18px; margin: 0 0 4px; }
        .code { font-size: 36px; font-weight: bold; letter-spacing: 8px; margin: 8px 0; }
        p { margin: 2px 0; font-size: 12px; }
        .allergy { color: red; font-weight: bold; }
      </style></head>
      <body>
        <h1>${kid.childName}</h1>
        <div class="code">${kid.pickupCode}</div>
        <p>Parent: ${kid.parentName}</p>
        ${kid.allergies ? `<p class="allergy">⚠ Allergies: ${kid.allergies}</p>` : ''}
        <p>Checked in: ${kid.checkedInAt}</p>
      </body></html>
    `);
    win.document.close();
    win.print();
  }

  return (
    <div className="kids-checkin">
      {/* Check-in form */}
      <div className="kids-checkin__form">
        <h3 className="kids-checkin__form-title">
          <Baby size={18} aria-hidden="true" /> Check in a child
        </h3>
        <div className="kids-checkin__fields">
          <input className="amf-input" placeholder="Child's full name *" value={childName} onChange={(e) => setChildName(e.target.value)} />
          <input className="amf-input" placeholder="Parent / guardian name *" value={parentName} onChange={(e) => setParentName(e.target.value)} />
          <input className="amf-input" placeholder="Allergies (optional)" value={allergies} onChange={(e) => setAllergies(e.target.value)} />
          <button type="button" className="msm-btn msm-btn--primary kids-checkin__submit" onClick={() => void handleCheckIn()} disabled={checking || !childName.trim() || !parentName.trim()}>
            {checking ? 'Generating code…' : 'Check in & generate code'}
          </button>
        </div>
      </div>

      {/* Pickup code display */}
      {selected && (
        <div className="kids-pickup" role="status" aria-live="polite">
          <div className="kids-pickup__inner">
            <CheckCircle2 size={32} strokeWidth={1.5} color="var(--accent-strong)" aria-hidden="true" />
            <h3 className="kids-pickup__name">{selected.childName}</h3>
            <p className="kids-pickup__label">Pickup code</p>
            <div className="kids-pickup__code" aria-label={`Pickup code: ${selected.pickupCode.split('').join(' ')}`}>
              {selected.pickupCode}
            </div>
            {selected.allergies && (
              <p className="kids-pickup__allergy">⚠ Allergies: {selected.allergies}</p>
            )}
            <div className="kids-pickup__actions">
              <button type="button" className="msm-btn msm-btn--secondary" onClick={() => handlePrint(selected)}>
                <Printer size={14} aria-hidden="true" /> Print label
              </button>
              <button type="button" className="msm-btn msm-btn--ghost" onClick={() => setSelected(null)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Children list */}
      <div className="kids-checkin__list">
        <div className="kids-checkin__list-header">
          <h3>Children checked in <span className="att-section__count">{kids.length}</span></h3>
          <button type="button" className="member-dir__retry-btn" onClick={() => void load()}>
            <RefreshCw size={13} aria-hidden="true" /> Refresh
          </button>
        </div>

        {loading ? (
          <p className="att-empty"><RefreshCw size={16} className="att-scan-link" aria-hidden="true" /> Loading…</p>
        ) : kids.length === 0 ? (
          <div className="att-empty"><Baby size={28} strokeWidth={1.5} /><p>No children checked in yet.</p></div>
        ) : (
          <div className="kids-list">
            {kids.map((kid) => (
              <div key={kid.id} className={cn('kids-row', selected?.id === kid.id && 'kids-row--active')} onClick={() => setSelected(kid)}>
                <div className="kids-row__avatar" aria-hidden="true">
                  {kid.childName.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
                </div>
                <div className="kids-row__info">
                  <strong>{kid.childName}</strong>
                  <span>{kid.parentName}</span>
                  {kid.allergies && <span className="kids-row__allergy">⚠ {kid.allergies}</span>}
                </div>
                <div className="kids-row__right">
                  <span className="kids-row__code">{kid.pickupCode}</span>
                  <span className="kids-row__time">{kid.checkedInAt}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default KidsCheckIn;
