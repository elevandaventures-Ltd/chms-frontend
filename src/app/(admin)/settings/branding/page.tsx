'use client';

/**
 * /settings/branding — Day 47 Task 1 + Day 50 Task 1.
 * Logo upload (drag-and-drop or file picker), accent color picker, and a
 * welcome message textarea, with a live preview panel that updates on
 * every keystroke.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { UploadCloud, CheckCircle2 } from 'lucide-react';
import { BrandingLivePreview } from '@/components/branding/BrandingLivePreview';
import { notifyBrandingUpdated } from '@/hooks/useChurchBranding';
import { defaultBranding, type ChurchBranding } from '@/lib/church-branding';

export default function BrandingSettingsPage() {
  const [branding, setBranding] = useState<ChurchBranding>(defaultBranding);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetch('/api/church/branding')
      .then((r) => r.json())
      .then((json: { data?: ChurchBranding }) => { if (json.data) setBranding(json.data); })
      .finally(() => setLoading(false));
  }, []);

  function set<K extends keyof ChurchBranding>(key: K, value: ChurchBranding[K]) {
    setBranding((b) => ({ ...b, [key]: value }));
    setSaved(false);
  }

  const uploadLogo = useCallback(async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('logo', file);
      const res = await fetch('/api/church/branding/logo', { method: 'POST', body: formData });
      const json = await res.json() as { data?: { logoUrl: string }; message?: string };
      if (res.ok && json.data) set('logoUrl', json.data.logoUrl);
    } finally {
      setUploading(false);
    }
  }, []);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void uploadLogo(file);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch('/api/church/branding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(branding),
      });
      const json = await res.json() as { data?: ChurchBranding };
      if (json.data) {
        setBranding(json.data);
        notifyBrandingUpdated(json.data);
      }
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
          <h1>Branding</h1>
          <p>Your logo, accent color, and welcome message — shown across the sidebar, buttons, and emails.</p>
        </div>
        <button type="button" className="sa-btn sa-btn--primary" onClick={handleSave} disabled={saving || loading}>
          {saved ? <><CheckCircle2 size={14} aria-hidden="true" /> Saved</> : saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>

      <div className="bulletin-editor__layout">
        <div className="bulletin-editor__form">
          <section className="bulletin-editor__group">
            <h3>Logo</h3>
            <div
              className={`branding-dropzone${dragOver ? ' branding-dropzone--over' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') fileInputRef.current?.click(); }}
            >
              {branding.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={branding.logoUrl} alt="Church logo" className="branding-dropzone__preview" />
              ) : (
                <UploadCloud size={22} aria-hidden="true" />
              )}
              <span>{uploading ? 'Uploading…' : 'Drag & drop a logo, or click to browse'}</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => { const f = e.target.files?.[0]; if (f) void uploadLogo(f); }}
              />
            </div>
          </section>

          <section className="bulletin-editor__group">
            <h3>Accent color</h3>
            <div className="bulletin-editor__color-row">
              <label className="bulletin-editor__field bulletin-editor__field--color">
                <span>Swatch</span>
                <input type="color" value={branding.accentColor} onChange={(e) => set('accentColor', e.target.value)} />
              </label>
              <label className="bulletin-editor__field" style={{ flex: 1 }}>
                <span>Hex value</span>
                <input
                  value={branding.accentColor}
                  onChange={(e) => set('accentColor', e.target.value)}
                  pattern="^#[0-9a-fA-F]{6}$"
                  placeholder="#b25131"
                />
              </label>
            </div>
          </section>

          <section className="bulletin-editor__group">
            <h3>Welcome message</h3>
            <textarea rows={3} value={branding.welcomeMessage} onChange={(e) => set('welcomeMessage', e.target.value)} />
          </section>
        </div>

        <div className="bulletin-editor__preview">
          <BrandingLivePreview branding={branding} />
        </div>
      </div>
    </div>
  );
}
