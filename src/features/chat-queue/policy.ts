import type { Conversation } from './db';

/**
 * Retry and retention rules for contact messages. Kept apart from the Dexie code so pages can use them
 * without loading the database library.
 */
const RETRY_DELAYS_MS = [5_000, 10_000, 20_000, 30_000, 60_000] as const;
/** After the quick retries, try every five minutes until the conversation expires. */
const SLOW_RETRY_DELAY_MS = 300_000;
/** While the visitor is offline nothing is counted as a failure; just look again shortly. */
export const OFFLINE_RETRY_MS = 30_000;
/**
 * After this many real failures (about two minutes) the visitor is told plainly what got through and how else to
 * reach Sudhi. The chat keeps retrying slowly; the email copy stops (Netlify Forms failing that long is not transient).
 */
export const MAX_ATTEMPTS_BEFORE_STALLED = RETRY_DELAYS_MS.length;
/** Messages are kept for five days from the moment they reach Sudhi (or from sending, if they never do). */
export const CONVERSATION_TTL_MS = 5 * 24 * 60 * 60 * 1000;

/** Wait before retry number `attempts` (1-based): 5 s, 10 s, 20 s, 30 s, 60 s, then every five minutes. */
export function nextDelay(attempts: number): number {
  return RETRY_DELAYS_MS[attempts - 1] ?? SLOW_RETRY_DELAY_MS;
}

/** True once the chat has failed often enough that the visitor should be told about other ways through. */
export function isStalled(conversation: Pick<Conversation, 'status' | 'attempts'>): boolean {
  return conversation.status === 'waking' && conversation.attempts >= MAX_ATTEMPTS_BEFORE_STALLED;
}
