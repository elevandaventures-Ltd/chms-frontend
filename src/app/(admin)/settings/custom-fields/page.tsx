'use client';

/**
 * /settings/custom-fields — Day 49 Task 2. Add/edit/delete
 * denomination-specific custom fields that appear on the member add/edit
 * form (text, number, date, dropdown, boolean).
 */
import { useEffect, useState } from 'react';
import { Plus, Trash2, Type, Hash, Calendar, ChevronDown, ToggleLeft } from 'lucide-react';
import type { ChurchCustomField, CustomFieldType } from '@/lib/church-branding';

const TYPE_ICON: Record<CustomFieldType, React.ReactNode> = {
  text: <Type size={13} />, number: <Hash size={13} />, date: <Calendar size={13} />,
  dropdown: <ChevronDown size={13} />, boolean: <ToggleLeft size={13} />,
};

const TYPE_LABEL: Record<CustomFieldType, string> = {
  text: 'Text', number: 'Number', date: 'Date', dropdown: 'Dropdown', boolean: 'Yes/No',
};

export default function CustomFieldsPage() {
  const [fields, setFields] = useState<ChurchCustomField[]>([]);
  const [loading, setLoading] = useState(true);
  const [label, setLabel] = useState('');
  const [type, setType] = useState<CustomFieldType>('text');
  const [options, setOptions] = useState('');
  const [required, setRequired] = useState(false);
  const [adding, setAdding] = useState(false);

  function load() {
    fetch('/api/church/custom-fields')
      .then((r) => r.json())
      .then((json: { data?: ChurchCustomField[] }) => setFields(json.data ?? []))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim()) return;
    setAdding(true);
    try {
      await fetch('/api/church/custom-fields', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: label.trim(), type, required,
          options: type === 'dropdown' ? options.split(',').map((o) => o.trim()).filter(Boolean) : undefined,
        }),
      });
      setLabel(''); setOptions(''); setRequired(false); setType('text');
      load();
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/church/custom-fields/${id}`, { method: 'DELETE' });
    setFields((prev) => prev.filter((f) => f.id !== id));
  }

  return (
    <div className="cf-page">
      <div className="bulletin-editor__head">
        <div>
          <h1>Custom fields</h1>
          <p>Add fields specific to your denomination — they appear on every member&apos;s add/edit form.</p>
        </div>
      </div>

      <div className="cf-list">
        {loading ? (
          <div className="skeleton-shimmer" style={{ height: 40, borderRadius: 10 }} />
        ) : fields.length === 0 ? (
          <p className="sched-list__empty">No custom fields yet — add one below.</p>
        ) : fields.map((f) => (
          <div key={f.id} className="cf-row">
            <span className="cf-row__icon">{TYPE_ICON[f.type]}</span>
            <div className="cf-row__copy">
              <strong>{f.label}{f.required && <span className="amf-required"> *</span>}</strong>
              <span>{TYPE_LABEL[f.type]}{f.options ? ` — ${f.options.join(', ')}` : ''}</span>
            </div>
            <button type="button" className="team-table__remove" onClick={() => handleDelete(f.id)} aria-label={`Delete ${f.label}`}>
              <Trash2 size={13} aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>

      <form className="cf-form" onSubmit={handleAdd}>
        <h3>Add a field</h3>
        <div className="cf-form__row">
          <label className="bulletin-editor__field" style={{ flex: 2 }}>
            <span>Label</span>
            <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Cell Group" required />
          </label>
          <label className="bulletin-editor__field">
            <span>Type</span>
            <select value={type} onChange={(e) => setType(e.target.value as CustomFieldType)}>
              {(Object.keys(TYPE_LABEL) as CustomFieldType[]).map((t) => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
            </select>
          </label>
        </div>
        {type === 'dropdown' && (
          <label className="bulletin-editor__field">
            <span>Options (comma-separated)</span>
            <input value={options} onChange={(e) => setOptions(e.target.value)} placeholder="North Cell, South Cell, East Cell" />
          </label>
        )}
        <label className="bulletin-editor__toggle">
          <input type="checkbox" checked={required} onChange={(e) => setRequired(e.target.checked)} /> Required
        </label>
        <button type="submit" className="sa-btn sa-btn--primary" disabled={adding} style={{ width: 'fit-content' }}>
          <Plus size={14} aria-hidden="true" /> {adding ? 'Adding…' : 'Add field'}
        </button>
      </form>
    </div>
  );
}
