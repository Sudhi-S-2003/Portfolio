import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';
import { afterEach } from 'vitest';

const isBrowserLike = typeof window !== 'undefined' && typeof Element !== 'undefined';

if (isBrowserLike) {
  // jsdom lacks a few browser APIs that Radix UI menus and dialogs call.
  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = () => false;
    Element.prototype.releasePointerCapture = () => {};
    Element.prototype.setPointerCapture = () => {};
  }
  if (!Element.prototype.scrollIntoView) Element.prototype.scrollIntoView = () => {};
  window.scrollTo = () => {};
  if (!('ResizeObserver' in globalThis)) {
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }

  const { cleanup } = await import('@testing-library/react');
  afterEach(() => {
    cleanup();
    localStorage.clear();
  });
}
