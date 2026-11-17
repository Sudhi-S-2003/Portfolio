import Dexie, { type EntityTable } from 'dexie';

type ChatService = 'hire_me' | 'contact';
export type ContactTopic = 'job' | 'freelance' | 'other';

/**
 * queued    saved in this browser, not sent yet
 * waking    the chat server is starting up; retrying with backoff
 * created   the chat exists; the first message is still on its way
 * delivered the chat exists and has the visitor's message
 * failed    the server refused it (invalid input); nothing will be retried
 */
export type ConversationStatus = 'queued' | 'waking' | 'created' | 'delivered' | 'failed';

export type Conversation = {
  id: string;
  service: ChatService;
  name: string;
  email: string;
  topic: ContactTopic;
  message: string;
  createdAt: number;
  expiresAt: number;
  status: ConversationStatus;
  /** Failed attempts to create the chat so far. */
  attempts: number;
  /** The Netlify Forms email copy: a second route to Sudhi that does not depend on the chat server. */
  emailCopy: 'pending' | 'sent' | 'failed' | 'off';
  guestUrl?: string;
  token?: string;
  lastError?: 'warming' | 'rejected';
};

export type OutboxJob = {
  id?: number;
  conversationId: string;
  kind: 'create-chat' | 'send-first-message' | 'email-copy';
  attempts: number;
  nextAttemptAt: number;
  createdAt: number;
};

/** Thrown when the browser will not let us store anything (no IndexedDB, private mode, blocked storage). */
export class StorageUnavailableError extends Error {
  constructor(cause?: unknown) {
    super('Browser storage is not available', { cause });
    this.name = 'StorageUnavailableError';
  }
}

export class ChatDb extends Dexie {
  conversations!: EntityTable<Conversation, 'id'>;
  outbox!: EntityTable<OutboxJob, 'id'>;

  constructor(name = 'portfolio-chat') {
    super(name);
    this.version(1).stores({
      conversations: 'id, status, expiresAt',
      outbox: '++id, conversationId, nextAttemptAt',
    });
  }
}

let shared: ChatDb | null = null;

/** The site's one chat database. */
export function getDb(): ChatDb {
  if (typeof indexedDB === 'undefined' || indexedDB === null) throw new StorageUnavailableError();
  shared ??= new ChatDb();
  return shared;
}
