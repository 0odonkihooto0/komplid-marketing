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
  return new Request('http://localhost/api/template-download', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body,
  }) as unknown as PostReq;
}

const validBody = {
  slug: 'aosr',
  filename: 'shablon-aosr-344pr.docx',
  email: 'user@example.com',
  role: 'pto',
  newsletterConsent: true,
};

describe('POST /api/template-download', () => {
  it('возвращает 400 на невалидный JSON', async () => {
    const res = await POST(makeReq('{bad'));
    expect(res.status).toBe(400);
  });

  it('отклоняет filename с обходом пути (regex)', async () => {
    const res = await POST(
      makeReq(JSON.stringify({ ...validBody, filename: '../../etc/passwd' })),
    );
    expect(res.status).toBe(400);
    const json = (await res.json()) as { error: string };
    expect(json.error).toBe('Validation error');
  });

  it('возвращает 400 при отсутствии обязательных полей', async () => {
    const res = await POST(makeReq(JSON.stringify({ slug: 'aosr' })));
    expect(res.status).toBe(400);
  });

  it('возвращает downloadUrl и отправляет лид (fire-and-forget)', async () => {
    const mock = vi.fn(() => Promise.resolve({ ok: true } as Response));
    vi.stubGlobal('fetch', mock);
    const res = await POST(makeReq(JSON.stringify(validBody)));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      downloadUrl: '/shablony-files/shablon-aosr-344pr.docx',
    });
    expect(mock).toHaveBeenCalledWith(
      'https://api.example.test/leads',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('возвращает downloadUrl даже без настроенного API (лид не отправляется)', async () => {
    delete process.env.INTERNAL_API_URL;
    delete process.env.INTERNAL_API_TOKEN;
    const mock = vi.fn();
    vi.stubGlobal('fetch', mock);
    const res = await POST(makeReq(JSON.stringify(validBody)));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      downloadUrl: '/shablony-files/shablon-aosr-344pr.docx',
    });
    expect(mock).not.toHaveBeenCalled();
  });
});
