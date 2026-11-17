import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ChatApi, CreateChatResult } from './api';
import { ChatDb, getDb, StorageUnavailableError } from './db';
import { buildFirstMessage } from './messages';
import {
  CONVERSATION_TTL_MS,
  enqueueConversation,
  MAX_ATTEMPTS_BEFORE_STALLED,
  nextDelay,
  processDueJobs,
  purgeExpired,
  type NewConversation,
} from './queue';

const sample: NewConversation = {
  service: 'hire_me',
  name: 'Asha Menon',
  email: 'asha@example.com',
  topic: 'job',
  message: 'We have a backend role open in Kochi.',
};

let db: ChatDb;
let dbCount = 0;

type FakeApi = ChatApi & {
  createChat: ReturnType<typeof vi.fn>;
  sendFirstMessage: ReturnType<typeof vi.fn>;
  sendEmailCopy: ReturnType<typeof vi.fn>;
};

function apiReturning(
  create: CreateChatResult,
  send: 'sent' | 'warming' = 'sent',
  email: 'sent' | 'failed' = 'sent',
): FakeApi {
  return {
    createChat: vi.fn(async () => create),
    sendFirstMessage: vi.fn(async () => send),
    sendEmailCopy: vi.fn(async () => email),
  };
}

const created: CreateChatResult = { kind: 'created', guestUrl: 'https://chat.example/g?token=t1', token: 't1' };
const warming: CreateChatResult = { kind: 'warming', retryAfterMs: 0 };

async function jobsOfKind(kind: string) {
  return (await db.outbox.toArray()).filter((job) => job.kind === kind);
}

beforeEach(() => {
  dbCount += 1;
  db = new ChatDb(`chat-test-${dbCount}`);
});

