'use client';

import { useState } from 'react';
import { FileText, Plus, Send, Lock } from 'lucide-react';
import type { Member } from '@/lib/site';

// ── Types ─────────────────────────────────────────────────────────────────────

type NoteVisibility = 'pastoral' | 'staff' | 'all';

type PastoralNote = {
  id: string;
  date: string;
  author: string;
  body: string;
  visibility: NoteVisibility;
};

// ── Mock notes ────────────────────────────────────────────────────────────────

function getMockNotes(member: Member): PastoralNote[] {
  const joined = new Date(member.joinedDate);

  const notes: PastoralNote[] = [];

  const d1 = new Date(joined);
  d1.setMonth(d1.getMonth() + 3);
  notes.push({
    id:         `${member.id}-note-1`,
    date:       d1.toISOString().slice(0, 10),
    author:     'Pastor Abena Mensah',
    body:       `Met with ${member.fullName.split(' ')[0]} after Sunday service. Expressed desire to grow in faith and potentially take on a leadership role. Recommended joining the discipleship course in Q3.`,
    visibility: 'pastoral',
  });

  const d2 = new Date(joined);
  d2.setMonth(d2.getMonth() + 9);
  notes.push({
    id:         `${member.id}-note-2`,
    date:       d2.toISOString().slice(0, 10),
    author:     'Elder Kwame Asante',
    body:       'Completed discipleship module 1 & 2. Showing strong commitment. Follow up on module 3 enrolment.',
    visibility: 'staff',
  });

  if (member.status === 'inactive') {
    const d3 = new Date(joined);
    d3.setFullYear(d3.getFullYear() + 1);
    notes.push({
      id:         `${member.id}-note-3`,
      date:       d3.toISOString().slice(0, 10),
      author:     'Staff',
      body:       'Member has been absent for the past 3 months. Attempted phone follow-up — no answer. Prayer requested.',
      visibility: 'pastoral',
    });
  }

  return notes.sort((a, b) => b.date.localeCompare(a.date));
}

// ── Visibility badge ──────────────────────────────────────────────────────────

const VIS_LABELS: Record<NoteVisibility, string> = {
  pastoral: 'Pastoral only',
  staff:    'Staff',
  all:      'All roles',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

// ── Component ─────────────────────────────────────────────────────────────────

type MemberNotesTabProps = { member: Member };

export function MemberNotesTab({ member }: MemberNotesTabProps) {
  const [notes, setNotes]         = useState<PastoralNote[]>(() => getMockNotes(member));
  const [composing, setComposing] = useState(false);
  const [draft, setDraft]         = useState('');
  const [vis, setVis]             = useState<NoteVisibility>('staff');
  const [saving, setSaving]       = useState(false);

  function handleSave() {
    if (!draft.trim()) return;
    setSaving(true);
    // Simulate async save — replace with POST /api/members/notes in next sprint
    setTimeout(() => {
      const newNote: PastoralNote = {
        id:         `${member.id}-note-${Date.now()}`,
        date:       new Date().toISOString().slice(0, 10),
        author:     'You',
        body:       draft.trim(),
        visibility: vis,
      };
      setNotes((prev) => [newNote, ...prev]);
      setDraft('');
      setComposing(false);
      setSaving(false);
    }, 600);
  }

  return (
    <div className="mpd-notes">

      {/* Add note toolbar */}
      <div className="mpd-notes__toolbar">
        {!composing ? (
          <button
            type="button"
            className="mpd-notes__add-btn"
            onClick={() => setComposing(true)}
          >
            <Plus size={14} aria-hidden="true" />
            Add note
          </button>
        ) : (
          <div className="mpd-notes__compose">
            <textarea
              className="mpd-notes__textarea"
              placeholder="Write a pastoral note…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={4}
              autoFocus
              aria-label="Note body"
            />
            <div className="mpd-notes__compose-footer">
              <select
                className="mpd-notes__vis-select"
                value={vis}
                onChange={(e) => setVis(e.target.value as NoteVisibility)}
                aria-label="Note visibility"
              >
                <option value="pastoral">Pastoral only</option>
                <option value="staff">Staff</option>
                <option value="all">All roles</option>
              </select>
              <div className="mpd-notes__compose-actions">
                <button
                  type="button"
                  className="mpd-notes__cancel-btn"
                  onClick={() => { setComposing(false); setDraft(''); }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="mpd-notes__save-btn"
                  onClick={handleSave}
                  disabled={!draft.trim() || saving}
                >
                  <Send size={13} aria-hidden="true" />
                  {saving ? 'Saving…' : 'Save note'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notes list */}
      {notes.length === 0 ? (
        <div className="mpd-notes__empty">
          <FileText size={28} strokeWidth={1.5} />
          <p>No pastoral notes yet.</p>
          <p className="mpd-notes__empty-hint">Add the first note using the button above.</p>
        </div>
      ) : (
        <ol className="mpd-notes__list" aria-label="Pastoral notes">
          {notes.map((note) => (
            <li key={note.id} className="mpd-notes__item">
              <div className="mpd-notes__item-header">
                <span className="mpd-notes__author">{note.author}</span>
                <time className="mpd-notes__date" dateTime={note.date}>
                  {formatDate(note.date)}
                </time>
              </div>
              <p className="mpd-notes__body">{note.body}</p>
              <span className="mpd-notes__vis">
                <Lock size={10} aria-hidden="true" />
                {VIS_LABELS[note.visibility]}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
