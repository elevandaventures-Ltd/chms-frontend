'use client';

/**
 * WhatsAppPhonePreview — Day 36.
 * Phone-mockup frame showing exactly how a message renders inside the
 * recipient's WhatsApp app: green header, chat wallpaper, bubble with
 * timestamp and read-receipt ticks.
 */
import { Check, CheckCheck } from 'lucide-react';

type Props = {
  churchName?: string;
  body: string;
};

function renderWhatsAppMarkup(text: string): string {
  // WhatsApp's own lightweight markdown: *bold*, _italic_, ~strike~.
  return text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*([^*]+)\*/g, '<strong>$1</strong>')
    .replace(/_([^_]+)_/g, '<em>$1</em>')
    .replace(/~([^~]+)~/g, '<s>$1</s>')
    .replace(/\n/g, '<br/>');
}

export function WhatsAppPhonePreview({ churchName = 'Your Church', body }: Props) {
  const now = new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="wa-phone">
      <div className="wa-phone__notch" aria-hidden="true" />
      <div className="wa-phone__header">
        <span className="wa-phone__avatar">{churchName.charAt(0)}</span>
        <div className="wa-phone__header-copy">
          <strong>{churchName}</strong>
          <span>online</span>
        </div>
      </div>
      <div className="wa-phone__body">
        {body.trim() ? (
          <div className="wa-phone__bubble">
            <span dangerouslySetInnerHTML={{ __html: renderWhatsAppMarkup(body) }} />
            <span className="wa-phone__meta">
              {now} <CheckCheck size={13} aria-hidden="true" className="wa-phone__ticks" />
            </span>
          </div>
        ) : (
          <div className="wa-phone__empty">
            <Check size={14} aria-hidden="true" />
            Your message preview appears here
          </div>
        )}
      </div>
    </div>
  );
}

export default WhatsAppPhonePreview;
