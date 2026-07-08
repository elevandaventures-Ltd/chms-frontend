'use client';

/**
 * TemplateEditor — Day 33
 * Text editor with variable insertion toolbar + live preview with sample values.
 */
import { useRef, useState } from 'react';
import { Eye, EyeOff, Plus } from 'lucide-react';
import type { MessageTemplate } from './TemplateLibrary';

/* ── Variable definitions ─────────────────────────────────────────────────── */

interface TemplateVar {
  token: string;
  label: string;
  sample: string;
  group: string;
}

const VARIABLES: TemplateVar[] = [
  // Member
  { token: '{{member.firstName}}',    label: 'First Name',       sample: 'James',                group: 'Member' },
  { token: '{{member.lastName}}',     label: 'Last Name',        sample: 'Okafor',               group: 'Member' },
  { token: '{{member.spouseName}}',   label: 'Spouse Name',      sample: 'Grace',                group: 'Member' },
  { token: '{{member.yearsAtChurch}}',label: 'Years at Church',  sample: '5',                    group: 'Member' },
  // Church
  { token: '{{church.name}}',         label: 'Church Name',      sample: 'Grace Community Church', group: 'Church' },
  { token: '{{church.phone}}',        label: 'Church Phone',     sample: '+1 (555) 234-5678',    group: 'Church' },
  { token: '{{church.taxId}}',        label: 'Tax ID',           sample: '12-3456789',           group: 'Church' },
  // Pastor
  { token: '{{pastor.name}}',         label: 'Pastor Name',      sample: 'Pastor David Mensah',  group: 'Pastor' },
  // Event
  { token: '{{event.title}}',         label: 'Event Title',      sample: 'Annual Harvest Night', group: 'Event' },
  { token: '{{event.date}}',          label: 'Event Date',       sample: 'Saturday, 14 June',    group: 'Event' },
  { token: '{{event.time}}',          label: 'Event Time',       sample: '6:00 PM',              group: 'Event' },
  { token: '{{event.location}}',      label: 'Location',         sample: 'Main Sanctuary',       group: 'Event' },
  { token: '{{event.description}}',   label: 'Description',      sample: 'Join us for an evening of worship and celebration.', group: 'Event' },
  // Service
  { token: '{{service.time}}',        label: 'Service Time',     sample: '10:00 AM',             group: 'Service' },
  // Finance
  { token: '{{giving.amount}}',       label: 'Gift Amount',      sample: '$250.00',              group: 'Finance' },
  { token: '{{giving.date}}',         label: 'Gift Date',        sample: 'June 1, 2026',         group: 'Finance' },
  { token: '{{giving.yearTotal}}',    label: 'Year Total',       sample: '$3,200.00',            group: 'Finance' },
  { token: '{{pledge.amount}}',       label: 'Pledge Amount',    sample: '$500.00',              group: 'Finance' },
  { token: '{{pledge.dueDate}}',      label: 'Pledge Due Date',  sample: 'June 30, 2026',        group: 'Finance' },
  { token: '{{year}}',                label: 'Year',             sample: '2025',                 group: 'Finance' },
  // Pastoral
  { token: '{{prayer.topic}}',        label: 'Prayer Topic',     sample: 'your health journey',  group: 'Pastoral' },
  // Celebrations
  { token: '{{anniversary.years}}',   label: 'Anniversary Years',sample: '10th',                 group: 'Celebrations' },
  { token: '{{baby.name}}',           label: 'Baby Name',        sample: 'little Elijah',        group: 'Celebrations' },
  // Devotional
  { token: '{{devotional.verse}}',    label: 'Verse Text',       sample: 'I can do all things through Christ who strengthens me.', group: 'Devotional' },
  { token: '{{devotional.reference}}',label: 'Reference',        sample: 'Philippians 4:13',     group: 'Devotional' },
];

const GROUPS = [...new Set(VARIABLES.map(v => v.group))];

function resolvePreview(text: string): string {
  let out = text;
  for (const v of VARIABLES) {
    out = out.replaceAll(v.token, v.sample);
  }
  return out;
}

/* ── Component ────────────────────────────────────────────────────────────── */

type Props = {
  initialTemplate?: MessageTemplate | null;
  subject: string;
  body: string;
  onSubjectChange: (v: string) => void;
  onBodyChange: (v: string) => void;
};

