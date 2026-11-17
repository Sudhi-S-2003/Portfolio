/**
 * Cheap, synchronous checks that run on every page without loading Dexie.
 * The queue worker is only loaded when one of these says there is something to do.
 */
const PENDING_FLAG = 'chat-queue-pending';
export const LEGACY_MAP_KEY = 'portfolio-service-chat-sessions';

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function isQueuePending(): boolean {
  return read(PENDING_FLAG) === '1';
}

export function hasLegacySessions(): boolean {
  return read(LEGACY_MAP_KEY) !== null;
}

const HAS_CONVERSATION_FLAG = 'chat-has-conversation';

/** This browser holds at least one conversation, so /contact should look for it. */
export function hasStoredConversation(): boolean {
  return read(HAS_CONVERSATION_FLAG) === '1';
}

export function setHasStoredConversation(has: boolean): void {
  try {
    if (has) localStorage.setItem(HAS_CONVERSATION_FLAG, '1');
    else localStorage.removeItem(HAS_CONVERSATION_FLAG);
  } catch {
    // Storage blocked: returning visitors simply start with the form.
  }
}

export function setQueuePending(pending: boolean): void {
  try {
    if (pending) localStorage.setItem(PENDING_FLAG, '1');
    else localStorage.removeItem(PENDING_FLAG);
  } catch {
    // Storage blocked: the worker still runs while the contact page is open.
  }
}
