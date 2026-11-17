import type { ChatApi } from './api';
import type { ChatDb } from './db';
import { ENQUEUED_EVENT, nextDueAt, processDueJobs } from './queue';

const MIN_WAIT_MS = 1_000;

/**
 * Keeps the outbox moving while the visitor is on the site: runs now, again when the next job is due,
 * when a new message is queued, when the connection comes back, and when the tab becomes visible.
 * Returns a function that stops it.
 */
export function startQueueWorker({ db, api }: { db: ChatDb; api: ChatApi }): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let stopped = false;
  let running = false;
  let runAgain = false;

  const schedule = async () => {
    clearTimeout(timer);
    const due = await nextDueAt(db).catch(() => null);
    if (stopped || due === null) return;
    timer = setTimeout(() => void run(), Math.max(MIN_WAIT_MS, due - Date.now()));
  };

  const run = async () => {
    if (stopped) return;
    // A trigger during a run (say, a message queued mid-pass) must not be lost: do one more pass after this one.
    if (running) {
      runAgain = true;
      return;
    }
    running = true;
    try {
      do {
        runAgain = false;
        await processDueJobs(db, api);
      } while (runAgain && !stopped);
    } catch {
      // Storage or network trouble: the next scheduled run tries again.
    } finally {
      running = false;
    }
    await schedule();
  };

  const onTrigger = () => void run();
  const onVisible = () => {
    if (document.visibilityState === 'visible') void run();
  };

  window.addEventListener(ENQUEUED_EVENT, onTrigger);
  window.addEventListener('online', onTrigger);
  document.addEventListener('visibilitychange', onVisible);
  void run();

  return () => {
    stopped = true;
    clearTimeout(timer);
    window.removeEventListener(ENQUEUED_EVENT, onTrigger);
    window.removeEventListener('online', onTrigger);
    document.removeEventListener('visibilitychange', onVisible);
  };
}
