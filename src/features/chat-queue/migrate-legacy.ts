import type { ChatDb, Conversation } from './db';
import { LEGACY_MAP_KEY, setHasStoredConversation } from './flags';
import { CONVERSATION_TTL_MS } from './policy';

export { LEGACY_MAP_KEY };
export const LEGACY_DB_NAME = 'portfolio-cache-db';
const LEGACY_STORE = 'hireMe';
const LEGACY_KEY = 'hireMeSession';

type LegacyHireSession = { sid?: string; email?: string; expiresAt?: number };

function readLegacyMap(): Record<string, unknown> {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(LEGACY_MAP_KEY) ?? '{}');
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

/** The old site's hire-me cache, if it exists. Never throws. */
function readLegacyHireSession(): Promise<LegacyHireSession | null> {
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(LEGACY_DB_NAME);
      request.onerror = () => resolve(null);
      request.onsuccess = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(LEGACY_STORE)) {
          db.close();
          resolve(null);
          return;
        }
        const read = db.transaction(LEGACY_STORE, 'readonly').objectStore(LEGACY_STORE).get(LEGACY_KEY);
        read.onsuccess = () => {
          db.close();
          resolve((read.result as LegacyHireSession | undefined) ?? null);
        };
        read.onerror = () => {
          db.close();
          resolve(null);
        };
      };
    } catch {
      resolve(null);
    }
  });
}

function deleteLegacyDb(): Promise<void> {
  return new Promise((resolve) => {
    try {
      const request = indexedDB.deleteDatabase(LEGACY_DB_NAME);
      request.onsuccess = () => resolve();
      request.onerror = () => resolve();
      request.onblocked = () => resolve();
    } catch {
      resolve();
    }
  });
}

function tokenFrom(url: string): string | undefined {
  try {
    const params = new URL(url).searchParams;
    return params.get('token') ?? params.get('guestToken') ?? params.get('chatToken') ?? undefined;
  } catch {
    return undefined;
  }
}

/**
 * Move chats started on the old site into the new store, so returning visitors land back in their conversation.
 * Runs once: the old data is removed afterwards. Returns how many conversations were moved.
 */
export async function migrateLegacySessions(db: ChatDb, now = Date.now()): Promise<number> {
  const map = readLegacyMap();
  const hire = await readLegacyHireSession();
  let moved = 0;

  for (const [sid, url] of Object.entries(map)) {
    if (typeof url !== 'string' || !/^https?:\/\//.test(url)) continue;
    if (await db.conversations.get(sid)) continue;
    const isHire = hire?.sid === sid;
    const email = isHire && typeof hire?.email === 'string' ? hire.email : '';
    const conversation: Conversation = {
      id: sid,
      service: isHire ? 'hire_me' : 'contact',
      name: email,
      email,
      topic: isHire ? 'job' : 'other',
      message: '',
      createdAt: now,
      expiresAt: isHire && typeof hire?.expiresAt === 'number' ? hire.expiresAt : now + CONVERSATION_TTL_MS,
      status: 'delivered',
      attempts: 0,
      emailCopy: 'off',
      guestUrl: url,
    };
    const token = tokenFrom(url);
    if (token) conversation.token = token;
    await db.conversations.put(conversation);
    moved += 1;
  }

  try {
    localStorage.removeItem(LEGACY_MAP_KEY);
  } catch {
    // ignore
  }
  await deleteLegacyDb();
  if (moved > 0) setHasStoredConversation(true);
  return moved;
}
