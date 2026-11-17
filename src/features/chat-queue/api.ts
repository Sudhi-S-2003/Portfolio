import type { Conversation } from './db';
import { buildSubject } from './messages';

export type CreateChatResult =
  | { kind: 'created'; guestUrl: string; token: string }
  | { kind: 'warming'; retryAfterMs: number }
  | { kind: 'rejected' };

/** 'offline' means the request never reached a server; it is retried without counting as a failure. */
export type EmailCopyResult = 'sent' | 'failed' | 'offline';

/** What the queue needs from the outside world. The real one is httpChatApi; tests pass fakes. */
export type ChatApi = {
  createChat(conversation: Conversation): Promise<CreateChatResult>;
  sendFirstMessage(token: string, text: string): Promise<'sent' | 'warming'>;
  sendEmailCopy(conversation: Conversation): Promise<EmailCopyResult>;
};

const ENDPOINT = '/.netlify/functions/chat';
/** The function itself gives up on the chat server after about 9 s; never hold the queue longer than this. */
const REQUEST_TIMEOUT_MS = 15_000;

function timeoutSignal(): AbortSignal | undefined {
  return typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function'
    ? AbortSignal.timeout(REQUEST_TIMEOUT_MS)
    : undefined;
}

function isOffline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine === false;
}

type FunctionReply = { status?: string; guestUrl?: string; token?: string; retryAfterMs?: number };

async function post(body: Record<string, unknown>): Promise<{ status: number; reply: FunctionReply } | null> {
  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: timeoutSignal(),
    });
    const reply = (await response.json().catch(() => ({}))) as FunctionReply;
    return { status: response.status, reply };
  } catch {
    return null; // offline, timed out or the function is unreachable: try again later
  }
}

export type EmailCopyFields = Pick<Conversation, 'name' | 'email' | 'topic' | 'message'>;

/**
 * Post a message to Netlify Forms (form "contact", declared in index.html). Netlify keeps every submission in the
 * site dashboard and emails a notification, so it reaches Sudhi even if the chat server is down. `keepalive` lets
 * the request finish even if the visitor closes the tab straight after sending.
 */
export async function postEmailCopy(fields: EmailCopyFields): Promise<EmailCopyResult> {
  if (isOffline()) return 'offline';
  try {
    const response = await fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        'form-name': 'contact',
        name: fields.name,
        email: fields.email,
        topic: fields.topic,
        message: fields.message,
      }).toString(),
      keepalive: true,
      signal: timeoutSignal(),
    });
    return response.ok ? 'sent' : 'failed';
  } catch {
    return 'offline';
  }
}

export const httpChatApi: ChatApi = {
  async createChat(conversation) {
    const result = await post({
      action: 'create',
      service: conversation.service,
      name: conversation.name,
      email: conversation.email,
      subject: buildSubject(conversation),
      message: conversation.message,
    });
    if (result?.status === 200 && result.reply.status === 'created' && result.reply.guestUrl && result.reply.token) {
      return { kind: 'created', guestUrl: result.reply.guestUrl, token: result.reply.token };
    }
    if (result?.status === 400) return { kind: 'rejected' };
    return { kind: 'warming', retryAfterMs: result?.reply.retryAfterMs ?? 0 };
  },

  async sendFirstMessage(token, text) {
    const result = await post({ action: 'message', token, text });
    return result?.status === 200 && result.reply.status === 'sent' ? 'sent' : 'warming';
  },

  sendEmailCopy(conversation) {
    return postEmailCopy(conversation);
  },
};
