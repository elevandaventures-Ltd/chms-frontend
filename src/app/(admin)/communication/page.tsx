'use client';

/**
 * /communication — Days 31 & 32
 * Tabs: Compose | Delivery Reports
 */
import { useCallback, useEffect, useState } from 'react';
import { AudienceSelector, EMPTY_FILTERS } from '@/components/communication/AudienceSelector';
import { MessageComposer } from '@/components/communication/MessageComposer';
import { DeliveryReport } from '@/components/communication/DeliveryReport';
import type { AudienceFilters } from '@/components/communication/AudienceSelector';
import type { Channel } from '@/components/communication/MessageComposer';

type PageTab = 'compose' | 'reports';

export default function CommunicationPage() {
  const [pageTab, setPageTab] = useState<PageTab>('compose');
  const [filters, setFilters] = useState<AudienceFilters>(EMPTY_FILTERS);
  const [channel, setChannel] = useState<Channel>('sms');
  const [reach,   setReach]   = useState(0);
  const [toast,   setToast]   = useState('');

  const fetchReach = useCallback(async (f: AudienceFilters, ch: Channel) => {
    try {
      const res  = await fetch('/api/communication/reach', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ ...f, channel: ch }),
      });
      const json = await res.json() as { reach: number };
      setReach(json.reach ?? 0);
    } catch {
      setReach(0);
    }
  }, []);

  useEffect(() => { void fetchReach(filters, channel); }, [filters, channel, fetchReach]);

  function handleSent({ channel: ch, sent }: { channel: Channel; sent: number }) {
    setToast(`${ch.toUpperCase()} sent to ${sent.toLocaleString()} recipient${sent !== 1 ? 's' : ''}.`);
    setTimeout(() => setToast(''), 4000);
  }

  return (
    <div className="comm-page">
      <div className="comm-page__head">
        <h1 className="comm-page__title">Communication</h1>
        <p className="comm-page__sub">Compose messages and track delivery to your congregation.</p>
      </div>

      {/* Page-level tabs */}
      <div className="comm-page-tabs">
        <button
          type="button"
          className={`comm-page-tab${pageTab === 'compose' ? ' comm-page-tab--active' : ''}`}
          onClick={() => setPageTab('compose')}
        >
          Compose
        </button>
        <button
          type="button"
          className={`comm-page-tab${pageTab === 'reports' ? ' comm-page-tab--active' : ''}`}
          onClick={() => setPageTab('reports')}
        >
          Delivery Reports
        </button>
      </div>

      {toast && (
        <div className="comm-toast" role="status" aria-live="polite">{toast}</div>
      )}

      {pageTab === 'compose' ? (
        <div className="comm-layout">
          <section className="comm-panel comm-panel--audience">
            <AudienceSelector
              filters={filters}
              onChange={setFilters}
              channel={channel}
              reach={reach}
            />
          </section>

          <section className="comm-panel comm-panel--composer">
            <MessageComposer
              filters={filters}
              reach={reach}
              channel={channel}
              onChannelChange={setChannel}
              onSent={handleSent}
            />
          </section>
        </div>
      ) : (
        <div className="comm-panel">
          <DeliveryReport />
        </div>
      )}
    </div>
  );
}
