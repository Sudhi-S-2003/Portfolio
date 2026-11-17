// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import handler from './functions/chat';

const ENV = {
  CHAT_API_BASE: 'https://chat-api.example',
  CHAT_API_KEY: 'test-key',
  CHAT_API_SECRET: 'test-secret-value',
  CHAT_FRONTEND_BASE: 'https://chat-ui.example',
};

const validCreate = {
  action: 'create',
  service: 'hire_me',
  name: 'Asha Menon',
  email: 'asha@example.com',
  subject: 'Job opportunity: Asha Menon',
  message: 'We have a backend role open.',
};

function request(body: unknown, init: { method?: string; origin?: string } = {}) {
  return new Request('https://sudhis.netlify.app/.netlify/functions/chat', {
    method: init.method ?? 'POST',
    headers: { 'Content-Type': 'application/json', Origin: init.origin ?? 'https://sudhis.netlify.app' },
    ...(init.method === 'GET' ? {} : { body: JSON.stringify(body) }),
  });
}

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  for (const [key, value] of Object.entries(ENV)) vi.stubEnv(key, value);
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('chat function', () => {
  it('only accepts POST', async () => {
    const response = await handler(request(null, { method: 'GET' }));
    expect(response.status).toBe(405);
  });

  it('refuses scripted calls that send no Origin and no same-origin fetch marker', async () => {
    const bare = new Request('https://sudhis.netlify.app/.netlify/functions/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validCreate),
    });
    expect((await handler(bare)).status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('accepts a same-origin browser request that omits Origin', async () => {
    fetchMock.mockRejectedValueOnce(new DOMException('aborted', 'AbortError'));
    const sameOrigin = new Request('https://sudhis.netlify.app/.netlify/functions/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Sec-Fetch-Site': 'same-origin' },
      body: JSON.stringify(validCreate),
    });
    expect((await handler(sameOrigin)).status).toBe(503);
  });

  it('refuses localhost in production but allows it in local development', async () => {
    vi.stubEnv('CONTEXT', 'production');
    expect((await handler(request(validCreate, { origin: 'http://localhost:5173' }))).status).toBe(403);
    vi.stubEnv('CONTEXT', 'dev');
    fetchMock.mockRejectedValueOnce(new DOMException('aborted', 'AbortError'));
    expect((await handler(request(validCreate, { origin: 'http://localhost:5173' }))).status).toBe(503);
  });

  it('refuses calls from other websites', async () => {
    const response = await handler(request(validCreate, { origin: 'https://evil.example' }));
    expect(response.status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('reports missing configuration without leaking any value', async () => {
    vi.stubEnv('CHAT_API_BASE', '');
    const response = await handler(request(validCreate));
    expect(response.status).toBe(500);
    const text = await response.text();
    expect(JSON.parse(text)).toEqual({ status: 'misconfigured' });
    expect(text).not.toContain('test-secret-value');
  });

  it('rejects an invalid email with the field name', async () => {
    const response = await handler(request({ ...validCreate, email: 'not-an-email' }));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ status: 'invalid', field: 'email' });
  });

  it('answers "warming" and creates nothing while the backend sleeps', async () => {
    fetchMock.mockRejectedValueOnce(new DOMException('The operation was aborted.', 'AbortError'));
    const response = await handler(request(validCreate));
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ status: 'warming', retryAfterMs: 15000 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('creates the chat when the backend is awake and rewrites the guest URL', async () => {
    fetchMock
      .mockResolvedValueOnce(new Response('not found', { status: 404 }))
      .mockResolvedValueOnce(
        jsonResponse(200, { success: true, data: { guestUrl: 'https://chat-api.example/guest/chat?token=abc123' } }),
      );
    const response = await handler(request(validCreate));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      status: 'created',
      guestUrl: 'https://chat-ui.example/guest/chat?token=abc123',
      token: 'abc123',
    });
    const [url, init] = fetchMock.mock.calls[1] as [string, RequestInit];
    expect(url).toBe('https://chat-api.example/external/v1/chats');
    expect(init.headers).toMatchObject({ 'X-API-Key': 'test-key', 'X-API-Secret': 'test-secret-value' });
    expect(JSON.parse(init.body as string)).toEqual({
      subject: 'Job opportunity: Asha Menon',
      threadTitle: 'We have a backend role open.',
      externalName: 'Asha Menon',
      externalEmail: 'asha@example.com',
    });
  });

  it('treats an upstream failure as "warming" so the queue tries again later', async () => {
    fetchMock
      .mockResolvedValueOnce(new Response('ok'))
      .mockResolvedValueOnce(jsonResponse(502, { success: false }));
    const response = await handler(request(validCreate));
    expect(response.status).toBe(503);
    expect((await response.json()).status).toBe('warming');
  });

  it('sends the first message with the guest token', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { success: true }));
    const response = await handler(request({ action: 'message', token: 'abc123', text: 'Hire Me Request' }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: 'sent' });
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://chat-api.example/public/service-chat/message');
    expect(JSON.parse(init.body as string)).toEqual({ token: 'abc123', text: 'Hire Me Request' });
  });
});
