'use client';

/**
 * TemplateLibrary — Day 33
 * Category-filtered grid of 20 seeded templates with expand-to-full-preview modal.
 */
import { useState } from 'react';
import { X, Eye, Copy, Check, ChevronRight } from 'lucide-react';

export type TemplateCategory = 'All' | 'Welcome' | 'Events' | 'Finance' | 'Pastoral' | 'Celebrations';

export interface MessageTemplate {
  id: string;
  category: Exclude<TemplateCategory, 'All'>;
  name: string;
  subject?: string;
  body: string;
  channel: 'sms' | 'email' | 'whatsapp' | 'push' | 'any';
}

const TEMPLATES: MessageTemplate[] = [
  // Welcome
  { id: 't1',  category: 'Welcome',      channel: 'sms',      name: 'New Member Welcome',         body: 'Hi {{member.firstName}}, welcome to {{church.name}}! We\'re so glad you\'re here. See you Sunday at {{service.time}}.' },
  { id: 't2',  category: 'Welcome',      channel: 'email',    name: 'First Visit Follow-up',       subject: 'Great to meet you, {{member.firstName}}!', body: 'Dear {{member.firstName}},\n\nThank you for visiting {{church.name}} this past Sunday. We hope you felt at home.\n\nWe\'d love to connect with you further. Reply to this email or call us at {{church.phone}}.\n\nBlessings,\n{{pastor.name}}' },
  { id: 't3',  category: 'Welcome',      channel: 'whatsapp', name: 'WhatsApp Welcome',            body: '🙏 Welcome to {{church.name}}, {{member.firstName}}! We\'re excited to have you join our community. Feel free to reach out anytime.' },
  { id: 't4',  category: 'Welcome',      channel: 'push',     name: 'App Onboarding Push',         body: 'Welcome, {{member.firstName}}! Your {{church.name}} app is ready. Explore events, give, and connect.' },
  // Events
  { id: 't5',  category: 'Events',       channel: 'sms',      name: 'Event Reminder (SMS)',        body: 'Reminder: {{event.title}} is happening {{event.date}} at {{event.time}}, {{event.location}}. See you there!' },
  { id: 't6',  category: 'Events',       channel: 'email',    name: 'Event Invitation',            subject: 'You\'re invited: {{event.title}}', body: 'Hi {{member.firstName}},\n\nYou\'re invited to {{event.title}} on {{event.date}} at {{event.time}}.\n\nLocation: {{event.location}}\n\n{{event.description}}\n\nRSVP by replying to this email.\n\nBlessings,\n{{church.name}}' },
  { id: 't7',  category: 'Events',       channel: 'push',     name: 'Event Day Push',              body: '📅 Today\'s the day! {{event.title}} starts at {{event.time}}. We can\'t wait to see you.' },
  { id: 't8',  category: 'Events',       channel: 'whatsapp', name: 'Event WhatsApp Blast',        body: '🎉 Don\'t miss *{{event.title}}* on {{event.date}} at {{event.time}}. Location: {{event.location}}. Bring a friend!' },
  // Finance
  { id: 't9',  category: 'Finance',      channel: 'email',    name: 'Giving Receipt',              subject: 'Your giving receipt — {{giving.date}}', body: 'Dear {{member.firstName}},\n\nThank you for your generous gift of {{giving.amount}} on {{giving.date}}.\n\nThis receipt confirms your contribution to {{church.name}}.\n\nTax ID: {{church.taxId}}\n\nWith gratitude,\n{{church.name}}' },
  { id: 't10', category: 'Finance',      channel: 'sms',      name: 'Pledge Reminder',             body: 'Hi {{member.firstName}}, this is a friendly reminder about your pledge of {{pledge.amount}} due {{pledge.dueDate}}. Thank you for your faithfulness!' },
  { id: 't11', category: 'Finance',      channel: 'email',    name: 'Year-End Giving Statement',   subject: '{{church.name}} — Your {{year}} Giving Statement', body: 'Dear {{member.firstName}},\n\nPlease find your {{year}} giving statement below.\n\nTotal Contributions: {{giving.yearTotal}}\n\nThank you for your faithful generosity. Your gifts make a real difference.\n\nBlessings,\n{{pastor.name}}' },
  // Pastoral
  { id: 't12', category: 'Pastoral',     channel: 'sms',      name: 'Pastoral Check-in',           body: 'Hi {{member.firstName}}, {{pastor.name}} here. Just checking in on you. How are you doing? Feel free to call or reply anytime.' },
  { id: 't13', category: 'Pastoral',     channel: 'email',    name: 'Prayer Follow-up',            subject: 'Following up on your prayer request', body: 'Dear {{member.firstName}},\n\nWe\'ve been praying for you regarding {{prayer.topic}}. We wanted to check in and see how things are going.\n\nPlease don\'t hesitate to reach out if you need anything.\n\nIn prayer,\n{{pastor.name}}' },
  { id: 't14', category: 'Pastoral',     channel: 'whatsapp', name: 'Bereavement Support',         body: 'Dear {{member.firstName}}, our hearts are with you during this difficult time. Please know that {{church.name}} is here for you. 🙏' },
  { id: 't15', category: 'Pastoral',     channel: 'push',     name: 'Daily Devotional Push',       body: '📖 Today\'s verse: "{{devotional.verse}}" — {{devotional.reference}}. Have a blessed day, {{member.firstName}}!' },
  // Celebrations
  { id: 't16', category: 'Celebrations', channel: 'sms',      name: 'Birthday Greeting',           body: '🎂 Happy Birthday, {{member.firstName}}! Wishing you a wonderful day filled with joy and blessings. — {{church.name}}' },
  { id: 't17', category: 'Celebrations', channel: 'email',    name: 'Anniversary Blessing',        subject: 'Happy Anniversary, {{member.firstName}}!', body: 'Dear {{member.firstName}} & {{member.spouseName}},\n\nCongratulations on your {{anniversary.years}} wedding anniversary! May God continue to bless your union.\n\nWith love,\n{{church.name}}' },
  { id: 't18', category: 'Celebrations', channel: 'whatsapp', name: 'Baptism Congratulations',     body: '🕊️ Congratulations on your baptism, {{member.firstName}}! What a beautiful step of faith. We celebrate with you today!' },
  { id: 't19', category: 'Celebrations', channel: 'sms',      name: 'Membership Milestone',        body: 'Hi {{member.firstName}}, today marks {{member.yearsAtChurch}} years as part of {{church.name}}! Thank you for your faithfulness. 🙌' },
  { id: 't20', category: 'Celebrations', channel: 'push',     name: 'New Baby Announcement',       body: '👶 Congratulations to {{member.firstName}} on the arrival of {{baby.name}}! May God bless your growing family.' },
];

