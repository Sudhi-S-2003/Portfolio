import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { I18nextProvider } from 'react-i18next';
import { StaticRouter } from 'react-router';
import App from './App';
import { getRouteMeta } from './components/layout/routeMeta';
import { SITE } from './data/site';
import { createI18n } from './i18n';
import { PRERENDER_PATHS } from './routes';
import { personJsonLd } from './seo/person';

export { PRERENDER_PATHS };

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Render one path to HTML, in English, with its <head> tags. Used by scripts/prerender.ts at build time. */
export async function render(url: string): Promise<{ html: string; head: string }> {
  const i18n = await createI18n({ lng: 'en', withBackend: false });
  const html = renderToString(
    <StrictMode>
      <I18nextProvider i18n={i18n}>
        <StaticRouter location={url}>
          <App />
        </StaticRouter>
      </I18nextProvider>
    </StrictMode>,
  );

  const meta = getRouteMeta(url, i18n.t);
  const head = [
    `<title>${escapeHtml(meta.title)}</title>`,
    `<meta name="description" content="${escapeHtml(meta.description)}" />`,
    // The not-found page must not be indexed or claim a canonical address of its own.
    meta.indexable ? `<link rel="canonical" href="${meta.canonical}" />` : '<meta name="robots" content="noindex" />',
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${escapeHtml(SITE.name)}" />`,
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
    `<meta property="og:url" content="${meta.canonical}" />`,
    `<meta property="og:image" content="${meta.ogImage}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    // Who the site is about, for search engines. A data block, never run as script, so the CSP doesn't apply to it.
    ...(url === '/' ? [`<script type="application/ld+json">${personJsonLd()}</script>`] : []),
  ].join('\n    ');

  return { html, head };
}
