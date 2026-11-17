/// <reference types="vitest/config" />
import type { IncomingMessage } from 'node:http';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv, type Plugin } from 'vite';

function readBody(request: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    request.on('data', (chunk: Buffer) => chunks.push(chunk));
    request.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    request.on('error', reject);
  });
}

/**
 * Make `npm run dev` behave like Netlify for the two things the site posts to:
 *   POST /.netlify/functions/chat  runs netlify/functions/chat.ts (reads CHAT_* from .env.local or .env)
 *   POST /  with form-name=contact  stands in for Netlify Forms: logs the message and answers "not available"
 *                                   (or OK with LOCAL_FORMS_ACCEPT=1), because nothing can be emailed locally
 */
function netlifyLocal(): Plugin {
  return {
    name: 'netlify-local',
    apply: 'serve',
    configureServer(server) {
      // CONTEXT=dev mirrors Netlify's local context, so the function accepts http://localhost here and only here.
      Object.assign(process.env, loadEnv(server.config.mode, process.cwd(), ['CHAT_', 'LOCAL_']), { CONTEXT: 'dev' });
      server.middlewares.use(async (request, response, next) => {
        const url = request.url ?? '';
        try {
          if (request.method === 'POST' && url.startsWith('/.netlify/functions/chat')) {
            const body = await readBody(request);
            const module = (await server.ssrLoadModule('/netlify/functions/chat.ts')) as {
              default: (request: Request) => Promise<Response>;
            };
            const headers = new Headers();
            for (const [key, value] of Object.entries(request.headers)) {
              if (typeof value === 'string') headers.set(key, value);
            }
            const reply = await module.default(new Request(`http://localhost${url}`, { method: 'POST', headers, body }));
            response.statusCode = reply.status;
            reply.headers.forEach((value, key) => response.setHeader(key, value));
            response.end(await reply.text());
            return;
          }
          if (request.method === 'POST' && (url === '/' || url.startsWith('/?'))) {
            const form = new URLSearchParams(await readBody(request));
            if (form.get('form-name') === 'contact') {
              // Netlify Forms only exists on the deployed site, so locally nothing can be emailed. By default the
              // stand-in says so (the page then behaves as it would if Netlify Forms were down). Set
              // LOCAL_FORMS_ACCEPT=1 in .env.local to pretend it was accepted and test the "received" path.
              const accept = process.env.LOCAL_FORMS_ACCEPT === '1';
              server.config.logger.warn(
                `[netlify forms, local] NOT emailed (Netlify Forms runs only on the deployed site)` +
                  `${accept ? '; answering OK because LOCAL_FORMS_ACCEPT=1' : ''}. ` +
                  `From ${form.get('name')} <${form.get('email')}>: ${form.get('message')}`,
              );
              response.statusCode = accept ? 200 : 503;
              response.end(accept ? 'ok (simulated)' : 'Netlify Forms is not available locally');
              return;
            }
          }
        } catch (error) {
          server.config.logger.error(`[netlify-local] ${String(error)}`);
          response.statusCode = 500;
          response.end();
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), netlifyLocal()],
  define: { __BUILD_YEAR__: JSON.stringify(new Date().getFullYear()) },
  server: {
    host: true,
    port: 5173,
    // Docker on Windows does not forward file events from the host, so poll there.
    watch: { usePolling: process.env.VITE_POLL === '1' },
  },
  preview: { host: true, port: 4173 },
  build: {
    // Never inline fonts as data: URLs. The Content-Security-Policy allows fonts only from the site itself
    // (font-src 'self'), and the live site showed a tiny JetBrains Mono subset being blocked once Vite inlined it.
    assetsInlineLimit: (filePath) => (/\.(woff2?|ttf|otf)$/.test(filePath) ? false : undefined),
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'netlify/**/*.test.ts', 'scripts/**/*.test.ts'],
    css: false,
  },
});
