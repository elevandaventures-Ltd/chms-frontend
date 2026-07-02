'use client';

/**
 * /events — Events page (Days 26–29)
 * Tabs: Calendar | Create | Resources
 */
import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { EventCalendar }   from '@/components/events/EventCalendar';
import { EventForm }       from '@/components/events/EventForm';
import { ResourceManager } from '@/components/events/ResourceManager';
import { EventDiscovery }  from '@/components/events/EventDiscovery';
import type { ChmsEvent }  from '@/lib/events';

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
            <div className="events-form-wrap">
              <EventForm
                onSaved={(ev) => { setCreated(ev); }}
                onCancel={() => setTab('calendar')}
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="resources">
          <ResourceManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
