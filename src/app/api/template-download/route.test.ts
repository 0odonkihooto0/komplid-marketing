import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { POST } from './route';
import { resetRateLimits } from '@/lib/rate-limit';

const ENV_KEYS = ['INTERNAL_API_URL', 'INTERNAL_API_TOKEN', 'LEADS_DATA_DIR'] as const;
const saved: Record<string, string | undefined> = {};

let dataDir: string;

beforeEach(async () => {
  for (const k of ENV_KEYS) saved[k] = process.env[k];
  process.env.INTERNAL_API_URL = 'https://api.example.test';
  process.env.INTERNAL_API_TOKEN = 'test-token';
  // Роут пишет лид на диск. Без своего каталога тесты дописывали заявки
  // в ./.data репозитория, а оттуда их считает счётчик мест в бете —
  // прогон тестов «занимал» места в закрытой бете на машине разработчика.
  dataDir = await mkdtemp(path.join(tmpdir(), 'komplid-tpl-'));
  process.env.LEADS_DATA_DIR = dataDir;
  // Заглушка сети по умолчанию. Без неё тест, который не подменил fetch сам,
  // уходит реальным запросом на api.example.test и висит до сетевого таймаута —
  // прогон падал «по таймауту 5000ms» в зависимости от скорости DNS.
  vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: true } as Response)));
  // Лимитер живёт в памяти модуля: без сброса тесты в одном файле
  // складываются в один счётчик и упираются в 429.
  resetRateLimits();
});

afterEach(async () => {
  for (const k of ENV_KEYS) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
  vi.unstubAllGlobals();
  await rm(dataDir, { recursive: true, force: true });
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

  // Скачивание шаблона — тоже сбор email, значит согласие должно фиксироваться.
  it('передаёт факт согласия на обработку ПДн и редакцию политики', async () => {
    const mock = vi.fn(() => Promise.resolve({ ok: true } as Response));
    vi.stubGlobal('fetch', mock);

    const res = await POST(
      makeReq(JSON.stringify({ ...validBody, pdConsent: true, pdConsentVersion: '2026-08-17' })),
    );

    expect(res.status).toBe(200);
    const [, init] = mock.mock.calls[0] as unknown as [string, RequestInit];
    expect(JSON.parse(String(init.body))).toMatchObject({
      pdConsent: true,
      pdConsentVersion: '2026-08-17',
    });
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
