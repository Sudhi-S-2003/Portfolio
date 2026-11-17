/**
 * The only place that knows the chat API secret. The browser's queue calls this; this calls the chat backend.
 *
 *   POST { action: 'create', service, name, email, subject, message }
 *     200 { status: 'created', guestUrl, token }
 *     503 { status: 'warming', retryAfterMs }   backend asleep or failing: nothing was created, try later
 *   POST { action: 'message', token, text }
 *     200 { status: 'sent' }  |  503 { status: 'warming', retryAfterMs }
 *   400 { status: 'invalid', field }   403 foreign origin   405 not POST   500 { status: 'misconfigured' }
 *
 * Netlify stops synchronous functions after 10 s, so every upstream call has a short timeout. A sleeping
 * backend (Render's free tier) is woken by the first check and answered with 503; the queue retries.
 */

const WAKE_TIMEOUT_MS = 4_000;
const UPSTREAM_TIMEOUT_MS = 5_000;
const WARMING_RETRY_MS = 15_000;
const FAILING_RETRY_MS = 60_000;
const SERVICES = new Set(['hire_me', 'contact']);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Config = { base: string; key: string; secret: string; frontend: string };

function readConfig(): Config | null {
  const base = process.env.CHAT_API_BASE?.trim().replace(/\/+$/, '');
  const key = process.env.CHAT_API_KEY?.trim();
  const secret = process.env.CHAT_API_SECRET?.trim();
  const frontend = process.env.CHAT_FRONTEND_BASE?.trim();
  if (!base || !key || !secret || !frontend) return null;
  return { base, key, secret, frontend };
}

function reply(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

const warming = (retryAfterMs: number) => reply(503, { status: 'warming', retryAfterMs });
const invalid = (field: string) => reply(400, { status: 'invalid', field });

/**
 * Accept only requests made by the site itself in a browser: its own origin, its Netlify deploy URLs, and
 * localhost during local development. A same-origin request without an Origin header must carry the browser's
 * Sec-Fetch-Site marker. This stops other websites and casual scripts; it is not a rate limit (anyone can forge
 * headers), so real rate limiting belongs on the chat backend or in Netlify's function settings.
 */
function isAllowedRequest(headers: Headers): boolean {
  const origin = headers.get('origin');
  if (!origin) return headers.get('sec-fetch-site') === 'same-origin';
  const allowed = new Set(
    ['https://sudhis.netlify.app', process.env.URL, process.env.DEPLOY_PRIME_URL, process.env.DEPLOY_URL].filter(
      (value): value is string => Boolean(value),
    ),
  );
  if (allowed.has(origin)) return true;
  try {
    const { protocol, hostname } = new URL(origin);
    if (hostname === 'localhost' || hostname === '127.0.0.1') return process.env.CONTEXT === 'dev';
    return protocol === 'https:' && hostname.endsWith('--sudhis.netlify.app');
  } catch {
    return false;
  }
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/** Any HTTP answer at all means the server is up. Also wakes it if it was asleep. */
async function isAwake(base: string): Promise<boolean> {
  try {
    await fetchWithTimeout(`${base}/`, { method: 'GET' }, WAKE_TIMEOUT_MS);
    return true;
  } catch {
    return false;
  }
}

function text(value: unknown, min: number, max: number): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length >= min && trimmed.length <= max ? trimmed : null;
}

function guestTokenFrom(url: URL): string | null {
  return url.searchParams.get('token') ?? url.searchParams.get('guestToken') ?? url.searchParams.get('chatToken');
}

async function createChat(config: Config, body: Record<string, unknown>): Promise<Response> {
  const service = typeof body.service === 'string' && SERVICES.has(body.service) ? body.service : null;
  if (!service) return invalid('service');
  const name = text(body.name, 2, 80);
  if (!name) return invalid('name');
  const email = text(body.email, 3, 254);
  if (!email || !EMAIL.test(email)) return invalid('email');
  const subject = text(body.subject, 2, 200);
  if (!subject) return invalid('subject');
  const message = text(body.message, 2, 4000);
  if (!message) return invalid('message');

  if (!(await isAwake(config.base))) return warming(WARMING_RETRY_MS);

  let response: Response;
  try {
    response = await fetchWithTimeout(
      `${config.base}/external/v1/chats`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-Key': config.key, 'X-API-Secret': config.secret },
        body: JSON.stringify({ subject, threadTitle: message, externalName: name, externalEmail: email }),
      },
      UPSTREAM_TIMEOUT_MS,
    );
  } catch {
    return warming(WARMING_RETRY_MS);
  }

  const payload = (await response.json().catch(() => ({}))) as { success?: boolean; data?: { guestUrl?: string } };
  if (!response.ok || !payload.success || !payload.data?.guestUrl) return warming(FAILING_RETRY_MS);

  let guestUrl: URL;
  try {
    guestUrl = new URL(payload.data.guestUrl);
    const frontend = new URL(config.frontend);
    guestUrl.protocol = frontend.protocol;
    guestUrl.host = frontend.host;
  } catch {
    return warming(FAILING_RETRY_MS);
  }
  const token = guestTokenFrom(guestUrl);
  if (!token) return warming(FAILING_RETRY_MS);
  return reply(200, { status: 'created', guestUrl: guestUrl.toString(), token });
}

async function sendMessage(config: Config, body: Record<string, unknown>): Promise<Response> {
  const token = text(body.token, 1, 512);
  if (!token) return invalid('token');
  const message = text(body.text, 1, 6000);
  if (!message) return invalid('text');
  try {
    const response = await fetchWithTimeout(
      `${config.base}/public/service-chat/message`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, text: message }) },
      UPSTREAM_TIMEOUT_MS,
    );
    return response.ok ? reply(200, { status: 'sent' }) : warming(FAILING_RETRY_MS);
  } catch {
    return warming(WARMING_RETRY_MS);
  }
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') return reply(405, { status: 'method_not_allowed' });
  if (!isAllowedRequest(request.headers)) return reply(403, { status: 'forbidden' });

  const config = readConfig();
  if (!config) return reply(500, { status: 'misconfigured' });

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await request.json();
    if (!parsed || typeof parsed !== 'object') return invalid('body');
    body = parsed as Record<string, unknown>;
  } catch {
    return invalid('body');
  }

  if (body.action === 'create') return createChat(config, body);
  if (body.action === 'message') return sendMessage(config, body);
  return invalid('action');
}
