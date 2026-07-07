'use client';

/**
 * CustomFieldsBuilder — Day 30
 *
 * Admin UI to add custom registration fields to an event form.
 * Supports: text input, dropdown (multi-option), checkbox.
 * Fields can be reordered (up/down), edited inline, and deleted.
 */
import { useState } from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown, GripVertical } from 'lucide-react';
import type { CustomField, CustomFieldType } from '@/lib/events';

// ── Helpers ───────────────────────────────────────────────────────────────────

function uid() {
  return `cf-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

const TYPE_LABELS: Record<CustomFieldType, string> = {
  text:     'Text input',
  dropdown: 'Dropdown',
  checkbox: 'Checkbox',
};

const TYPE_ICONS: Record<CustomFieldType, string> = {
  text:     'T',
  dropdown: '▾',
  checkbox: '☑',
};

// ── Sub-component: single field editor ───────────────────────────────────────

type FieldEditorProps = {
  field:    CustomField;
  index:    number;
  total:    number;
  onChange: (updated: CustomField) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
};

function FieldEditor({ field, index, total, onChange, onDelete, onMoveUp, onMoveDown }: FieldEditorProps) {
  const [optionDraft, setOptionDraft] = useState('');

  function addOption() {
    const trimmed = optionDraft.trim();
    if (!trimmed) return;
    onChange({ ...field, options: [...(field.options ?? []), trimmed] });
    setOptionDraft('');
  }

  function removeOption(i: number) {
    onChange({ ...field, options: (field.options ?? []).filter((_, idx) => idx !== i) });
  }

  function updateOption(i: number, val: string) {
    const opts = [...(field.options ?? [])];
    opts[i] = val;
    onChange({ ...field, options: opts });
  }

  return (
    <div className="cfb-field">
      {/* Drag handle + order controls */}
      <div className="cfb-field__handle" aria-hidden="true">
        <GripVertical size={14} />
      </div>

      <div className="cfb-field__body">
        {/* Row 1: type badge + label + required toggle */}
        <div className="cfb-field__row">
          <span className="cfb-field__type-badge" title={TYPE_LABELS[field.type]}>
            {TYPE_ICONS[field.type]}
          </span>

          <input
            className="cfb-field__label-input"
            value={field.label}
            onChange={(e) => onChange({ ...field, label: e.target.value })}
            placeholder="Field label…"
            aria-label={`Label for field ${index + 1}`}
          />

          <label className="cfb-field__required-toggle">
            <input
              type="checkbox"
              checked={field.required}
              onChange={(e) => onChange({ ...field, required: e.target.checked })}
              aria-label="Required"
            />
            <span>Required</span>
          </label>
        </div>

        {/* Text: placeholder */}
        {field.type === 'text' && (
          <input
            className="cfb-field__placeholder-input"
            value={field.placeholder ?? ''}
            onChange={(e) => onChange({ ...field, placeholder: e.target.value })}
            placeholder="Placeholder text (optional)…"
            aria-label="Placeholder text"
          />
        )}

        {/* Dropdown: options list */}
        {field.type === 'dropdown' && (
          <div className="cfb-field__options">
            {(field.options ?? []).map((opt, i) => (
              <div key={i} className="cfb-field__option-row">
                <input
                  className="cfb-field__option-input"
                  value={opt}
                  onChange={(e) => updateOption(i, e.target.value)}
                  aria-label={`Option ${i + 1}`}
                />
                <button
                  type="button"
                  className="cfb-field__option-remove"
                  onClick={() => removeOption(i)}
                  aria-label={`Remove option ${opt}`}
                >
                  ×
                </button>
              </div>
            ))}
            <div className="cfb-field__option-add-row">
              <input
                className="cfb-field__option-input"
                value={optionDraft}
                onChange={(e) => setOptionDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addOption(); } }}
                placeholder="Add option…"
                aria-label="New option"
              />
              <button
                type="button"
                className="cfb-field__option-add-btn"
                onClick={addOption}
                disabled={!optionDraft.trim()}
              >
                Add
              </button>
            </div>
          </div>
        )}

        {/* Checkbox: no extra config needed */}
        {field.type === 'checkbox' && (
          <p className="cfb-field__checkbox-hint">
            Renders as a single checkbox the registrant can tick.
          </p>
        )}
      </div>

      {/* Actions: move up/down + delete */}
      <div className="cfb-field__actions">
        <button
          type="button"
          className="cfb-field__move-btn"
          onClick={onMoveUp}
          disabled={index === 0}
          aria-label="Move field up"
        >
          <ChevronUp size={14} />
        </button>
        <button
          type="button"
          className="cfb-field__move-btn"
          onClick={onMoveDown}
          disabled={index === total - 1}
          aria-label="Move field down"
        >
          <ChevronDown size={14} />
        </button>
        <button
          type="button"
          className="cfb-field__delete-btn"
          onClick={onDelete}
          aria-label={`Delete field: ${field.label || 'untitled'}`}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

// ── Preview: how the field looks to a registrant ──────────────────────────────

function FieldPreview({ field }: { field: CustomField }) {
  return (
    <div className="cfb-preview__field">
      <label className="cfb-preview__label">
        {field.label || <em>Untitled field</em>}
        {field.required && <span className="cfb-preview__required" aria-hidden="true"> *</span>}
      </label>

      {field.type === 'text' && (
        <input
          className="cfb-preview__input"
          placeholder={field.placeholder ?? ''}
          disabled
          aria-label={`Preview: ${field.label}`}
        />
      )}

      {field.type === 'dropdown' && (
        <select className="cfb-preview__select" disabled aria-label={`Preview: ${field.label}`}>
          <option value="">Select…</option>
          {(field.options ?? []).map((o, i) => <option key={i}>{o}</option>)}
        </select>
      )}

      {field.type === 'checkbox' && (
        <label className="cfb-preview__checkbox-label">
          <input type="checkbox" disabled />
          <span>{field.label}</span>
        </label>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

type CustomFieldsBuilderProps = {
  fields:    CustomField[];
  onChange:  (fields: CustomField[]) => void;
};

export function CustomFieldsBuilder({ fields, onChange }: CustomFieldsBuilderProps) {
  const [showPreview, setShowPreview] = useState(false);

  function addField(type: CustomFieldType) {
    const newField: CustomField = {
      id:       uid(),
      type,
      label:    '',
      required: false,
      ...(type === 'dropdown' ? { options: [] } : {}),
    };
    onChange([...fields, newField]);
  }

  function updateField(index: number, updated: CustomField) {
    const next = [...fields];
    next[index] = updated;
    onChange(next);
  }

  function deleteField(index: number) {
    onChange(fields.filter((_, i) => i !== index));
  }

  function moveField(index: number, dir: -1 | 1) {
    const next = [...fields];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div className="cfb">
      {/* Header */}
      <div className="cfb__header">
        <div className="cfb__header-copy">
          <h4 className="cfb__title">Registration Fields</h4>
          <p className="cfb__subtitle">
            Add custom fields that registrants fill in when they RSVP.
          </p>
        </div>
        {fields.length > 0 && (
          <button
            type="button"
            className={`cfb__preview-toggle${showPreview ? ' cfb__preview-toggle--active' : ''}`}
            onClick={() => setShowPreview((v) => !v)}
          >
            {showPreview ? 'Edit' : 'Preview form'}
          </button>
        )}
      </div>

      {/* Preview mode */}
      {showPreview ? (
        <div className="cfb-preview">
          <p className="cfb-preview__hint">This is how the form will appear to registrants.</p>
          {fields.map((f) => <FieldPreview key={f.id} field={f} />)}
        </div>
      ) : (
        <>
          {/* Field list */}
          {fields.length === 0 ? (
            <div className="cfb__empty">
              <p>No custom fields yet. Add one below.</p>
            </div>
          ) : (
            <div className="cfb__list">
              {fields.map((field, i) => (
                <FieldEditor
                  key={field.id}
                  field={field}
                  index={i}
                  total={fields.length}
                  onChange={(updated) => updateField(i, updated)}
                  onDelete={() => deleteField(i)}
                  onMoveUp={() => moveField(i, -1)}
                  onMoveDown={() => moveField(i, 1)}
                />
              ))}
            </div>
          )}

          {/* Add field buttons */}
          <div className="cfb__add-row">
            {(['text', 'dropdown', 'checkbox'] as CustomFieldType[]).map((type) => (
              <button
                key={type}
                type="button"
                className="cfb__add-btn"
                onClick={() => addField(type)}
              >
                <Plus size={13} aria-hidden="true" />
                {TYPE_LABELS[type]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default CustomFieldsBuilder;