export function TemplateEditor({ initialTemplate, subject, body, onSubjectChange, onBodyChange }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showPreview,   setShowPreview]   = useState(false);
  const [activeGroup,   setActiveGroup]   = useState(GROUPS[0]);
  const [focusedField,  setFocusedField]  = useState<'subject' | 'body'>('body');
  const subjectRef = useRef<HTMLInputElement>(null);

  function insertVariable(token: string) {
    if (focusedField === 'subject' && subjectRef.current) {
      const el  = subjectRef.current;
      const s   = el.selectionStart ?? subject.length;
      const e   = el.selectionEnd   ?? subject.length;
      const next = subject.slice(0, s) + token + subject.slice(e);
      onSubjectChange(next);
      requestAnimationFrame(() => {
        el.focus();
        el.setSelectionRange(s + token.length, s + token.length);
      });
      return;
    }
    const el = textareaRef.current;
    if (!el) return;
    const s    = el.selectionStart ?? body.length;
    const e    = el.selectionEnd   ?? body.length;
    const next = body.slice(0, s) + token + body.slice(e);
    onBodyChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(s + token.length, s + token.length);
    });
  }

  const groupVars = VARIABLES.filter(v => v.group === activeGroup);

  return (
    <div className="tpl-editor">
      {/* Variable insertion toolbar */}
      <div className="tpl-editor__toolbar">
        <div className="tpl-editor__toolbar-head">
          <span className="tpl-editor__toolbar-label">Insert variable</span>
          <span className="tpl-editor__toolbar-hint">Click to insert at cursor</span>
        </div>

        {/* Group tabs */}
        <div className="tpl-editor__groups" role="tablist">
          {GROUPS.map(g => (
            <button
              key={g}
              type="button"
              role="tab"
              aria-selected={activeGroup === g}
              className={`tpl-editor__group${activeGroup === g ? ' tpl-editor__group--active' : ''}`}
              onClick={() => setActiveGroup(g)}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Variable pills */}
        <div className="tpl-editor__vars">
          {groupVars.map(v => (
            <button
              key={v.token}
              type="button"
              className="tpl-editor__var-pill"
              onClick={() => insertVariable(v.token)}
              title={`Sample: ${v.sample}`}
            >
              <Plus size={11} />
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Subject field */}
      {(initialTemplate?.channel === 'email' || subject) && (
        <div className="tpl-editor__field">
          <label className="tpl-editor__field-label" htmlFor="tpl-subject">Subject</label>
          <input
            ref={subjectRef}
            id="tpl-subject"
            className="tpl-editor__input"
            type="text"
            value={subject}
            onChange={e => onSubjectChange(e.target.value)}
            onFocus={() => setFocusedField('subject')}
            placeholder="Email subject…"
          />
        </div>
      )}

      {/* Body field */}
      <div className="tpl-editor__field">
        <div className="tpl-editor__field-row">
          <label className="tpl-editor__field-label" htmlFor="tpl-body">Message body</label>
          <button
            type="button"
            className="tpl-editor__preview-toggle"
            onClick={() => setShowPreview(p => !p)}
          >
            {showPreview ? <><EyeOff size={13} /> Edit</> : <><Eye size={13} /> Preview</>}
          </button>
        </div>

        {showPreview ? (
          <div className="tpl-editor__preview-box">
            {subject && (
              <p className="tpl-editor__preview-subject">
                <strong>Subject:</strong> {resolvePreview(subject)}
              </p>
            )}
            <pre className="tpl-editor__preview-body">{resolvePreview(body) || <em>Nothing to preview yet.</em>}</pre>
            <p className="tpl-editor__preview-note">Variables replaced with sample values</p>
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            id="tpl-body"
            className="tpl-editor__textarea"
            value={body}
            onChange={e => onBodyChange(e.target.value)}
            onFocus={() => setFocusedField('body')}
            placeholder="Type your message or select a template above…"
            rows={7}
          />
        )}
      </div>

      {/* Variable token legend */}
      {!showPreview && body.includes('{{') && (
        <div className="tpl-editor__legend">
          <span className="tpl-editor__legend-label">Variables in use:</span>
          <div className="tpl-editor__legend-tokens">
            {VARIABLES.filter(v => body.includes(v.token) || subject.includes(v.token)).map(v => (
              <span key={v.token} className="tpl-editor__legend-token" title={`→ ${v.sample}`}>
                {v.token}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