afterEach(async () => {
  await db.delete();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('nextDelay', () => {
  it('backs off 5s, 10s, 20s, 30s, 60s, then every 5 minutes', () => {
    expect([1, 2, 3, 4, 5, 6, 12].map(nextDelay)).toEqual([5_000, 10_000, 20_000, 30_000, 60_000, 300_000, 300_000]);
  });
});

describe('enqueueConversation', () => {
  it('saves the conversation as queued with a create-chat job and an email-copy job, both due now', async () => {
    const conversation = await enqueueConversation(db, sample, { now: 1_000 });
    expect(conversation).toMatchObject({ status: 'queued', emailCopy: 'pending' });
    expect(conversation.expiresAt).toBe(1_000 + CONVERSATION_TTL_MS);
    expect(await db.conversations.get(conversation.id)).toMatchObject({ name: 'Asha Menon', status: 'queued' });
    const jobs = await db.outbox.toArray();
    expect(jobs.map((job) => job.kind).sort()).toEqual(['create-chat', 'email-copy']);
    expect(jobs.every((job) => job.nextAttemptAt === 1_000)).toBe(true);
  });

  it('skips the email copy when it is switched off', async () => {
    const conversation = await enqueueConversation(db, sample, { now: 1_000, emailCopy: false });
    expect(conversation.emailCopy).toBe('off');
    expect(await jobsOfKind('email-copy')).toHaveLength(0);
  });

  it('marks the queue as pending so the worker starts on any page', async () => {
    await enqueueConversation(db, sample, { now: 1_000 });
    expect(localStorage.getItem('chat-queue-pending')).toBe('1');
  });

  it('reports blocked storage as StorageUnavailableError', async () => {
    vi.spyOn(db, 'transaction').mockRejectedValue(new Error('The operation is insecure.'));
    await expect(enqueueConversation(db, sample, { now: 1_000 })).rejects.toBeInstanceOf(StorageUnavailableError);
  });
});

describe('getDb', () => {
  it('throws StorageUnavailableError when the browser has no IndexedDB', () => {
    vi.stubGlobal('indexedDB', undefined);
    expect(() => getDb()).toThrow(StorageUnavailableError);
  });
});

describe('processDueJobs: the chat', () => {
  it('reschedules with backoff and shows "waking" while the server sleeps', async () => {
    const { id } = await enqueueConversation(db, sample, { now: 1_000 });
    const api = apiReturning(warming);
    await processDueJobs(db, api, 1_000);
    expect(api.createChat).toHaveBeenCalledTimes(1);
    expect(await db.conversations.get(id)).toMatchObject({ status: 'waking', lastError: 'warming', attempts: 1 });
    expect((await jobsOfKind('create-chat'))[0]).toMatchObject({ attempts: 1, nextAttemptAt: 1_000 + nextDelay(1) });
  });

  it(`keeps trying, more slowly, after ${MAX_ATTEMPTS_BEFORE_STALLED} failed attempts`, async () => {
    const { id } = await enqueueConversation(db, sample, { now: 0 });
    const api = apiReturning(warming);
    let now = 0;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS_BEFORE_STALLED; attempt += 1) {
      await processDueJobs(db, api, now);
      now += nextDelay(attempt);
    }
    expect(await db.conversations.get(id)).toMatchObject({ status: 'waking', attempts: MAX_ATTEMPTS_BEFORE_STALLED });
    const [job] = await jobsOfKind('create-chat');
    expect(job?.attempts).toBe(MAX_ATTEMPTS_BEFORE_STALLED);
    expect(nextDelay(MAX_ATTEMPTS_BEFORE_STALLED + 1)).toBe(300_000);
  });

  it('respects a longer retry hint from the server', async () => {
    await enqueueConversation(db, sample, { now: 1_000 });
    await processDueJobs(db, apiReturning({ kind: 'warming', retryAfterMs: 15_000 }), 1_000);
    expect((await jobsOfKind('create-chat'))[0]?.nextAttemptAt).toBe(16_000);
  });

  it('skips jobs that are not due yet', async () => {
    await enqueueConversation(db, sample, { now: 1_000 });
    await processDueJobs(db, apiReturning(warming), 1_000);
    const api = apiReturning(created);
    await processDueJobs(db, api, 2_000);
    expect(api.createChat).not.toHaveBeenCalled();
  });

  it('creates the chat, then sends the first message, then marks it delivered', async () => {
    const conversation = await enqueueConversation(db, sample, { now: 1_000 });
    const api = apiReturning(created);
    await processDueJobs(db, api, 1_000);
    expect(api.sendFirstMessage).toHaveBeenCalledWith('t1', buildFirstMessage(conversation));
    expect(await db.conversations.get(conversation.id)).toMatchObject({
      status: 'delivered',
      guestUrl: 'https://chat.example/g?token=t1',
      token: 't1',
      emailCopy: 'sent',
    });
    expect(await db.outbox.count()).toBe(0);
    expect(localStorage.getItem('chat-queue-pending')).toBeNull();
  });

  it('keeps the chat when only the first message has to wait', async () => {
    const { id } = await enqueueConversation(db, sample, { now: 1_000, emailCopy: false });
    await processDueJobs(db, apiReturning(created, 'warming'), 1_000);
    expect(await db.conversations.get(id)).toMatchObject({ status: 'created' });
    const jobs = await db.outbox.toArray();
    expect(jobs).toHaveLength(1);
    expect(jobs[0]).toMatchObject({ kind: 'send-first-message', attempts: 1 });
  });

  it('marks the conversation failed when the server rejects it', async () => {
    const { id } = await enqueueConversation(db, sample, { now: 1_000, emailCopy: false });
    await processDueJobs(db, apiReturning({ kind: 'rejected' }), 1_000);
    expect(await db.conversations.get(id)).toMatchObject({ status: 'failed', lastError: 'rejected' });
    expect(await db.outbox.count()).toBe(0);
  });

  it('treats a thrown network error like a sleeping server', async () => {
    const { id } = await enqueueConversation(db, sample, { now: 1_000, emailCopy: false });
    const api: ChatApi = {
      createChat: vi.fn(async () => {
        throw new TypeError('Failed to fetch');
      }),
      sendFirstMessage: vi.fn(),
      sendEmailCopy: vi.fn(),
    };
    await processDueJobs(db, api, 1_000);
    expect(await db.conversations.get(id)).toMatchObject({ status: 'waking' });
  });

  it('never runs two create calls at once, even if asked twice', async () => {
    await enqueueConversation(db, sample, { now: 1_000, emailCopy: false });
    let release: (value: CreateChatResult) => void = () => {};
    const api: ChatApi = {
      createChat: vi.fn(() => new Promise<CreateChatResult>((resolve) => (release = resolve))),
      sendFirstMessage: vi.fn(async () => 'sent' as const),
      sendEmailCopy: vi.fn(async () => 'sent' as const),
    };
    const first = processDueJobs(db, api, 1_000);
    const second = processDueJobs(db, api, 1_000);
    await vi.waitFor(() => expect(api.createChat).toHaveBeenCalled());
    release(created);
    await Promise.all([first, second]);
    expect(api.createChat).toHaveBeenCalledTimes(1);
  });
});

describe('processDueJobs: the email copy', () => {
  it('sends the email copy before trying the (often slow or down) chat server', async () => {
    await enqueueConversation(db, sample, { now: 1_000 });
    const order: string[] = [];
    const api: ChatApi = {
      createChat: vi.fn(async () => {
        order.push('chat');
        return warming;
      }),
      sendFirstMessage: vi.fn(),
      sendEmailCopy: vi.fn(async () => {
        order.push('email');
        return 'sent' as const;
      }),
    };
    await processDueJobs(db, api, 1_000);
    expect(order).toEqual(['email', 'chat']);
  });

  it('marks the copy sent even while the chat server sleeps', async () => {
    const { id } = await enqueueConversation(db, sample, { now: 1_000 });
    const api = apiReturning(warming);
    await processDueJobs(db, api, 1_000);
    expect(api.sendEmailCopy).toHaveBeenCalledTimes(1);
    expect(await db.conversations.get(id)).toMatchObject({ status: 'waking', emailCopy: 'sent' });
    expect(await jobsOfKind('email-copy')).toHaveLength(0);
  });

  it(`gives up on the copy after ${MAX_ATTEMPTS_BEFORE_STALLED} failures and says so`, async () => {
    const { id } = await enqueueConversation(db, sample, { now: 0 });
    const api = apiReturning(warming, 'sent', 'failed');
    let now = 0;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS_BEFORE_STALLED; attempt += 1) {
      await processDueJobs(db, api, now);
      now += nextDelay(attempt);
    }
    expect(api.sendEmailCopy).toHaveBeenCalledTimes(MAX_ATTEMPTS_BEFORE_STALLED);
    expect(await db.conversations.get(id)).toMatchObject({ emailCopy: 'failed' });
    expect(await jobsOfKind('email-copy')).toHaveLength(0);
    expect(await jobsOfKind('create-chat')).toHaveLength(1); // the chat keeps trying
  });
});

