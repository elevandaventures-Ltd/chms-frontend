/**
 * communication-store.ts — in-memory mock "database" for scheduled
 * messages and the WhatsApp inbox, mirroring lib/superadmin-store.ts.
 *
 * A module-level array (not a fresh copy per request) so that scheduling,
 * canceling, and replying during a dev session are immediately visible
 * across the Scheduled Messages list and the WhatsApp inbox. Resets on
 * server restart — a dev convenience, not persistence.
 */
import {
  mockConversations, mockMessagesByConversation, mockMessageReports,
  type ScheduledMessage, type WhatsAppConversation, type WhatsAppMessage, type MessageReport,
} from '@/lib/communication';

let scheduledMessages: ScheduledMessage[] = [];

export function listScheduledMessages(): ScheduledMessage[] {
  return scheduledMessages;
}

export function createScheduledMessage(msg: Omit<ScheduledMessage, 'id' | 'status' | 'createdAt'>): ScheduledMessage {
  const full: ScheduledMessage = {
    ...msg,
    id: `sch_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    status: 'scheduled',
    createdAt: new Date().toISOString(),
  };
  scheduledMessages = [full, ...scheduledMessages];
  return full;
}

export function cancelScheduledMessage(id: string): ScheduledMessage | undefined {
  const msg = scheduledMessages.find((m) => m.id === id);
  if (!msg || msg.status !== 'scheduled') return undefined;
  msg.status = 'canceled';
  return msg;
}

/** Fire every scheduled message whose sendAtUtc has passed. Returns the ones just sent. */
export function processDueScheduledMessages(): ScheduledMessage[] {
  const now = Date.now();
  const due = scheduledMessages.filter((m) => m.status === 'scheduled' && new Date(m.sendAtUtc).getTime() <= now);
  due.forEach((m) => {
    m.status = 'sent';
    m.sentAt = new Date().toISOString();
  });
  return due;
}

// ── Sent message reports (Day 35 sent-history page) ──────────────────────────

let messageReports: MessageReport[] = [...mockMessageReports];

export function listMessageReports(): MessageReport[] {
  return [...messageReports].sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
}

export function addMessageReport(report: Omit<MessageReport, 'id'>): MessageReport {
  const full: MessageReport = { ...report, id: `rpt_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}` };
  messageReports = [full, ...messageReports];
  return full;
}

// ── WhatsApp inbox ────────────────────────────────────────────────────────────

const conversations: WhatsAppConversation[] = mockConversations.map((c) => ({ ...c }));
const messagesByConversation = new Map<string, WhatsAppMessage[]>(
  Object.entries(mockMessagesByConversation).map(([id, msgs]) => [id, msgs.map((m) => ({ ...m }))]),
);

export function listConversations(): WhatsAppConversation[] {
  return [...conversations].sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
}

export function getConversation(id: string): WhatsAppConversation | undefined {
  return conversations.find((c) => c.id === id);
}

export function getMessages(conversationId: string): WhatsAppMessage[] {
  return messagesByConversation.get(conversationId) ?? [];
}

export function markConversationRead(conversationId: string): void {
  const convo = conversations.find((c) => c.id === conversationId);
  if (convo) convo.unreadCount = 0;
}

export function sendReply(conversationId: string, text: string): WhatsAppMessage | undefined {
  const convo = conversations.find((c) => c.id === conversationId);
  if (!convo) return undefined;

  const message: WhatsAppMessage = {
    id: `wm_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    sender: 'admin',
    text,
    sentAt: new Date().toISOString(),
    status: 'sent',
  };
  const list = messagesByConversation.get(conversationId) ?? [];
  messagesByConversation.set(conversationId, [...list, message]);

  convo.lastMessage = text;
  convo.lastMessageAt = message.sentAt;

  return message;
}

/** Dev aid: simulate an incoming reply "from the member's phone" — there is no
 *  live WhatsApp Business webhook wired up in this project, so the inbox is
 *  otherwise mock-only. Mirrors what a real inbound-webhook handler would do. */
export function simulateIncomingReply(conversationId: string, text: string): WhatsAppMessage | undefined {
  const convo = conversations.find((c) => c.id === conversationId);
  if (!convo) return undefined;

  const message: WhatsAppMessage = {
    id: `wm_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    sender: 'member',
    text,
    sentAt: new Date().toISOString(),
    status: 'delivered',
  };
  const list = messagesByConversation.get(conversationId) ?? [];
  messagesByConversation.set(conversationId, [...list, message]);

  convo.lastMessage = text;
  convo.lastMessageAt = message.sentAt;
  convo.unreadCount += 1;

  return message;
}
