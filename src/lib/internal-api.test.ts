import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { postToInternalApi } from './internal-api';

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

describe('postToInternalApi', () => {
  it('возвращает not_configured, если env не настроены (fetch не вызывается)', async () => {
    delete process.env.INTERNAL_API_URL;
    delete process.env.INTERNAL_API_TOKEN;
    const mock = vi.fn();
    vi.stubGlobal('fetch', mock);

    expect(await postToInternalApi('/leads', { a: 1 })).toEqual({
      ok: false,
      reason: 'not_configured',
    });
    expect(mock).not.toHaveBeenCalled();
  });

  it('делает авторизованный POST на собранный URL и возвращает ok', async () => {
    const mock = vi.fn(() => Promise.resolve({ ok: true } as Response));
    vi.stubGlobal('fetch', mock);

    expect(await postToInternalApi('/leads', { email: 'x@y.z' })).toEqual({ ok: true });
    expect(mock).toHaveBeenCalledWith('https://api.example.test/leads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-token',
      },
      body: JSON.stringify({ email: 'x@y.z' }),
    });
  });

  it('возвращает error при не-2xx ответе', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: false } as Response)));
    expect(await postToInternalApi('/newsletter', {})).toEqual({ ok: false, reason: 'error' });
  });

  it('возвращает error при сетевой ошибке', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('down'))));
    expect(await postToInternalApi('/leads', {})).toEqual({ ok: false, reason: 'error' });
  });
});
