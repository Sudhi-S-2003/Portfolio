import { hasStoredConversation, setHasStoredConversation } from './flags';

/**
 * The newest conversation this browser still holds, or null. Loads Dexie only when the cheap flag says there
 * is something to find, so first-time visitors never download it.
 */
export async function findLatestConversationId(now = Date.now()): Promise<string | null> {
  if (!hasStoredConversation()) return null;
  try {
    const { getDb } = await import('./db');
    const live = await getDb().conversations.where('expiresAt').above(now).toArray();
    const latest = live.sort((a, b) => b.createdAt - a.createdAt)[0];
    if (!latest) setHasStoredConversation(false);
    return latest?.id ?? null;
  } catch {
    return null;
  }
}
