import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/**
 * False while React hydrates pre-rendered HTML and during server rendering, true afterwards.
 * Use it for anything that depends on the URL's query string or the browser, so the first client render
 * matches the static HTML exactly.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
