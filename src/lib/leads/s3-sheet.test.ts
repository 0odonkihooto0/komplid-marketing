import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import ExcelJS from 'exceljs';

/**
 * Таблица-зеркало в бакете. Проверяем то, ради чего она заменила внешний
 * сервис: строка доходит до файла, а уже собранная таблица не затирается —
 * ни очередной заявкой, ни сбоем чтения.
 */

const h = vi.hoisted(() => ({
  sent: [] as { type: string; input: Record<string, unknown> }[],
  impl: (async () => ({})) as (cmd: { type: string; input: Record<string, unknown> }) => Promise<unknown>,
}));

vi.mock('@aws-sdk/client-s3', () => {
  class PutObjectCommand {
    type = 'put';
    constructor(public input: Record<string, unknown>) {}
  }
  class GetObjectCommand {
    type = 'get';
    constructor(public input: Record<string, unknown>) {}
  }
  class ListObjectsV2Command {
    type = 'list';
    constructor(public input: Record<string, unknown>) {}
  }
  class S3Client {
    constructor(public config: unknown) {}
    send(cmd: { type: string; input: Record<string, unknown> }) {
      h.sent.push(cmd);
      return h.impl(cmd);
    }
  }
  return { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command };
});

const { appendToSheet, rebuildSheet, sheetKey } = await import('./s3-sheet');
const { resetS3Cache } = await import('./s3');

const ENV_KEYS = ['S3_BUCKET', 'S3_ACCESS_KEY', 'S3_SECRET_KEY', 'S3_SHEET_KEY'] as const;
const saved: Record<string, string | undefined> = {};

function lead(extra: Record<string, unknown> = {}) {
  return { source: 'homepage-cta', receivedAt: '2026-08-21T10:00:00.000Z', ...extra };
}

/** Ошибка так, как её отдаёт SDK: код лежит в `name`. */
function awsError(name: string) {
  const err = new Error(name);
  err.name = name;
  return err;
}

/** Содержимое последнего PUT, разобранное обратно в книгу. */
async function uploadedRows(): Promise<string[][]> {
  const put = [...h.sent].reverse().find((c) => c.type === 'put');
  if (!put) throw new Error('в бакет ничего не клали');
  const workbook = new ExcelJS.Workbook();
  type LoadArg = Parameters<typeof workbook.xlsx.load>[0];
  await workbook.xlsx.load(Buffer.from(put.input.Body as Uint8Array) as unknown as LoadArg);
  const sheet = workbook.worksheets[0];
  if (!sheet) throw new Error('в загруженной книге нет листа');

  const rows: string[][] = [];
  sheet.eachRow((row) => {
    const values = row.values as unknown[];
    rows.push(values.slice(1).map((v) => (v == null ? '' : String(v))));
  });
  return rows;
}

beforeEach(() => {
  for (const k of ENV_KEYS) saved[k] = process.env[k];
  process.env.S3_BUCKET = 'komplid-leads';
  process.env.S3_ACCESS_KEY = 'key';
  process.env.S3_SECRET_KEY = 'secret';
  delete process.env.S3_SHEET_KEY;
  h.sent = [];
  h.impl = async () => ({});
  resetS3Cache();
});

afterEach(() => {
  for (const k of ENV_KEYS) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
  vi.restoreAllMocks();
});

describe('таблица заявок в бакете', () => {
  it('создаёт файл с шапкой, когда его ещё нет', async () => {
    h.impl = async (cmd) => {
      if (cmd.type === 'get') throw awsError('NoSuchKey');
      return {};
    };

    expect(await appendToSheet(lead({ email: 'a@komplid.ru' }))).toBe(true);

    const rows = await uploadedRows();
    expect(rows[0]?.[0]).toBe('Дата и время');
    expect(rows[1]).toContain('a@komplid.ru');
  });

  it('кладёт файл под понятным ключом и типом', async () => {
    h.impl = async (cmd) => {
      if (cmd.type === 'get') throw awsError('NoSuchKey');
      return {};
    };
    await appendToSheet(lead({ email: 'a@komplid.ru' }));

    const put = h.sent.find((c) => c.type === 'put');
    expect(put?.input.Key).toBe('leads/zayavki.xlsx');
    expect(String(put?.input.ContentType)).toContain('spreadsheetml.sheet');
    expect(sheetKey()).toBe('leads/zayavki.xlsx');
  });

  it('дописывает строку в уже собранную таблицу, а не затирает её', async () => {
    // Готовим «лежащий в бакете» файл с одной заявкой.
    const { buildWorkbook } = await import('./sheet');
    const existing = await buildWorkbook([lead({ email: 'first@komplid.ru' })]).xlsx.writeBuffer();

    h.impl = async (cmd) => {
      if (cmd.type === 'get') {
        return { Body: { transformToByteArray: async () => new Uint8Array(existing as ArrayBuffer) } };
      }
      return {};
    };

    expect(await appendToSheet(lead({ email: 'second@komplid.ru' }))).toBe(true);

    const rows = await uploadedRows();
    expect(rows).toHaveLength(3); // шапка и две заявки
    expect(rows.flat()).toContain('first@komplid.ru');
    expect(rows.flat()).toContain('second@komplid.ru');
  });

  it('при ошибке чтения ничего не пишет — иначе пустая книга затрёт таблицу', async () => {
    h.impl = async (cmd) => {
      if (cmd.type === 'get') throw awsError('AccessDenied');
      return {};
    };
    vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(await appendToSheet(lead({ email: 'a@komplid.ru' }))).toBe(false);
    expect(h.sent.some((c) => c.type === 'put')).toBe(false);
  });

  it('пересборка перезаписывает таблицу всеми заявками по порядку времени', async () => {
    const rows = await (async () => {
      await rebuildSheet([
        lead({ email: 'later@komplid.ru', receivedAt: '2026-08-21T12:00:00.000Z' }),
        lead({ email: 'earlier@komplid.ru', receivedAt: '2026-08-21T09:00:00.000Z' }),
      ]);
      return uploadedRows();
    })();

    expect(rows).toHaveLength(3);
    expect(rows[1]).toContain('earlier@komplid.ru');
    expect(rows[2]).toContain('later@komplid.ru');
  });

  it('без настроенного бакета зеркала нет, а пересборка честно падает', async () => {
    delete process.env.S3_BUCKET;
    resetS3Cache();

    expect(await appendToSheet(lead())).toBe(false);
    expect(h.sent).toHaveLength(0);
    await expect(rebuildSheet([lead()])).rejects.toThrow(/не настроена/);
  });
});