const CATEGORIES: TemplateCategory[] = ['All', 'Welcome', 'Events', 'Finance', 'Pastoral', 'Celebrations'];

const CHANNEL_LABEL: Record<MessageTemplate['channel'], string> = {
  sms: 'SMS', email: 'Email', whatsapp: 'WhatsApp', push: 'Push', any: 'Any',
};

const CATEGORY_COLOR: Record<Exclude<TemplateCategory, 'All'>, string> = {
  Welcome:      'tpl-badge--welcome',
  Events:       'tpl-badge--events',
  Finance:      'tpl-badge--finance',
  Pastoral:     'tpl-badge--pastoral',
  Celebrations: 'tpl-badge--celebrations',
};

type Props = {
  onSelect: (tpl: MessageTemplate) => void;
};

export function TemplateLibrary({ onSelect }: Props) {
  const [category, setCategory] = useState<TemplateCategory>('All');
  const [preview,  setPreview]  = useState<MessageTemplate | null>(null);
  const [copied,   setCopied]   = useState('');

  const filtered = category === 'All' ? TEMPLATES : TEMPLATES.filter(t => t.category === category);

  function handleCopy(body: string, id: string) {
    void navigator.clipboard.writeText(body);
    setCopied(id);
    setTimeout(() => setCopied(''), 2000);
  }

  return (
    <div className="tpl-lib">
      {/* Category filter bar */}
      <div className="tpl-lib__cats" role="tablist" aria-label="Template categories">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            type="button"
            role="tab"
            aria-selected={category === cat}
            className={`tpl-lib__cat${category === cat ? ' tpl-lib__cat--active' : ''}`}
            onClick={() => setCategory(cat)}
          >
            {cat}
            <span className="tpl-lib__cat-count">
              {cat === 'All' ? TEMPLATES.length : TEMPLATES.filter(t => t.category === cat).length}
            </span>
          </button>
        ))}
      </div>

      {/* Template grid */}
      <div className="tpl-grid">
        {filtered.map(tpl => (
          <div key={tpl.id} className="tpl-card">
            <div className="tpl-card__head">
              <div className="tpl-card__badges">
                <span className={`tpl-badge ${CATEGORY_COLOR[tpl.category]}`}>{tpl.category}</span>
                <span className="tpl-badge tpl-badge--channel">{CHANNEL_LABEL[tpl.channel]}</span>
              </div>
            </div>
            <p className="tpl-card__name">{tpl.name}</p>
            <p className="tpl-card__preview">{tpl.body.slice(0, 90)}{tpl.body.length > 90 ? '…' : ''}</p>
            <div className="tpl-card__actions">
              <button
                type="button"
                className="tpl-card__btn tpl-card__btn--ghost"
                onClick={() => setPreview(tpl)}
                aria-label={`Preview ${tpl.name}`}
              >
                <Eye size={14} /> Preview
              </button>
              <button
                type="button"
                className="tpl-card__btn tpl-card__btn--ghost"
                onClick={() => handleCopy(tpl.body, tpl.id)}
                aria-label={`Copy ${tpl.name}`}
              >
                {copied === tpl.id ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
              </button>
              <button
                type="button"
                className="tpl-card__btn tpl-card__btn--primary"
                onClick={() => onSelect(tpl)}
              >
                Use <ChevronRight size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Full-preview modal */}
      {preview && (
        <div className="tpl-modal-overlay" role="dialog" aria-modal="true" aria-label={`Preview: ${preview.name}`}>
          <div className="tpl-modal-backdrop" onClick={() => setPreview(null)} />
          <div className="tpl-modal">
            <div className="tpl-modal__head">
              <div>
                <div className="tpl-card__badges" style={{ marginBottom: 6 }}>
                  <span className={`tpl-badge ${CATEGORY_COLOR[preview.category]}`}>{preview.category}</span>
                  <span className="tpl-badge tpl-badge--channel">{CHANNEL_LABEL[preview.channel]}</span>
                </div>
                <h2 className="tpl-modal__title">{preview.name}</h2>
              </div>
              <button
                type="button"
                className="tpl-modal__close"
                onClick={() => setPreview(null)}
                aria-label="Close preview"
              >
                <X size={16} />
              </button>
            </div>

            {preview.subject && (
              <div className="tpl-modal__field">
                <span className="tpl-modal__field-label">Subject</span>
                <p className="tpl-modal__field-value">{preview.subject}</p>
              </div>
            )}

            <div className="tpl-modal__field">
              <span className="tpl-modal__field-label">Body</span>
              <pre className="tpl-modal__body">{preview.body}</pre>
            </div>

            <div className="tpl-modal__footer">
              <button
                type="button"
                className="tpl-card__btn tpl-card__btn--ghost"
                onClick={() => handleCopy(preview.body, preview.id + '-modal')}
              >
                {copied === preview.id + '-modal' ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy body</>}
              </button>
              <button
                type="button"
                className="tpl-card__btn tpl-card__btn--primary"
                onClick={() => { onSelect(preview); setPreview(null); }}
              >
                Use this template <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export { TEMPLATES };
