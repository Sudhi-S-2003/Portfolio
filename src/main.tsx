import './design/global.css';
import type { i18n as I18n } from 'i18next';
import { StrictMode, useEffect } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import { BrowserRouter } from 'react-router';
import App from './App';
import { hasLegacySessions, isQueuePending } from './features/chat-queue/flags';
import { createI18n, detectedLanguage, syncDocumentLanguage } from './i18n';

const container = document.getElementById('root');
if (!container) throw new Error('Missing #root element');

/**
 * Pre-rendered pages are English. Switch to the visitor's language from an effect, which runs only after React
 * has finished hydrating, so a fast (cached) language file can never change the text mid-hydration.
 */
function SwitchToVisitorLanguage({ i18n }: { i18n: I18n }) {
  useEffect(() => {
    const language = detectedLanguage(i18n);
    if (language !== 'en' && i18n.resolvedLanguage !== language) void i18n.changeLanguage(language);
  }, [i18n]);
  return null;
}

// Hydrate pre-rendered HTML in English so the first render matches it exactly. Only when it was rendered for this
// address: if a host served another page's HTML here (an SPA fallback, say), render fresh instead. Pages without
// pre-rendered HTML (client-only routes) start in the visitor's language directly.
const withoutTrailingSlash = (path: string) => path.replace(/\/+$/, '') || '/';
const renderedFor = container.dataset.path;
const prerendered =
  container.firstElementChild !== null &&
  renderedFor !== undefined &&
  withoutTrailingSlash(renderedFor) === withoutTrailingSlash(window.location.pathname);
if (container.firstElementChild && !prerendered) container.replaceChildren();
const i18n = await createI18n({ withBackend: true, ...(prerendered ? { lng: 'en' as const } : {}) });
syncDocumentLanguage(i18n);

const app = (
  <StrictMode>
    <I18nextProvider i18n={i18n}>
      <BrowserRouter>
        <App />
        {prerendered ? <SwitchToVisitorLanguage i18n={i18n} /> : null}
      </BrowserRouter>
    </I18nextProvider>
  </StrictMode>
);

if (prerendered) hydrateRoot(container, app);
else createRoot(container).render(app);

// Keep unsent contact messages moving on every page, loading the queue code only when there is something to do.
if (isQueuePending() || hasLegacySessions()) {
  void import('./features/chat-queue/boot').then(({ ensureQueueWorker }) => ensureQueueWorker());
}
