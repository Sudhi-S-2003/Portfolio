import type { ChatApi, CreateChatResult } from './api';
import { StorageUnavailableError, type ChatDb, type Conversation, type OutboxJob } from './db';
import { setHasStoredConversation, setQueuePending } from './flags';
import { buildFirstMessage } from './messages';
import { CONVERSATION_TTL_MS, MAX_ATTEMPTS_BEFORE_STALLED, nextDelay, OFFLINE_RETRY_MS } from './policy';

export { CONVERSATION_TTL_MS, MAX_ATTEMPTS_BEFORE_STALLED, nextDelay } from './policy';

export const ENQUEUED_EVENT = 'chat-queue:enqueued';

export type NewConversation = Pick<Conversation, 'service' | 'name' | 'email' | 'topic' | 'message'>;

function newId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `c-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

type EnqueueOptions = { now?: number; emailCopy?: boolean };

/** Save first, send later: the visitor sees their message immediately, whatever the network is doing. */
export async function enqueueConversation(
  db: ChatDb,
  input: NewConversation,
  { now = Date.now(), emailCopy = true }: EnqueueOptions = {},
): Promise<Conversation> {
  const conversation: Conversation = {
    ...input,
    id: newId(),
    createdAt: now,
    expiresAt: now + CONVERSATION_TTL_MS,
    status: 'queued',
    attempts: 0,
    emailCopy: emailCopy ? 'pending' : 'off',
  };
  const job = (kind: OutboxJob['kind']): OutboxJob => ({
    conversationId: conversation.id,
    kind,
    attempts: 0,
    nextAttemptAt: now,
    createdAt: now,
  });
  try {
    await db.transaction('rw', db.conversations, db.outbox, async () => {
      await db.conversations.add(conversation);
      await db.outbox.add(job('create-chat'));
      if (emailCopy) await db.outbox.add(job('email-copy'));
    });
  } catch (error) {
    throw new StorageUnavailableError(error);
  }
  setQueuePending(true);
  setHasStoredConversation(true);
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(ENQUEUED_EVENT));
  return conversation;
}

/** Forget conversations older than five days, as the old site did. */
export async function purgeExpired(db: ChatDb, now = Date.now()): Promise<void> {
  const expired = await db.conversations.where('expiresAt').below(now).primaryKeys();
  if (expired.length === 0) return;
  await db.transaction('rw', db.conversations, db.outbox, async () => {
    await db.outbox.where('conversationId').anyOf(expired).delete();
    await db.conversations.bulkDelete(expired);
  });
}

async function reschedule(db: ChatDb, job: OutboxJob, now: number, retryAfterMs = 0): Promise<number> {
  const attempts = job.attempts + 1;
  await db.outbox.update(job.id!, { attempts, nextAttemptAt: now + Math.max(nextDelay(attempts), retryAfterMs) });
  return attempts;
}

async function runCreateChat(db: ChatDb, api: ChatApi, job: OutboxJob, conversation: Conversation, now: number) {
  let result: CreateChatResult;
  try {
    result = await api.createChat(conversation);
  } catch {
    result = { kind: 'warming', retryAfterMs: 0 };
  }

  if (result.kind === 'created') {
    const { guestUrl, token } = result;
    await db.transaction('rw', db.conversations, db.outbox, async () => {
      await db.conversations.update(conversation.id, { status: 'created', guestUrl, token, lastError: undefined });
      await db.outbox.delete(job.id!);
      await db.outbox.add({
        conversationId: conversation.id,
        kind: 'send-first-message',
        attempts: 0,
        nextAttemptAt: now,
        createdAt: now,
      });
    });
  } else if (result.kind === 'rejected') {
    await db.transaction('rw', db.conversations, db.outbox, async () => {
      await db.conversations.update(conversation.id, { status: 'failed', lastError: 'rejected' });
      await db.outbox.delete(job.id!);
    });
  } else {
    const attempts = await reschedule(db, job, now, result.retryAfterMs);
    await db.conversations.update(conversation.id, { status: 'waking', lastError: 'warming', attempts });
  }
}

async function runSendFirstMessage(db: ChatDb, api: ChatApi, job: OutboxJob, conversation: Conversation, now: number) {
  if (!conversation.token) {
    await db.outbox.delete(job.id!);
    return;
  }
  let result: 'sent' | 'warming';
  try {
    result = await api.sendFirstMessage(conversation.token, buildFirstMessage(conversation));
  } catch {
    result = 'warming';
  }
  if (result === 'sent') {
    await db.transaction('rw', db.conversations, db.outbox, async () => {
      await db.conversations.update(conversation.id, { status: 'delivered', lastError: undefined, expiresAt: now + CONVERSATION_TTL_MS });
      await db.outbox.delete(job.id!);
    });
  } else {
    await reschedule(db, job, now);
  }
}

async function runEmailCopy(db: ChatDb, api: ChatApi, job: OutboxJob, conversation: Conversation, now: number) {
  let result: 'sent' | 'failed' | 'offline';
  try {
    result = await api.sendEmailCopy(conversation);
  } catch {
    result = 'offline';
  }
  if (result === 'offline') {
    await db.outbox.update(job.id!, { nextAttemptAt: now + OFFLINE_RETRY_MS });
    return;
  }
  if (result === 'sent') {
    await db.transaction('rw', db.conversations, db.outbox, async () => {
      await db.conversations.update(conversation.id, { emailCopy: 'sent', expiresAt: now + CONVERSATION_TTL_MS });
      await db.outbox.delete(job.id!);
    });
    return;
  }
  if (job.attempts + 1 >= MAX_ATTEMPTS_BEFORE_STALLED) {
    await db.transaction('rw', db.conversations, db.outbox, async () => {
      await db.conversations.update(conversation.id, { emailCopy: 'failed' });
      await db.outbox.delete(job.id!);
    });
    return;
  }
  await reschedule(db, job, now);
}

async function runJob(db: ChatDb, api: ChatApi, job: OutboxJob, now: number) {
  const conversation = await db.conversations.get(job.conversationId);
  if (!conversation) {
    await db.outbox.delete(job.id!);
    return;
  }
  if (job.kind === 'create-chat') await runCreateChat(db, api, job, conversation, now);
  else if (job.kind === 'send-first-message') await runSendFirstMessage(db, api, job, conversation, now);
  else await runEmailCopy(db, api, job, conversation, now);
}

let runningInThisTab = false;

/**
 * Only one queue run at a time, across tabs where the browser supports Web Locks.
 * A second request while one is running is skipped, not queued: the running one will pick the jobs up.
 */
async function exclusively(task: () => Promise<void>): Promise<void> {
  if (runningInThisTab) return;
  runningInThisTab = true;
  try {
    const locks = typeof navigator !== 'undefined' ? navigator.locks : undefined;
    if (locks) {
      await locks.request('portfolio-chat-queue', { ifAvailable: true }, async (lock) => {
        if (lock) await task();
      });
    } else {
      await task();
    }
  } finally {
    runningInThisTab = false;
  }
}

/** Run every job that is due, oldest first. A created chat's first message is sent in the same run. */
export async function processDueJobs(db: ChatDb, api: ChatApi, now = Date.now()): Promise<void> {
  await exclusively(async () => {
    await purgeExpired(db, now);
    // A successful create adds a send job that is due at once, so look again (bounded) after each pass.
    for (let pass = 0; pass < 4; pass += 1) {
      const due = await db.outbox.where('nextAttemptAt').belowOrEqual(now).sortBy('createdAt');
      if (due.length === 0) break;
      // The chat server is often asleep and a create call can take seconds, so the email copy (which does not
      // depend on it) always goes first: even a visitor who closes the tab at once has their message delivered.
      due.sort((a, b) => Number(a.kind !== 'email-copy') - Number(b.kind !== 'email-copy'));
      for (const job of due) await runJob(db, api, job, now);
    }
    setQueuePending((await db.outbox.count()) > 0);
  });
}

/** When the next job is due, or null if the outbox is empty. */
export async function nextDueAt(db: ChatDb): Promise<number | null> {
  const first = await db.outbox.orderBy('nextAttemptAt').first();
  return first?.nextAttemptAt ?? null;
}
