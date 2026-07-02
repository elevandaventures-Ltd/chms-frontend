'use client';

/**
 * /attendance/kiosk — Self-check-in kiosk mode (Day 23)
 *
 * Full-screen tablet UI:
 *   - Shows large PIN pad for manual check-in by member number
 *   - QR code scan area (delegates to QRScanner component)
 *   - Auto-resets 3 seconds after each successful scan
 *   - No admin interaction needed once launched
 *   - Session ID passed via ?session= query param
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, XCircle, Delete } from 'lucide-react';
import { LiveCounter } from '@/components/attendance/LiveCounter';

type KioskState =
  | { phase: 'idle' }
  | { phase: 'checking' }
  | { phase: 'success'; name: string }
  | { phase: 'error'; message: string };

const RESET_DELAY = 3500; // ms before returning to idle

export default function KioskPage() {
  const searchParams = useSearchParams();
  const sessionId    = searchParams.get('session') ?? 'demo';

  const [pin,   setPin]   = useState('');
  const [state, setState] = useState<KioskState>({ phase: 'idle' });
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function scheduleReset() {
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => {
      setState({ phase: 'idle' });
      setPin('');
    }, RESET_DELAY);
  }

  const submitPin = useCallback(async (code: string) => {
    if (!code.trim()) return;
    setState({ phase: 'checking' });

    try {
      const res = await fetch(`/api/attendance/sessions/${sessionId}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: 'pin', pin: code }),
      });
      const json = await res.json() as { memberName?: string; error?: string };

      if (res.ok && json.memberName) {
        setState({ phase: 'success', name: json.memberName });
      } else {
        setState({ phase: 'error', message: json.error ?? 'Member not found.' });
      }
    } catch {
      setState({ phase: 'error', message: 'Network error. Please try again.' });
    }

    scheduleReset();
  }, [sessionId]);

  function pressDigit(d: string) {
    if (state.phase === 'checking') return;
    if (state.phase !== 'idle') { setState({ phase: 'idle' }); setPin(d); return; }
    setPin((p) => (p.length < 6 ? p + d : p));
  }

  function pressDel() {
    setPin((p) => p.slice(0, -1));
  }

  function pressEnter() {
    if (pin.length >= 3) void submitPin(pin);
  }

  useEffect(() => () => { if (resetTimer.current) clearTimeout(resetTimer.current); }, []);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="kiosk">
      {/* Header */}
      <div className="kiosk__header">
        <p className="kiosk__brand">Elevanda ChMS</p>
        <div className="kiosk__counter-wrap">
          <LiveCounter sessionId={sessionId} />
        </div>
      </div>

      {/* Main area */}
      <div className="kiosk__body">
        {state.phase === 'success' && (
          <div className="kiosk__feedback kiosk__feedback--success" role="status" aria-live="assertive">
            <CheckCircle2 size={72} strokeWidth={1.5} aria-hidden="true" />
            <p className="kiosk__feedback-name">{state.name}</p>
            <p className="kiosk__feedback-msg">Welcome! You&apos;re checked in.</p>
          </div>
        )}

        {state.phase === 'error' && (
          <div className="kiosk__feedback kiosk__feedback--error" role="alert" aria-live="assertive">
            <XCircle size={72} strokeWidth={1.5} aria-hidden="true" />
            <p className="kiosk__feedback-msg">{state.message}</p>
          </div>
        )}

        {(state.phase === 'idle' || state.phase === 'checking') && (
          <>
            <h1 className="kiosk__title">Enter your PIN</h1>
            <p className="kiosk__sub">Type your 4–6 digit member PIN and press ✓</p>

            {/* PIN display */}
            <div className="kiosk__pin-display" aria-label={`PIN: ${pin.length} digits entered`}>
              {Array.from({ length: 6 }).map((_, i) => (
                <span
                  key={i}
                  className={`kiosk__pin-dot${i < pin.length ? ' kiosk__pin-dot--filled' : ''}`}
                  aria-hidden="true"
                />
              ))}
            </div>

            {/* PIN pad */}
            <div className="kiosk__pad" role="group" aria-label="PIN pad">
              {['1','2','3','4','5','6','7','8','9','DEL','0','✓'].map((k) => (
                <button
                  key={k}
                  type="button"
                  className={`kiosk__key${k === '✓' ? ' kiosk__key--confirm' : ''}${k === 'DEL' ? ' kiosk__key--del' : ''}`}
                  onClick={() => {
                    if (k === 'DEL') pressDel();
                    else if (k === '✓') pressEnter();
                    else pressDigit(k);
                  }}
                  disabled={state.phase === 'checking'}
                  aria-label={k === 'DEL' ? 'Delete' : k === '✓' ? 'Confirm' : k}
                >
                  {k === 'DEL' ? <Delete size={22} aria-hidden="true" /> : k}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="kiosk__footer">
        <p>Having trouble? Ask an usher for assistance.</p>
      </div>
    </div>
  );
}
