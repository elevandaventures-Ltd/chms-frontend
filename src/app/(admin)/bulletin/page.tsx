'use client';

/**
 * /bulletin — Day 39 Task 1. Digital bulletin template editor: branded
 * with church colors + logo, plus welcome message and sermon series
 * fields. Upcoming events and giving summary are auto-populated (not
 * editable here — they come live from Events and Finance).
 */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Eye, Save, CheckCircle2 } from 'lucide-react';
import { BulletinPreview } from '@/components/bulletin/BulletinPreview';
import { defaultBulletinConfig, getUpcomingEvents, mockGivingSummary, type BulletinConfig } from '@/lib/bulletin';

export default function BulletinEditorPage() {
  const [config, setConfig] = useState<BulletinConfig>(defaultBulletinConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/bulletin/config')
      .then((r) => r.json())
      .then((json: { data?: BulletinConfig }) => { if (json.data) setConfig(json.data); })
      .finally(() => setLoading(false));
  }, []);

  function set<K extends keyof BulletinConfig>(key: K, value: BulletinConfig[K]) {
    setConfig((c) => ({ ...c, [key]: value }));
    setSaved(false);
  }

  function setSermon<K extends keyof BulletinConfig['sermonSeries']>(key: K, value: string) {
    setConfig((c) => ({ ...c, sermonSeries: { ...c.sermonSeries, [key]: value } }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await fetch('/api/bulletin/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  const events = getUpcomingEvents(7);

  return (
    <div className="bulletin-editor">
      <div className="bulletin-editor__head">
        <div>
          <h1>Bulletin editor</h1>
          <p>Branding, welcome message, and sermon series for this week&apos;s digital bulletin.</p>
        </div>
        <div className="bulletin-editor__head-actions">
          <Link href="/bulletin/preview" className="sa-btn sa-btn--secondary">
            <Eye size={14} aria-hidden="true" /> Full preview
          </Link>
          <button type="button" className="sa-btn sa-btn--primary" onClick={handleSave} disabled={saving || loading}>
            {saved ? <><CheckCircle2 size={14} aria-hidden="true" /> Saved</> : <><Save size={14} aria-hidden="true" /> {saving ? 'Saving…' : 'Save'}</>}
          </button>
        </div>
      </div>

      <div className="bulletin-editor__layout">
        <div className="bulletin-editor__form">
          <section className="bulletin-editor__group">
            <h3>Branding</h3>
            <label className="bulletin-editor__field">
              <span>Church name</span>
              <input value={config.churchName} onChange={(e) => set('churchName', e.target.value)} />
            </label>
            <label className="bulletin-editor__field">
              <span>Logo URL</span>
              <input value={config.logoUrl} onChange={(e) => set('logoUrl', e.target.value)} placeholder="https://…" />
            </label>
            <div className="bulletin-editor__color-row">
              <label className="bulletin-editor__field bulletin-editor__field--color">
                <span>Primary color</span>
                <input type="color" value={config.primaryColor} onChange={(e) => set('primaryColor', e.target.value)} />
              </label>
              <label className="bulletin-editor__field bulletin-editor__field--color">
                <span>Accent color</span>
                <input type="color" value={config.secondaryColor} onChange={(e) => set('secondaryColor', e.target.value)} />
              </label>
            </div>
          </section>

          <section className="bulletin-editor__group">
            <div className="bulletin-editor__group-head">
              <h3>Welcome message</h3>
              <label className="bulletin-editor__toggle">
                <input type="checkbox" checked={config.showWelcome} onChange={(e) => set('showWelcome', e.target.checked)} /> Show
              </label>
            </div>
            <textarea rows={3} value={config.welcomeMessage} onChange={(e) => set('welcomeMessage', e.target.value)} />
          </section>

          <section className="bulletin-editor__group">
            <div className="bulletin-editor__group-head">
              <h3>Sermon series</h3>
              <label className="bulletin-editor__toggle">
                <input type="checkbox" checked={config.showSermon} onChange={(e) => set('showSermon', e.target.checked)} /> Show
              </label>
            </div>
            <label className="bulletin-editor__field">
              <span>Series title</span>
              <input value={config.sermonSeries.title} onChange={(e) => setSermon('title', e.target.value)} />
            </label>
            <label className="bulletin-editor__field">
              <span>Part / subtitle</span>
              <input value={config.sermonSeries.part} onChange={(e) => setSermon('part', e.target.value)} />
            </label>
            <label className="bulletin-editor__field">
              <span>Verse</span>
              <input value={config.sermonSeries.verse} onChange={(e) => setSermon('verse', e.target.value)} />
            </label>
            <label className="bulletin-editor__field">
              <span>Speaker</span>
              <input value={config.sermonSeries.speaker} onChange={(e) => setSermon('speaker', e.target.value)} />
            </label>
          </section>

          <section className="bulletin-editor__group">
            <h3>Auto-populated sections</h3>
            <label className="bulletin-editor__toggle">
              <input type="checkbox" checked={config.showEvents} onChange={(e) => set('showEvents', e.target.checked)} />
              Upcoming events (next 7 days) — {events.length} found
            </label>
            <label className="bulletin-editor__toggle">
              <input type="checkbox" checked={config.showGiving} onChange={(e) => set('showGiving', e.target.checked)} />
              Giving summary — {mockGivingSummary.currency} {mockGivingSummary.weekTotal.toLocaleString()} this week
            </label>
          </section>
        </div>

        <div className="bulletin-editor__preview">
          <span className="bulletin-editor__preview-label">Live preview</span>
          <BulletinPreview config={config} events={events} giving={mockGivingSummary} compact />
        </div>
      </div>
    </div>
  );
}
