/**
 * Fails the build if any page links to an internal path that has no file behind it.
 * Run after scripts/prerender.ts.
 */
import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const DIST = 'dist';
/** Paths handled by redirects in netlify.toml rather than files. */
const REDIRECTED = ['/service/chat', '/projects', '/files/Sudhi-Resume.pdf'];

async function htmlFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) return htmlFiles(path);
      return Promise.resolve(entry.name.endsWith('.html') ? [path] : []);
    }),
  );
  return nested.flat();
}

function resolves(pathname: string): boolean {
  if (REDIRECTED.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) return true;
  const clean = pathname.replace(/\/+$/, '') || '/';
  const candidates =
    clean === '/'
      ? [join(DIST, 'index.html')]
      : [join(DIST, clean), join(DIST, `${clean}.html`), join(DIST, clean, 'index.html')];
  return candidates.some((candidate) => existsSync(candidate));
}

const broken: string[] = [];
for (const file of await htmlFiles(DIST)) {
  const html = await readFile(file, 'utf8');
  for (const match of html.matchAll(/(?:href|src)="(\/[^"#?]*)/g)) {
    const target = match[1] ?? '';
    if (target.startsWith('//')) continue;
    if (!resolves(decodeURI(target))) broken.push(`${relative(DIST, file)} -> ${target}`);
  }
}

if (broken.length > 0) {
  console.error(`Broken internal links (${broken.length}):\n  ${broken.join('\n  ')}`);
  process.exit(1);
}
console.log('internal links: all resolve');
