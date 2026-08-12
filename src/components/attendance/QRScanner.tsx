'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { Camera, CameraOff, Check, AlertTriangle, RefreshCw, UserCheck, CloudOff } from 'lucide-react';
import { decodeMemberQr } from '@/lib/qr';
import { isOnline } from '@/lib/connectivity';
import { enqueueSyncItem } from '@/lib/offline-sync';
import { db } from '@/lib/db';

type ScannedMember = { id: string; fullName: string; photoUrl: string | null };
type ScanResult = { member: ScannedMember; alreadyCheckedIn: boolean; queuedOffline?: boolean };

type CamState = 'idle' | 'starting' | 'live' | 'denied' | 'unavailable' | 'error';

const SCAN_INTERVAL_MS  = 200;   // check for a QR code 5×/second
const SUCCESS_HOLD_MS   = 2000;  // show the success animation for 2 seconds

type QRScannerProps = {
  sessionId: string;
  onCheckedIn?: (count: number | null) => void;
};

function initials(name: string): string {
  return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
}

export function QRScanner({ sessionId, onCheckedIn }: QRScannerProps) {
  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Refs guard the scan loop against stale state / double-submits.
  const pausedRef     = useRef(false);   // paused while a success animation plays
  const processingRef = useRef(false);   // a check-in request is in flight

  const [camState, setCamState] = useState<CamState>('idle');
  const [result,   setResult]   = useState<ScanResult | null>(null);
  const [flash,    setFlash]    = useState(false);
  const [error,    setError]    = useState('');

  // ── Check-in on a successful, valid scan ──────────────────────────────────
  const handleDetected = useCallback(async (memberId: string) => {
    processingRef.current = true;
    pausedRef.current = true;

    // Day 53: offline check-in — queue it in IndexedDB instead of hitting
    // the network, so the flow still completes for the person scanning.
    if (!isOnline()) {
      try {
        const local = await db?.members.get(memberId);
        const member: ScannedMember = local
          ? { id: local.id, fullName: local.fullName, photoUrl: local.photoUrl ?? null }
          : { id: memberId, fullName: 'Member', photoUrl: null };

        await enqueueSyncItem('checkin', { sessionId, memberId }, `Check-in: ${member.fullName}`);

        setError('');
        setResult({ member, alreadyCheckedIn: false, queuedOffline: true });
        setFlash(true);
        window.setTimeout(() => setFlash(false), 320);
        window.setTimeout(() => {
          setResult(null);
          pausedRef.current = false;
          processingRef.current = false;
        }, SUCCESS_HOLD_MS);
      } catch {
        setError('Could not queue check-in offline.');
        pausedRef.current = false;
        processingRef.current = false;
      }
      return;
    }

    try {
      const res = await fetch(`/api/attendance/sessions/${sessionId}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? 'Check-in failed.');
        pausedRef.current = false;
        processingRef.current = false;
        return;
      }

      setError('');
      setResult({ member: json.member, alreadyCheckedIn: Boolean(json.alreadyCheckedIn) });
      setFlash(true);
      onCheckedIn?.(json.count ?? null);

      // Hold the success animation, then reset for the next scan.
      window.setTimeout(() => setFlash(false), 320);
      window.setTimeout(() => {
        setResult(null);
        pausedRef.current = false;
        processingRef.current = false;
      }, SUCCESS_HOLD_MS);
    } catch {
      setError('Network error during check-in.');
      pausedRef.current = false;
      processingRef.current = false;
    }
  }, [sessionId, onCheckedIn]);

  // ── The 200ms scan loop ────────────────────────────────────────────────────
  const tick = useCallback(() => {
    if (pausedRef.current || processingRef.current) return;
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < video.HAVE_ENOUGH_DATA) return;

    const w = video.videoWidth;
    const h = video.videoHeight;
    if (!w || !h) return;

    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, w, h);
    const imageData = ctx.getImageData(0, 0, w, h);
    const code = jsQR(imageData.data, w, h, { inversionAttempts: 'dontInvert' });
    if (!code) return;

    const memberId = decodeMemberQr(code.data);
    if (memberId) void handleDetected(memberId);
  }, [handleDetected]);

  // ── Camera lifecycle ───────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    setError('');
    setCamState('starting');

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setCamState('unavailable');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        await video.play();
      }
      setCamState('live');
      intervalRef.current = setInterval(tick, SCAN_INTERVAL_MS);
    } catch (err) {
      const name = (err as DOMException)?.name;
      if (name === 'NotAllowedError' || name === 'SecurityError') setCamState('denied');
      else if (name === 'NotFoundError' || name === 'OverconstrainedError') setCamState('unavailable');
      else setCamState('error');
    }
  }, [tick]);

  const stopCamera = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  // Auto-start on mount; clean up on unmount.
  useEffect(() => {
    void startCamera();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Render ─────────────────────────────────────────────────────────────────
  const showStage = camState === 'live' || camState === 'starting';

  return (
    <div className="qr-scanner">
      <div className={`qr-stage${flash ? ' qr-stage--flash' : ''}`}>
        {/* Live preview */}
        <video
          ref={videoRef}
          className="qr-stage__video"
          muted
          playsInline
          aria-label="Camera preview"
          style={{ visibility: showStage ? 'visible' : 'hidden' }}
        />
        <canvas ref={canvasRef} className="qr-stage__canvas" aria-hidden="true" />

        {/* Reticle */}
        {camState === 'live' && !result && (
          <div className="qr-reticle" aria-hidden="true">
            <span className="qr-reticle__corner qr-reticle__corner--tl" />
            <span className="qr-reticle__corner qr-reticle__corner--tr" />
            <span className="qr-reticle__corner qr-reticle__corner--bl" />
            <span className="qr-reticle__corner qr-reticle__corner--br" />
            <span className="qr-reticle__line" />
          </div>
        )}

        {/* Success animation */}
        {result && (
          <div className="qr-success" role="status" aria-live="assertive">
            <div className="qr-success__photo" style={{ background: result.member.photoUrl ? 'transparent' : '#274c3f' }}>
              {result.member.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={result.member.photoUrl} alt={result.member.fullName} className="qr-success__photo-img" />
              ) : (
                <span className="qr-success__initials">{initials(result.member.fullName)}</span>
              )}
              <span className="qr-success__check"><Check size={20} strokeWidth={3} aria-hidden="true" /></span>
            </div>
            <p className="qr-success__name">{result.member.fullName}</p>
            <p className="qr-success__msg">
              {result.queuedOffline ? (
                <span className="qr-success__offline"><CloudOff size={13} aria-hidden="true" /> Checked in (will sync when online)</span>
              ) : result.alreadyCheckedIn ? 'Already checked in' : 'Checked in'}
            </p>
          </div>
        )}

        {/* Camera state overlays */}
        {camState !== 'live' && !result && (
          <div className="qr-overlay">
            {camState === 'starting' && (
              <>
                <Camera size={34} strokeWidth={1.5} aria-hidden="true" />
                <p>Requesting camera…</p>
              </>
            )}
            {camState === 'denied' && (
              <>
                <CameraOff size={34} strokeWidth={1.5} aria-hidden="true" />
                <p>Camera permission denied.</p>
                <span className="qr-overlay__hint">Allow camera access in your browser, then retry.</span>
                <button type="button" className="msm-btn msm-btn--primary" onClick={() => void startCamera()}>
                  <RefreshCw size={15} aria-hidden="true" /> Retry
                </button>
              </>
            )}
            {camState === 'unavailable' && (
              <>
                <CameraOff size={34} strokeWidth={1.5} aria-hidden="true" />
                <p>No camera available on this device.</p>
              </>
            )}
            {(camState === 'error' || camState === 'idle') && (
              <>
                <Camera size={34} strokeWidth={1.5} aria-hidden="true" />
                <button type="button" className="msm-btn msm-btn--primary" onClick={() => void startCamera()}>
                  <Camera size={15} aria-hidden="true" /> Start camera
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Status line */}
      <div className="qr-status" aria-live="polite">
        {camState === 'live' && !result && (
          <span className="qr-status__scanning">
            <UserCheck size={15} aria-hidden="true" /> Point the camera at a member’s QR code…
          </span>
        )}
        {error && (
          <span className="qr-status__error">
            <AlertTriangle size={15} aria-hidden="true" /> {error}
          </span>
        )}
      </div>
    </div>
  );
}

export default QRScanner;
