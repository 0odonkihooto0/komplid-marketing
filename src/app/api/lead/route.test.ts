import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { POST } from './route';

const ENV_KEYS = ['INTERNAL_API_URL', 'INTERNAL_API_TOKEN'] as const;
const saved: Record<string, string | undefined> = {};

beforeEach(() => {
  for (const k of ENV_KEYS) saved[k] = process.env[k];
  process.env.INTERNAL_API_URL = 'https://api.example.test';
  process.env.INTERNAL_API_TOKEN = 'test-token';
});

afterEach(() => {
  for (const k of ENV_KEYS) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
  vi.unstubAllGlobals();
});

type PostReq = Parameters<typeof POST>[0];

function makeReq(body: string): PostReq {
  return new Request('http://localhost/api/lead', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body,
  }) as unknown as PostReq;
}

const validLead = JSON.stringify({ email: 'user@example.com', source: 'contact_form' });

describe('POST /api/lead', () => {
  it('возвращает 400 на невалидный JSON', async () => {
    const res = await POST(makeReq('{не json'));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Invalid JSON' });
  });

  it('возвращает 400 при ошибке валидации Zod (нет email)', async () => {
    const res = await POST(makeReq(JSON.stringify({ source: 'x' })));
    expect(res.status).toBe(400);
    const json = (await res.json()) as { error: string };
    expect(json.error).toBe('Validation error');
  });

  it('возвращает 400 при невалидном email', async () => {
    const res = await POST(makeReq(JSON.stringify({ email: 'not-an-email', source: 'x' })));
    expect(res.status).toBe(400);
  });

  it('возвращает 500, если env не настроены', async () => {
    delete process.env.INTERNAL_API_URL;
    delete process.env.INTERNAL_API_TOKEN;
    const mock = vi.fn();
    vi.stubGlobal('fetch', mock);
    const res = await POST(makeReq(validLead));
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'API not configured' });
    expect(mock).not.toHaveBeenCalled();
  });

  it('возвращает 500, если fetch бросает', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('down'))));
    const res = await POST(makeReq(validLead));
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'Internal error' });
  });

  it('возвращает 500 при не-2xx ответе апстрима', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: false } as Response)));
    const res = await POST(makeReq(validLead));
    expect(res.status).toBe(500);
  });

  it('пересылает лид и возвращает success при корректном запросе', async () => {
    const mock = vi.fn(() => Promise.resolve({ ok: true } as Response));
    vi.stubGlobal('fetch', mock);
    const res = await POST(makeReq(validLead));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
    expect(mock).toHaveBeenCalledWith(
      'https://api.example.test/leads',
      expect.objectContaining({ method: 'POST' }),
    );
  });
});
