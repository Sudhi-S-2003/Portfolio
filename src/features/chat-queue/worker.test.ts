import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ChatApi } from './api';
import { ChatDb } from './db';
import { enqueueConversation } from './queue';
import { startQueueWorker } from './worker';

let db: ChatDb;
let stop: () => void = () => {};
let count = 0;

beforeEach(() => {
  count += 1;
  db = new ChatDb(`worker-test-${count}`);
});

afterEach(async () => {
  stop();
  await db.delete();
});

describe('startQueueWorker', () => {
  it('sends a message as soon as it is queued', async () => {
    const api: ChatApi = {
      createChat: vi.fn(async () => ({ kind: 'created' as const, guestUrl: 'https://chat.example/g?token=t', token: 't' })),
      sendFirstMessage: vi.fn(async () => 'sent' as const),
      sendEmailCopy: vi.fn(async () => 'sent' as const),
    };
    stop = startQueueWorker({ db, api });
    const conversation = await enqueueConversation(db, {
      service: 'contact',
      name: 'Ravi',
      email: 'ravi@example.com',
      topic: 'other',
      message: 'Hello there',
    });
    await vi.waitFor(async () => expect((await db.conversations.get(conversation.id))?.status).toBe('delivered'));
  });

  it('stops working after it is stopped', async () => {
    const api: ChatApi = { createChat: vi.fn(), sendFirstMessage: vi.fn(), sendEmailCopy: vi.fn() };
    const stopNow = startQueueWorker({ db, api });
    await new Promise((resolve) => setTimeout(resolve, 50)); // let the first (empty) pass finish
    stopNow();
    await enqueueConversation(db, { service: 'contact', name: 'Ravi', email: 'r@example.com', topic: 'other', message: 'Hi' });
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(api.createChat).not.toHaveBeenCalled();
  });
});
