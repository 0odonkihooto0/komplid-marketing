import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { validateRefCode } from './referral';

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

function stubFetch(impl: () => Promise<unknown>) {
  const mock = vi.fn(impl);
  vi.stubGlobal('fetch', mock);
  return mock;
}

describe('validateRefCode', () => {
  it('возвращает null, если env не настроены (fetch не вызывается)', async () => {
    delete process.env.INTERNAL_API_URL;
    delete process.env.INTERNAL_API_TOKEN;
    const mock = stubFetch(() => Promise.resolve({ ok: true }));
    expect(await validateRefCode('ABC123')).toBeNull();
    expect(mock).not.toHaveBeenCalled();
  });

  it('возвращает объект для валидного кода', async () => {
    stubFetch(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ valid: true, inviterName: 'Иван', discount: 30 }),
      }),
    );
    expect(await validateRefCode('ABC123')).toEqual({
      valid: true,
      inviterName: 'Иван',
      discount: 30,
    });
  });

  it('кодирует код в URL', async () => {
    const mock = stubFetch(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({ valid: true }) }),
    );
    await validateRefCode('a b/c');
    expect(mock).toHaveBeenCalledWith(
      'https://api.example.test/referrals/a%20b%2Fc',
      expect.anything(),
    );
  });

  it('возвращает null при не-2xx ответе', async () => {
    stubFetch(() => Promise.resolve({ ok: false }));
    expect(await validateRefCode('ABC123')).toBeNull();
  });

  it('возвращает null при некорректной форме ответа', async () => {
    stubFetch(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({ foo: 'bar' }) }),
    );
    expect(await validateRefCode('ABC123')).toBeNull();
  });

  it('возвращает null, если valid не boolean', async () => {
    stubFetch(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({ valid: 'yes' }) }),
    );
    expect(await validateRefCode('ABC123')).toBeNull();
  });

  it('возвращает null при сетевой ошибке (fetch бросает)', async () => {
    stubFetch(() => Promise.reject(new Error('network down')));
    expect(await validateRefCode('ABC123')).toBeNull();
  });
});
