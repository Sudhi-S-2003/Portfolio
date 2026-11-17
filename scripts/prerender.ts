/**
 * After `vite build` (client) and `vite build --ssr` (server entry), write real HTML for every page:
 *   /            -> dist/index.html
 *   /work        -> dist/work.html          (served as /work by Netlify's pretty URLs, no trailing-slash redirect)
 *   /work/apiforge -> dist/work/apiforge.html
 *   /404         -> dist/404.html           (Netlify serves it for any unknown path)
 * Also writes dist/app.html, an empty shell for client-only routes (/service/chat), and dist/_headers
 * with a Content-Security-Policy that allows exactly the one inline script in index.html.
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { versionOgImages } from './og-version';

const DIST = 'dist';
const DEFAULT_CHAT_FRONTEND = 'https://nutrify-frontend.onrender.com';

type ServerEntry = {
  render: (url: string) => Promise<{ html: string; head: string }>;
  PRERENDER_PATHS: string[];
};

function outputFile(path: string): string {
  if (path === '/') return join(DIST, 'index.html');
  if (path === '/404') return join(DIST, '404.html');
  return join(DIST, `${path.replace(/^\//, '')}.html`);
}

function inlineScriptHashes(html: string): string[] {
  return [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(
    (match) => `'sha256-${createHash('sha256').update(match[1] ?? '').digest('base64')}'`,
  );
}

function headersFile(scriptHashes: string[]): string {
  const chatOrigin = new URL(process.env.CHAT_FRONTEND_BASE || DEFAULT_CHAT_FRONTEND).origin;
  const csp = [
    "default-src 'self'",
    `script-src 'self' ${scriptHashes.join(' ')}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    `frame-src ${chatOrigin}`,
    "form-action 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
  ].join('; ');
  return [
    '/*',
    `  Content-Security-Policy: ${csp}`,
    '  X-Content-Type-Options: nosniff',
    '  Referrer-Policy: strict-origin-when-cross-origin',
    '  Permissions-Policy: camera=(), microphone=(), geolocation=()',
    '/assets/*',
    '  Cache-Control: public, max-age=31536000, immutable',
    '/locales/*',
    '  Cache-Control: public, max-age=3600, must-revalidate',
    '',
  ].join('\n');
}

const template = await readFile(join(DIST, 'index.html'), 'utf8');
if (!template.includes('<!--app-html-->') || !template.includes('<!--app-head-->')) {
  throw new Error('dist/index.html is missing the <!--app-head--> or <!--app-html--> marker');
}

const entry = (await import(pathToFileURL(join(process.cwd(), 'dist-ssr', 'entry-server.js')).href)) as ServerEntry;

// Client-only routes get the bare shell: no pre-rendered markup, so the app renders straight into it.
await writeFile(join(DIST, 'app.html'), template.replace('<!--app-head-->', '').replace('<!--app-html-->', ''));

for (const path of entry.PRERENDER_PATHS) {
  const { html, head } = await entry.render(path);
  const file = outputFile(path);
  await mkdir(dirname(file), { recursive: true });
  // Record which path this HTML was rendered for: the browser only hydrates when the address matches, so a host
  // that serves the wrong file for an address (an SPA fallback, a missing redirect) can never cause a mismatch.
  const page = template
    .replace('<!--app-head-->', head)
    .replace('<div id="root"><!--app-html--></div>', `<div id="root" data-path="${path}">${html}</div>`);
  if (!page.includes(`data-path="${path}"`)) throw new Error('index.html is missing <div id="root"><!--app-html--></div>');
  // Preview images get a content hash in their URL, so sites that cache them (LinkedIn) pick up a re-rendered image.
  await writeFile(file, versionOgImages(page, (pathname) => readFileSync(join(DIST, pathname))));
  console.log(`prerendered ${path.padEnd(32)} -> ${file}`);
}

await writeFile(join(DIST, '_headers'), headersFile(inlineScriptHashes(template)));
console.log('wrote dist/_headers');

// A sitemap of every real page, for search engines (robots.txt points at it).
const SITE_URL = 'https://sudhis.netlify.app';
const urls = entry.PRERENDER_PATHS.filter((path) => path !== '/404').map(
  (path) => `  <url><loc>${SITE_URL}${path}</loc></url>`,
);
const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls,
  '</urlset>',
  '',
].join('\n');
await writeFile(join(DIST, 'sitemap.xml'), sitemap);
console.log('wrote dist/sitemap.xml');
