import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import ExcelJS from 'exceljs';
import { appendToSheet, rebuildSheet, diskConfig } from './yandex-disk';
import type { StoredLead } from './types';

/**
 * Зеркало заявок в таблицу на Яндекс.Диске.
 *
 * Проверяем ровно то, ради чего оно и сделано: строка доезжает до таблицы,
 * прежние строки не пропадают, а сбой Диска не превращается в исключение —
 * заявка к этому моменту уже сохранена в основном хранилище.
 */

const ENV_KEYS = ['YANDEX_DISK_TOKEN', 'YANDEX_DISK_PATH'] as const;
const saved: Record<string, string | undefined> = {};

/** Последний загруженный на «Диск» файл — им притворяется хранилище в тестах. */
let uploaded: Buffer | null = null;
/** Что отдавать на запрос скачивания: null — файла ещё нет. */
let remote: Buffer | null = null;
let requests: string[] = [];
/** Подменяет ответ на конкретный шаг API, чтобы проверить обработку сбоя. */
let failOn: string | null = null;

function lead(extra: Partial<StoredLead> = {}): StoredLead {
  return {
    source: 'homepage-cta',
    receivedAt: '2026-08-21T10:00:00.000Z',
    email: 'a@example.ru',
    ...extra,
  } as StoredLead;
}

async function rowsOf(buf: Buffer): Promise<string[][]> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buf as unknown as Parameters<typeof wb.xlsx.load>[0]);
  const sheet = wb.worksheets[0];
  const out: string[][] = [];
  sheet?.eachRow((row) => {
    const values = row.values as unknown[];
    out.push(values.slice(1).map((v) => (v == null ? '' : String(v))));
  });
  return out;
}

beforeEach(() => {
  for (const k of ENV_KEYS) saved[k] = process.env[k];
  process.env.YANDEX_DISK_TOKEN = 'test-token';
  process.env.YANDEX_DISK_PATH = 'disk:/Комплид/Заявки.xlsx';
  uploaded = null;
  remote = null;
  requests = [];
  failOn = null;
  vi.spyOn(console, 'error').mockImplementation(() => {});

  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const url = String(input);
      requests.push(url);
      if (failOn && url.includes(failOn)) {
        return new Response('нет доступа', { status: 403 });
      }

      // Шаг 1: адрес для скачивания.
      if (url.includes('/resources/download')) {
        if (!remote) return new Response('not found', { status: 404 });
        return Response.json({ href: 'https://storage.test/get' });
      }
      // Шаг 1: адрес для загрузки.
      if (url.includes('/resources/upload')) {
        return Response.json({ href: 'https://storage.test/put' });
      }
      // Создание папки: уже существует.
      if (url.includes('/resources?path=')) {
        return new Response(null, { status: 409 });
      }
      // Шаг 2: сам файл.
      if (url === 'https://storage.test/get') {
        return new Response(remote as unknown as BodyInit);
      }
      if (url === 'https://storage.test/put') {
        uploaded = Buffer.from(init?.body as ArrayBuffer);
        return new Response(null, { status: 201 });
      }
      throw new Error(`неожиданный запрос: ${url}`);
    }),
  );
});

afterEach(() => {
  for (const k of ENV_KEYS) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('diskConfig', () => {
  it('без токена зеркало выключено', () => {
    delete process.env.YANDEX_DISK_TOKEN;
    expect(diskConfig()).toBeNull();
  });

  it('путь по умолчанию задан — папка создастся сама', () => {
    delete process.env.YANDEX_DISK_PATH;
    expect(diskConfig()?.path).toContain('.xlsx');
  });
});

describe('appendToSheet', () => {
  it('создаёт таблицу с заголовками, если файла ещё нет', async () => {
    expect(await appendToSheet(lead())).toBe(true);

    const rows = await rowsOf(uploaded!);
    expect(rows[0]).toContain('Почта');
    expect(rows).toHaveLength(2);
    expect(rows[1]).toContain('a@example.ru');
  });

  it('дописывает строку, не теряя прежние', async () => {
    await appendToSheet(lead());
    remote = uploaded;

    await appendToSheet(lead({ email: 'b@example.ru' }));

    const rows = await rowsOf(uploaded!);
    expect(rows).toHaveLength(3);
    expect(rows[1]).toContain('a@example.ru');
    expect(rows[2]).toContain('b@example.ru');
  });

  it('переносит в таблицу поля формы, включая согласия', async () => {
    await appendToSheet(
      lead({ name: 'Иван', company: 'СтройКо', role: 'pto', earlyAccess: true, pdConsent: true }),
    );

    const [, row = []] = await rowsOf(uploaded!);
    expect(row).toContain('Иван');
    expect(row).toContain('СтройКо');
    expect(row).toContain('pto');
    // Флаги пишутся словами: таблицу читает человек.
    expect(row).toContain('да');
  });

  it('неизвестные поля не теряются, а сводятся в «Прочее»', async () => {
    await appendToSheet(lead({ metadata: { template: 'aosr' } } as Partial<StoredLead>));

    const [, row = []] = await rowsOf(uploaded!);
    expect(row.join(' ')).toContain('aosr');
  });

  it('сбой Диска не бросает исключение — заявка уже в хранилище', async () => {
    failOn = '/resources/upload';
    expect(await appendToSheet(lead())).toBe(false);
  });

  it('без токена ничего не делает и в сеть не ходит', async () => {
    delete process.env.YANDEX_DISK_TOKEN;
    expect(await appendToSheet(lead())).toBe(false);
    expect(requests).toHaveLength(0);
  });

  it('токен уходит в заголовке, а не в адресе', async () => {
    await appendToSheet(lead());
    expect(requests.some((u) => u.includes('test-token'))).toBe(false);
  });
});

describe('rebuildSheet', () => {
  it('собирает таблицу заново и упорядочивает по времени', async () => {
    const count = await rebuildSheet([
      lead({ email: 'later@example.ru', receivedAt: '2026-08-21T12:00:00.000Z' }),
      lead({ email: 'earlier@example.ru', receivedAt: '2026-08-21T09:00:00.000Z' }),
    ]);

    expect(count).toBe(2);
    const rows = await rowsOf(uploaded!);
    expect(rows[1]).toContain('earlier@example.ru');
    expect(rows[2]).toContain('later@example.ru');
  });

  it('затирает прежнее содержимое, а не дописывает к нему', async () => {
    await appendToSheet(lead({ email: 'stale@example.ru' }));
    remote = uploaded;

    await rebuildSheet([lead({ email: 'fresh@example.ru' })]);

    const rows = await rowsOf(uploaded!);
    expect(rows).toHaveLength(2);
    expect(rows.join(' ')).not.toContain('stale@example.ru');
  });

  it('без настроенного Диска сообщает об этом явно', async () => {
    delete process.env.YANDEX_DISK_TOKEN;
    await expect(rebuildSheet([lead()])).rejects.toThrow(/не настроен/);
  });
});
