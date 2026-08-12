'use client';

/**
 * EmailComposer — Day 32
 * Rich-text email composer using TipTap.
 * Features: subject field, from-name selector, TipTap editor, preview pane.
 */
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { useState } from 'react';
import {
  Bold, Italic, Underline as UnderlineIcon, Link as LinkIcon,
  AlignLeft, AlignCenter, AlignRight, List, ListOrdered,
  Eye, EyeOff, Heading2,
} from 'lucide-react';
import type { AudienceFilters } from './AudienceSelector';

const FROM_NAMES = [
  'Elevanda Church',
  "Pastor's Office",
  'Church Admin',
  'Youth Ministry',
  'Finance Office',
];

type Props = {
  filters:  AudienceFilters;
  reach:    number;
  onSent?:  (result: { sent: number }) => void;
};

export function EmailComposer({ filters, reach, onSent }: Props) {
  const [subject,     setSubject]     = useState('');
  const [fromName,    setFromName]    = useState(FROM_NAMES[0]);
  const [preview,     setPreview]     = useState(false);
  const [sending,     setSending]     = useState(false);
  const [serverError, setServerError] = useState('');
  const [sent,        setSent]        = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: 'Write your email…' }),
    ],
    editorProps: {
      attributes: { class: 'email-editor__content' },
    },
  });

  const htmlBody = editor?.getHTML() ?? '';
  const textBody = editor?.getText() ?? '';
  const isEmpty  = textBody.trim().length === 0;

  function addLink() {
    const url = window.prompt('Enter URL');
    if (!url || !editor) return;
    editor.chain().focus().setLink({ href: url }).run();
  }

  async function handleSend() {
    if (!subject.trim()) { setServerError('Enter a subject line.'); return; }
    if (isEmpty)         { setServerError('Write an email body.'); return; }
    setSending(true);
    setServerError('');
    try {
      const res  = await fetch('/api/communication/send', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          channel: 'email',
          subject,
          fromName,
          body: htmlBody,
          filters,
          trackOpens: true,
        }),
      });
      const json = await res.json() as { sent?: number; error?: string };
      if (!res.ok) { setServerError(json.error ?? 'Failed to send.'); return; }
      setSent(true);
      onSent?.({ sent: json.sent ?? reach });
    } catch {
      setServerError('Network error. Please try again.');
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="email-sent">
        <span className="email-sent__icon">✓</span>
        <p className="email-sent__msg">
          Email queued for <strong>{reach.toLocaleString()}</strong> recipient{reach !== 1 ? 's' : ''}.
        </p>
        <button
          type="button"
          className="comm-btn comm-btn--secondary"
          onClick={() => { setSent(false); editor?.commands.clearContent(); setSubject(''); }}
        >
          Compose another
        </button>
      </div>
    );
  }

  return (
    <div className="email-composer">
      {/* Meta fields */}
      <div className="email-composer__meta">
        <div className="comm-field">
          <label className="comm-label" htmlFor="email-from">From</label>
          <select
            id="email-from"
            className="comm-input email-composer__select"
            value={fromName}
            onChange={(e) => setFromName(e.target.value)}
          >
            {FROM_NAMES.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        <div className="comm-field">
          <label className="comm-label" htmlFor="email-subject">Subject</label>
          <input
            id="email-subject"
            className="comm-input"
            type="text"
            value={subject}
            onChange={(e) => { setSubject(e.target.value); setServerError(''); }}
            placeholder="Email subject…"
          />
        </div>
      </div>

      {/* Toolbar + editor / preview toggle */}
      <div className="email-editor">
        <div className="email-editor__bar">
          {/* Formatting buttons */}
          <div className="email-editor__group">
            <button
              type="button"
              title="Bold"
              className={`email-editor__btn${editor?.isActive('bold') ? ' email-editor__btn--active' : ''}`}
              onClick={() => editor?.chain().focus().toggleBold().run()}
            ><Bold size={13} /></button>

            <button
              type="button"
              title="Italic"
              className={`email-editor__btn${editor?.isActive('italic') ? ' email-editor__btn--active' : ''}`}
              onClick={() => editor?.chain().focus().toggleItalic().run()}
            ><Italic size={13} /></button>

            <button
              type="button"
              title="Underline"
              className={`email-editor__btn${editor?.isActive('underline') ? ' email-editor__btn--active' : ''}`}
              onClick={() => editor?.chain().focus().toggleUnderline().run()}
            ><UnderlineIcon size={13} /></button>

            <button
              type="button"
              title="Heading"
              className={`email-editor__btn${editor?.isActive('heading', { level: 2 }) ? ' email-editor__btn--active' : ''}`}
              onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
            ><Heading2 size={13} /></button>
          </div>

          <div className="email-editor__sep" />

          <div className="email-editor__group">
            <button
              type="button"
              title="Bullet list"
              className={`email-editor__btn${editor?.isActive('bulletList') ? ' email-editor__btn--active' : ''}`}
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
            ><List size={13} /></button>

            <button
              type="button"
              title="Ordered list"
              className={`email-editor__btn${editor?.isActive('orderedList') ? ' email-editor__btn--active' : ''}`}
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            ><ListOrdered size={13} /></button>
          </div>

          <div className="email-editor__sep" />

          <div className="email-editor__group">
            <button
              type="button"
              title="Align left"
              className={`email-editor__btn${editor?.isActive({ textAlign: 'left' }) ? ' email-editor__btn--active' : ''}`}
              onClick={() => editor?.chain().focus().setTextAlign('left').run()}
            ><AlignLeft size={13} /></button>

            <button
              type="button"
              title="Align center"
              className={`email-editor__btn${editor?.isActive({ textAlign: 'center' }) ? ' email-editor__btn--active' : ''}`}
              onClick={() => editor?.chain().focus().setTextAlign('center').run()}
            ><AlignCenter size={13} /></button>

            <button
              type="button"
              title="Align right"
              className={`email-editor__btn${editor?.isActive({ textAlign: 'right' }) ? ' email-editor__btn--active' : ''}`}
              onClick={() => editor?.chain().focus().setTextAlign('right').run()}
            ><AlignRight size={13} /></button>
          </div>

          <div className="email-editor__sep" />

          <div className="email-editor__group">
            <button
              type="button"
              title="Insert link"
              className={`email-editor__btn${editor?.isActive('link') ? ' email-editor__btn--active' : ''}`}
              onClick={addLink}
            ><LinkIcon size={13} /></button>
          </div>

          {/* Preview toggle — pushed to the right */}
          <button
            type="button"
            className={`email-editor__preview-btn${preview ? ' email-editor__preview-btn--active' : ''}`}
            onClick={() => setPreview((p) => !p)}
            title={preview ? 'Back to editor' : 'Preview email'}
          >
            {preview ? <EyeOff size={13} /> : <Eye size={13} />}
            {preview ? 'Edit' : 'Preview'}
          </button>
        </div>

        {preview ? (
          /* ── Preview pane ── */
          <div className="email-preview">
            <div className="email-preview__header">
              <div className="email-preview__row">
                <span className="email-preview__label">From</span>
                <span className="email-preview__value">{fromName} &lt;noreply@elevanda.org&gt;</span>
              </div>
              <div className="email-preview__row">
                <span className="email-preview__label">Subject</span>
                <span className="email-preview__value">{subject || <em>No subject</em>}</span>
              </div>
              <div className="email-preview__row">
                <span className="email-preview__label">To</span>
                <span className="email-preview__value">{reach.toLocaleString()} recipient{reach !== 1 ? 's' : ''}</span>
              </div>
            </div>
            <div
              className="email-preview__body"
              dangerouslySetInnerHTML={{ __html: isEmpty ? '<p style="color:#9ca3af">No content yet…</p>' : htmlBody }}
            />
          </div>
        ) : (
          /* ── TipTap editor ── */
          <EditorContent editor={editor} className="email-editor__wrap" />
        )}
      </div>

      {serverError && <p className="comm-error" role="alert">{serverError}</p>}

      <div className="comm-composer__footer">
        <span className="comm-composer__reach-hint">
          Sending to <strong>{reach.toLocaleString()}</strong> recipient{reach !== 1 ? 's' : ''}
        </span>
        <button
          type="button"
          className="comm-btn comm-btn--primary"
          onClick={handleSend}
          disabled={sending || isEmpty || !subject.trim() || reach === 0}
        >
          {sending ? 'Sending…' : 'Send Email'}
        </button>
      </div>
    </div>
  );
}

export default EmailComposer;
