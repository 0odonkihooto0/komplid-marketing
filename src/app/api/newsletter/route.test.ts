import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { POST } from './route';
import { resetRateLimits } from '@/lib/rate-limit';

const ENV_KEYS = ['INTERNAL_API_URL', 'INTERNAL_API_TOKEN'] as const;
const saved: Record<string, string | undefined> = {};

beforeEach(() => {
  for (const k of ENV_KEYS) saved[k] = process.env[k];
  process.env.INTERNAL_API_URL = 'https://api.example.test';
  process.env.INTERNAL_API_TOKEN = 'test-token';
  // Заглушка сети по умолчанию. Без неё тест, который не подменил fetch сам,
  // уходит реальным запросом на api.example.test и висит до сетевого таймаута —
  // прогон падал «по таймауту 5000ms» в зависимости от скорости DNS.
  vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: true } as Response)));
  // Лимитер живёт в памяти модуля: без сброса тесты в одном файле
  // складываются в один счётчик и упираются в 429.
  resetRateLimits();
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
  return new Request('http://localhost/api/newsletter', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body,
  }) as unknown as PostReq;
}

describe('POST /api/newsletter', () => {
  it('возвращает 400 на невалидный JSON', async () => {
    const res = await POST(makeReq('{bad'));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Invalid JSON' });
  });

  it('возвращает 400 при невалидном email', async () => {
    const res = await POST(makeReq(JSON.stringify({ email: 'nope' })));
    expect(res.status).toBe(400);
  });

  it('возвращает 500, если env не настроены', async () => {
    delete process.env.INTERNAL_API_URL;
    delete process.env.INTERNAL_API_TOKEN;
    const res = await POST(makeReq(JSON.stringify({ email: 'user@example.com' })));
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'API not configured' });
  });

  it('пересылает подписку на /newsletter и возвращает success', async () => {
    const mock = vi.fn(() => Promise.resolve({ ok: true } as Response));
    vi.stubGlobal('fetch', mock);
    const res = await POST(
      makeReq(JSON.stringify({ email: 'user@example.com', tags: ['pto'] })),
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
    expect(mock).toHaveBeenCalledWith(
      'https://api.example.test/newsletter',
      expect.objectContaining({ method: 'POST' }),
    );
  });
});
