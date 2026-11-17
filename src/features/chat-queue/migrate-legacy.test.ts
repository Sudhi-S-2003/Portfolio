import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ChatDb } from './db';
import { LEGACY_DB_NAME, LEGACY_MAP_KEY, migrateLegacySessions } from './migrate-legacy';

let db: ChatDb;
let count = 0;

/** Recreate what the old site stored: the iframe map in localStorage and the hire-me cache in IndexedDB. */
function seedLegacyIndexedDb(value: unknown): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(LEGACY_DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore('hireMe');
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const tx = request.result.transaction('hireMe', 'readwrite');
      tx.objectStore('hireMe').put(value, 'hireMeSession');
      tx.oncomplete = () => {
        request.result.close();
        resolve();
      };
    };
  });
}

function legacyDbHasStore(): Promise<boolean> {
  return new Promise((resolve) => {
    const request = indexedDB.open(LEGACY_DB_NAME);
    request.onsuccess = () => {
      const has = request.result.objectStoreNames.contains('hireMe');
      request.result.close();
      indexedDB.deleteDatabase(LEGACY_DB_NAME);
      resolve(has);
    };
  });
}

beforeEach(() => {
  count += 1;
  db = new ChatDb(`migrate-test-${count}`);
});

afterEach(async () => {
  await db.delete();
});

describe('migrateLegacySessions', () => {
  it('moves old chat sessions into the new store and removes the old data', async () => {
    const now = 10_000;
    localStorage.setItem(
      LEGACY_MAP_KEY,
      JSON.stringify({ sid1: 'https://nutrify-frontend.onrender.com/guest?token=abc', sid2: 'about:blank' }),
    );
    await seedLegacyIndexedDb({ sid: 'sid1', email: 'asha@example.com', expiresAt: now + 5_000 });

    expect(await migrateLegacySessions(db, now)).toBe(1);

    expect(await db.conversations.get('sid1')).toMatchObject({
      status: 'delivered',
      service: 'hire_me',
      email: 'asha@example.com',
      guestUrl: 'https://nutrify-frontend.onrender.com/guest?token=abc',
      token: 'abc',
      expiresAt: now + 5_000,
    });
    expect(await db.conversations.get('sid2')).toBeUndefined();
    expect(localStorage.getItem(LEGACY_MAP_KEY)).toBeNull();
    expect(await legacyDbHasStore()).toBe(false);
  });

  it('does nothing the second time', async () => {
    localStorage.setItem(LEGACY_MAP_KEY, JSON.stringify({ sid1: 'https://chat.example/g?token=abc' }));
    expect(await migrateLegacySessions(db, 1)).toBe(1);
    expect(await migrateLegacySessions(db, 2)).toBe(0);
  });

  it('survives corrupt old data', async () => {
    localStorage.setItem(LEGACY_MAP_KEY, '{not json');
    expect(await migrateLegacySessions(db, 1)).toBe(0);
    expect(localStorage.getItem(LEGACY_MAP_KEY)).toBeNull();
  });
});
