'use client';

/**
 * /settings/general — Day 47 Task 2. Denomination selector, timezone
 * selector, default currency, and language preference. Changing
 * denomination re-seeds the church's default ministry list (Day 50
 * review: "Select Pentecostal denomination → verify correct default
 * ministries seeded").
 */
import { useEffect, useState } from 'react';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { AFRICA_TIMEZONES } from '@/lib/communication';
import { DENOMINATIONS, CURRENCIES, LANGUAGES, defaultGeneral, type ChurchGeneral } from '@/lib/church-branding';

export default function GeneralSettingsPage() {
  const [general, setGeneral] = useState<ChurchGeneral>(defaultGeneral);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [seededMinistries, setSeededMinistries] = useState<string[] | null>(null);

  useEffect(() => {
    fetch('/api/church/general')
      .then((r) => r.json())
      .then((json: { data?: ChurchGeneral }) => { if (json.data) setGeneral(json.data); })
      .finally(() => setLoading(false));
  }, []);

  function set<K extends keyof ChurchGeneral>(key: K, value: ChurchGeneral[K]) {
    setGeneral((g) => ({ ...g, [key]: value }));
    setSaved(false);
    setSeededMinistries(null);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch('/api/church/general', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(general),
      });
      const json = await res.json() as { data?: ChurchGeneral; seededMinistries?: string[] };
      if (json.data) setGeneral(json.data);
      if (json.seededMinistries && json.seededMinistries.length > 0) setSeededMinistries(json.seededMinistries);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="branding-page">
      <div className="bulletin-editor__head">
        <div>
          <h1>General</h1>
          <p>Denomination, timezone, currency, and language for this church.</p>
        </div>
        <button type="button" className="sa-btn sa-btn--primary" onClick={handleSave} disabled={saving || loading}>
          {saved ? <><CheckCircle2 size={14} aria-hidden="true" /> Saved</> : saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>

      <div className="bulletin-editor__form" style={{ maxWidth: 520 }}>
        <section className="bulletin-editor__group">
          <h3>Denomination</h3>
          <select value={general.denomination} onChange={(e) => set('denomination', e.target.value)} className="general-select">
            {DENOMINATIONS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
          <p className="wa-field__hint" style={{ color: 'var(--muted)' }}>
            <Sparkles size={12} aria-hidden="true" /> Changing this seeds a default ministry list for your church.
          </p>
          {seededMinistries && (
            <div className="general-seeded-note">
              <CheckCircle2 size={13} aria-hidden="true" />
              Seeded {seededMinistries.length} default ministries: {seededMinistries.join(', ')}
            </div>
          )}
        </section>

        <section className="bulletin-editor__group">
          <h3>Timezone</h3>
          <select value={general.timezone} onChange={(e) => set('timezone', e.target.value)} className="general-select">
            {AFRICA_TIMEZONES.map((tz) => <option key={tz.value} value={tz.value}>{tz.label}</option>)}
          </select>
        </section>

        <section className="bulletin-editor__group">
          <h3>Default currency</h3>
          <select value={general.currency} onChange={(e) => set('currency', e.target.value)} className="general-select">
            {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </section>

        <section className="bulletin-editor__group">
          <h3>Language</h3>
          <select value={general.language} onChange={(e) => set('language', e.target.value)} className="general-select">
            {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </section>
      </div>
    </div>
  );
}
