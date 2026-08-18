import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { POST } from './route';

const ENV_KEYS = [
  'INTERNAL_API_URL',
  'INTERNAL_API_TOKEN',
  'LEADS_DATA_DIR',
  'TELEGRAM_BOT_TOKEN',
  'TELEGRAM_CHAT_ID',
] as const;
const saved: Record<string, string | undefined> = {};

let dataDir: string;

beforeEach(async () => {
  for (const k of ENV_KEYS) saved[k] = process.env[k];
  process.env.INTERNAL_API_URL = 'https://api.example.test';
  process.env.INTERNAL_API_TOKEN = 'test-token';
  // Пишем во временный каталог, чтобы тесты не оставляли файлов в репозитории.
  dataDir = await mkdtemp(path.join(tmpdir(), 'komplid-leads-'));
  process.env.LEADS_DATA_DIR = dataDir;
  // Telegram-уведомления в тестах не шлём.
  delete process.env.TELEGRAM_BOT_TOKEN;
  delete process.env.TELEGRAM_CHAT_ID;
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(async () => {
  for (const k of ENV_KEYS) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  await rm(dataDir, { recursive: true, force: true });
});

type PostReq = Parameters<typeof POST>[0];

function makeReq(body: string): PostReq {
  return new Request('http://localhost/api/lead', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body,
  }) as unknown as PostReq;
}

async function storedLeads(): Promise<Array<Record<string, unknown>>> {
  const raw = await readFile(path.join(dataDir, 'leads.jsonl'), 'utf8');
  return raw
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line) as Record<string, unknown>);
}

const validLead = JSON.stringify({ email: 'user@example.com', source: 'waitlist' });

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

  // Главный сценарий пре-лонча: приложение ещё не запущено.
  it('сохраняет лид и отвечает 200, когда приложение не настроено', async () => {
    delete process.env.INTERNAL_API_URL;
    delete process.env.INTERNAL_API_TOKEN;
    const mock = vi.fn();
    vi.stubGlobal('fetch', mock);

    const res = await POST(makeReq(validLead));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
    expect(mock).not.toHaveBeenCalled();
    const leads = await storedLeads();
    expect(leads).toHaveLength(1);
    expect(leads[0]).toMatchObject({ email: 'user@example.com', source: 'waitlist' });
    expect(leads[0]?.receivedAt).toEqual(expect.any(String));
  });

  it('сохраняет лид и отвечает 200, когда приложение недоступно (fetch бросает)', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('down'))));
    const res = await POST(makeReq(validLead));
    expect(res.status).toBe(200);
    expect(await storedLeads()).toHaveLength(1);
  });

  it('сохраняет лид и отвечает 200 при не-2xx ответе апстрима', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: false } as Response)));
    const res = await POST(makeReq(validLead));
    expect(res.status).toBe(200);
    expect(await storedLeads()).toHaveLength(1);
  });

  it('пересылает лид в приложение и возвращает success', async () => {
    const mock = vi.fn(() => Promise.resolve({ ok: true } as Response));
    vi.stubGlobal('fetch', mock);

    const res = await POST(makeReq(validLead));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
    expect(mock).toHaveBeenCalledWith(
      'https://api.example.test/leads',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(await storedLeads()).toHaveLength(1);
  });

  // Согласие на обработку ПДн — доказательство по 152-ФЗ: галочка в форме
  // бессмысленна, если её значение не доезжает до записи о лиде.
  it('сохраняет факт согласия на обработку ПДн и редакцию политики', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: true } as Response)));

    const res = await POST(
      makeReq(
        JSON.stringify({
          email: 'user@example.com',
          source: 'waitlist',
          pdConsent: true,
          pdConsentVersion: '2026-08-17',
        }),
      ),
    );

    expect(res.status).toBe(200);
    const leads = await storedLeads();
    expect(leads[0]).toMatchObject({ pdConsent: true, pdConsentVersion: '2026-08-17' });
  });

  // Клиент с закэшированной страницей ещё не знает про новые поля — такой лид
  // всё равно должен сохраниться, а не отвалиться на валидации.
  it('принимает лид без полей согласия', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: true } as Response)));
    const res = await POST(makeReq(validLead));
    expect(res.status).toBe(200);
    expect(await storedLeads()).toHaveLength(1);
  });

  it('дописывает несколько лидов в один файл', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: true } as Response)));
    await POST(makeReq(validLead));
    await POST(makeReq(JSON.stringify({ email: 'second@example.com', source: 'waitlist' })));
    const leads = await storedLeads();
    expect(leads.map((l) => l.email)).toEqual(['user@example.com', 'second@example.com']);
  });

  // Единственный случай, когда пользователю честно говорим об ошибке:
  // лид не удалось сохранить вообще нигде.
  it('возвращает 500, если и диск, и приложение недоступны', async () => {
    const blocker = path.join(dataDir, 'blocker');
    await writeFile(blocker, 'занято файлом, каталог тут не создать');
    process.env.LEADS_DATA_DIR = path.join(blocker, 'nested');
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('down'))));

    const res = await POST(makeReq(validLead));

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'Не удалось сохранить заявку' });
  });
});
