'use client';

/**
 * WhatsAppInbox — Day 37.
 * Left panel: conversation list (member name, last message preview, unread
 * badge). Right panel: chat-style message thread with a reply composer
 * (text + emoji picker + send) and a "typing…" indicator while the admin
 * composes. See simulate-reply/route.ts for why replies are simulated —
 * there's no live WhatsApp Business webhook wired up in this project.
 */
import { useEffect, useRef, useState } from 'react';
import { Send, Smile, RefreshCw, MessageCircleReply } from 'lucide-react';
import type { WhatsAppConversation, WhatsAppMessage } from '@/lib/communication';

const EMOJIS = ['😀','😂','🙏','❤️','👍','🎉','🙌','😊','😢','🔥','✅','📅','📖','🕊️','👏','🌟','😇','💐','🤝','🎂','🙇','💯','🌿','☀️'];

function relTime(iso: string): string {
  const diffMin = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (diffMin < 1) return 'now';
  if (diffMin < 60) return `${diffMin}m`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h`;
  return `${Math.floor(diffH / 24)}d`;
}

function initials(name: string): string {
  return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('');
}

export function WhatsAppInbox() {
  const [conversations, setConversations] = useState<WhatsAppConversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const threadEndRef = useRef<HTMLDivElement | null>(null);

  async function loadConversations() {
    const res = await fetch('/api/communication/whatsapp/conversations');
    const json = await res.json() as { data?: WhatsAppConversation[] };
    setConversations(json.data ?? []);
  }

  async function loadMessages(id: string) {
    const res = await fetch(`/api/communication/whatsapp/conversations/${id}/messages`);
    const json = await res.json() as { data?: WhatsAppMessage[] };
    setMessages(json.data ?? []);
    void loadConversations(); // refresh unread badge
  }

  useEffect(() => { void loadConversations(); }, []);

  useEffect(() => {
    if (selectedId) void loadMessages(selectedId);
    else setMessages([]);
  }, [selectedId]);

  // Poll the open thread + conversation list so a simulated reply shows up
  // within a few seconds, matching the Day 37 review's "within 5 seconds".
  useEffect(() => {
    const id = setInterval(() => {
      void loadConversations();
      if (selectedId) void loadMessages(selectedId);
    }, 4000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleDraftChange(v: string) {
    setDraft(v);
    setIsTyping(true);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => setIsTyping(false), 1500);
  }

  function insertEmoji(emoji: string) {
    setDraft((d) => d + emoji);
    setShowEmoji(false);
  }

  async function handleSend() {
    if (!selectedId || !draft.trim()) return;
    setSending(true);
    try {
      await fetch(`/api/communication/whatsapp/conversations/${selectedId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: draft.trim() }),
      });
      setDraft('');
      setIsTyping(false);
      await loadMessages(selectedId);
    } finally {
      setSending(false);
    }
  }

  async function handleSimulateReply() {
    if (!selectedId) return;
    await fetch(`/api/communication/whatsapp/conversations/${selectedId}/simulate-reply`, { method: 'POST' });
    await loadMessages(selectedId);
  }

  const selected = conversations.find((c) => c.id === selectedId) ?? null;

  return (
    <div className="wa-inbox">
      <aside className="wa-inbox__list" aria-label="Conversations">
        <div className="wa-inbox__list-head">
          <strong>Conversations</strong>
          <button type="button" className="dr-refresh" onClick={loadConversations} aria-label="Refresh conversations">
            <RefreshCw size={13} />
          </button>
        </div>
        {conversations.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`wa-inbox__convo${selectedId === c.id ? ' wa-inbox__convo--active' : ''}`}
            onClick={() => setSelectedId(c.id)}
          >
            <span className="wa-inbox__avatar">{initials(c.memberName)}</span>
            <span className="wa-inbox__convo-copy">
              <strong>{c.memberName}</strong>
              <span>{c.lastMessage}</span>
            </span>
            <span className="wa-inbox__convo-meta">
              <span className="wa-inbox__convo-time">{relTime(c.lastMessageAt)}</span>
              {c.unreadCount > 0 && <span className="wa-inbox__unread-badge">{c.unreadCount}</span>}
            </span>
          </button>
        ))}
      </aside>

      <section className="wa-inbox__thread">
        {!selected ? (
          <div className="wa-inbox__empty">Select a conversation to view the thread.</div>
        ) : (
          <>
            <header className="wa-inbox__thread-head">
              <span className="wa-inbox__avatar">{initials(selected.memberName)}</span>
              <div>
                <strong>{selected.memberName}</strong>
                <span>{selected.memberPhone}</span>
              </div>
              <button type="button" className="sa-btn sa-btn--secondary sa-btn--sm" onClick={handleSimulateReply}>
                <MessageCircleReply size={12} aria-hidden="true" /> Simulate reply
              </button>
            </header>

            <div className="wa-inbox__messages">
              {messages.map((m) => (
                <div key={m.id} className={`wa-inbox__bubble-row wa-inbox__bubble-row--${m.sender}`}>
                  <div className={`wa-inbox__bubble wa-inbox__bubble--${m.sender}`}>
                    {m.text}
                    <span className="wa-inbox__bubble-time">
                      {new Date(m.sentAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="wa-inbox__typing">
                  <span className="wa-inbox__typing-dot" /><span className="wa-inbox__typing-dot" /><span className="wa-inbox__typing-dot" />
                  You&apos;re typing…
                </div>
              )}
              <div ref={threadEndRef} />
            </div>

            <div className="wa-inbox__composer">
              <div className="wa-inbox__emoji-wrap">
                <button type="button" className="wa-inbox__icon-btn" onClick={() => setShowEmoji((s) => !s)} aria-label="Insert emoji">
                  <Smile size={17} aria-hidden="true" />
                </button>
                {showEmoji && (
                  <div className="wa-inbox__emoji-picker" role="dialog" aria-label="Emoji picker">
                    {EMOJIS.map((e) => (
                      <button key={e} type="button" onClick={() => insertEmoji(e)}>{e}</button>
                    ))}
                  </div>
                )}
              </div>
              <textarea
                value={draft}
                onChange={(e) => handleDraftChange(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void handleSend(); } }}
                placeholder="Type a reply…"
                rows={1}
              />
              <button type="button" className="wa-inbox__send-btn" onClick={handleSend} disabled={sending || !draft.trim()} aria-label="Send reply">
                <Send size={16} aria-hidden="true" />
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

export default WhatsAppInbox;
