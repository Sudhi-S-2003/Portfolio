import { useEffect, useState } from 'react';
import type { Conversation } from './db';

type State = { conversation: Conversation | undefined; loading: boolean };

/**
 * A conversation from the local store that re-renders whenever the queue updates it.
 * Dexie is loaded on demand, so pages that never show a conversation never download it.
 */
export function useConversation(id: string | null): State {
  const [state, setState] = useState<State>({ conversation: undefined, loading: id !== null });

  useEffect(() => {
    if (!id) {
      setState({ conversation: undefined, loading: false });
      return;
    }
    let cancelled = false;
    let subscription: { unsubscribe(): void } | undefined;
    setState((current) => ({ ...current, loading: true }));
    void Promise.all([import('dexie'), import('./db')])
      .then(([{ liveQuery }, { getDb }]) => {
        if (cancelled) return;
        const db = getDb();
        subscription = liveQuery(() => db.conversations.get(id)).subscribe({
          next: (conversation) => setState({ conversation, loading: false }),
          error: () => setState({ conversation: undefined, loading: false }),
        });
      })
      .catch(() => {
        if (!cancelled) setState({ conversation: undefined, loading: false });
      });
    return () => {
      cancelled = true;
      subscription?.unsubscribe();
    };
  }, [id]);

  return state;
}
