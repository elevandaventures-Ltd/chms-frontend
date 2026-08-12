'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import type { ChmsEvent } from '@/lib/events';

const EventCalendar   = dynamic(() => import('@/components/events/EventCalendar').then(m => m.EventCalendar), { ssr: false, loading: () => <div className="skeleton-shimmer" style={{ height: 500, borderRadius: 16 }} /> });
const EventForm       = dynamic(() => import('@/components/events/EventForm').then(m => m.EventForm), { ssr: false });
const ResourceManager = dynamic(() => import('@/components/events/ResourceManager').then(m => m.ResourceManager), { ssr: false });
const EventDiscovery  = dynamic(() => import('@/components/events/EventDiscovery').then(m => m.EventDiscovery), { ssr: false });

export default function EventsPage() {
  const [tab, setTab] = useState('calendar');
  const [created, setCreated] = useState<ChmsEvent | null>(null);

  return (
    <div className="events-page">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="create">Create Event</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar">
          <EventCalendar />
        </TabsContent>

        <TabsContent value="discover">
          <EventDiscovery />
        </TabsContent>

        <TabsContent value="create">
          {created ? (
            <div className="admin-placeholder">
              <h2>Event created: {created.title}</h2>
              <p>It has been added to the calendar.</p>
              <button type="button" className="msm-btn msm-btn--primary" onClick={() => { setCreated(null); setTab('calendar'); }}>
                View on calendar
              </button>
            </div>
          ) : (
            <EventForm
              onSaved={(ev) => { setCreated(ev); }}
              onCancel={() => setTab('calendar')}
            />
          )}
        </TabsContent>

        <TabsContent value="resources">
          <ResourceManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
