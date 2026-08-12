'use client';

/**
 * LiveCounter — Day 23
 *
 * Connects to GET /api/attendance/sessions/:id/stream (SSE) and shows
 * an animated, real-time attendance count that updates without page reload.
 *
 * The number animates from old value to new value over 600ms when it changes.
 */
import { useEffect, useRef, useState } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

type LiveCounterProps = {
  sessionId: string;
  initialCount?: number;
};

function useAnimatedNumber(target: number, duration = 600) {
  const [display, setDisplay] = useState(target);
  const rafRef  = useRef<number>(0);
  const startRef = useRef({ from: target, start: 0 });

  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    const from = display;
    const to   = target;
    if (from === to) return;

    startRef.current = { from, start: performance.now() };

    function step(now: number) {
      const elapsed  = now - startRef.current.start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(startRef.current.from + (to - startRef.current.from) * eased);
      setDisplay(value);
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    }

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);

  return display;
}

export function LiveCounter({ sessionId, initialCount = 0 }: LiveCounterProps) {
  const [count,     setCount]     = useState(initialCount);
  const [connected, setConnected] = useState(false);
  const [error,     setError]     = useState(false);

  const displayed = useAnimatedNumber(count);

  useEffect(() => {
    const es = new EventSource(`/api/attendance/sessions/${sessionId}/stream`);

    es.addEventListener('count', (e) => {
      try {
        const data = JSON.parse(e.data) as { count: number };
        setCount(data.count);
        setConnected(true);
        setError(false);
      } catch { /* ignore parse errors */ }
    });

    es.addEventListener('open', () => { setConnected(true); setError(false); });
    es.addEventListener('error', () => { setConnected(false); setError(true); });

    return () => es.close();
  }, [sessionId]);

  return (
    <div className="live-counter" aria-live="polite" aria-atomic="true">
      <div className="live-counter__number" aria-label={`${displayed} checked in`}>
        {displayed.toLocaleString()}
      </div>

      <div className="live-counter__label">
        <span>checked in</span>
        <span className={`live-counter__dot${connected ? ' live-counter__dot--on' : ''}`} aria-hidden="true" />
        {error
          ? <WifiOff size={12} className="live-counter__signal live-counter__signal--off" aria-label="Disconnected" />
          : <Wifi    size={12} className={`live-counter__signal${connected ? ' live-counter__signal--on' : ''}`} aria-label={connected ? 'Connected' : 'Connecting'} />
        }
      </div>
    </div>
  );
}

export default LiveCounter;