describe('processDueJobs: offline and expiry', () => {
  it('does not count tries while the visitor is offline, so the email copy is never given up for that', async () => {
    const { id } = await enqueueConversation(db, sample, { now: 0, emailCopy: true });
    const api: ChatApi = {
      createChat: vi.fn(async () => warming),
      sendFirstMessage: vi.fn(),
      sendEmailCopy: vi.fn(async () => 'offline' as const),
    };
    let now = 0;
    for (let round = 0; round < 10; round += 1) {
      await processDueJobs(db, api, now);
      now += 60_000;
    }
    expect(await db.conversations.get(id)).toMatchObject({ emailCopy: 'pending' });
    const [copy] = await jobsOfKind('email-copy');
    expect(copy?.attempts).toBe(0);
  });

  it('keeps a conversation for five days from when it reached Sudhi, as the form promises', async () => {
    const { id } = await enqueueConversation(db, sample, { now: 0 });
    await processDueJobs(db, apiReturning(warming), 3 * 24 * 60 * 60 * 1000); // copy lands on day 3
    expect((await db.conversations.get(id))?.expiresAt).toBe(3 * 24 * 60 * 60 * 1000 + CONVERSATION_TTL_MS);
  });
});

describe('purgeExpired', () => {
  it('deletes conversations older than five days and their jobs', async () => {
    const old = await enqueueConversation(db, sample, { now: 1_000, emailCopy: false });
    const fresh = await enqueueConversation(db, sample, { now: 1_000 + CONVERSATION_TTL_MS, emailCopy: false });
    await purgeExpired(db, 1_001 + CONVERSATION_TTL_MS);
    expect(await db.conversations.get(old.id)).toBeUndefined();
    expect(await db.conversations.get(fresh.id)).toBeDefined();
    expect((await db.outbox.toArray()).map((job) => job.conversationId)).toEqual([fresh.id]);
  });
});

describe('buildFirstMessage', () => {
  const base = { id: 'x', createdAt: 0, expiresAt: 0, status: 'queued' as const, attempts: 0, emailCopy: 'off' as const };

  it('formats a hire-me request the way Sudhi reads it', () => {
    expect(buildFirstMessage({ ...sample, ...base })).toBe(
      [
        'Hire Me Request',
        'From: Asha Menon',
        'Email: asha@example.com',
        'Topic: Job opportunity',
        'Context: We have a backend role open in Kochi.',
      ].join('\n'),
    );
  });

  it('formats a contact request', () => {
    expect(buildFirstMessage({ ...sample, ...base, service: 'contact', topic: 'freelance' })).toBe(
      [
        'New Contact Request',
        'Name: Asha Menon',
        'Email: asha@example.com',
        'Subject: Freelance project',
        'Message:',
        'We have a backend role open in Kochi.',
      ].join('\n'),
    );
  });
});
