import { httpChatApi } from './api';
import { getDb } from './db';
import { hasLegacySessions } from './flags';
import { migrateLegacySessions } from './migrate-legacy';
import { startQueueWorker } from './worker';

let started = false;

/**
 * Start the queue once per page load: move any old-site sessions over, then keep the outbox moving.
 * Safe to call from anywhere; does nothing if storage is unavailable.
 */
export async function ensureQueueWorker(): Promise<void> {
  if (started) return;
  started = true;
  try {
    const db = getDb();
    if (hasLegacySessions()) await migrateLegacySessions(db).catch(() => 0);
    startQueueWorker({ db, api: httpChatApi });
  } catch {
    started = false;
  }
}
