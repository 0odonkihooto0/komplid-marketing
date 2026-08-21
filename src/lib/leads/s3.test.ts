import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

/**
 * S3-хранилище заявок. Проверяем ровно то, из-за чего оно и появилось:
 * заявка не должна теряться, а счётчик мест на главной — врать.
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
  return { S3Client, PutObjectCommand, ListObjectsV2Command };
});

const { s3Driver, s3Config, resetS3Cache } = await import('./s3');

const ENV_KEYS = ['S3_BUCKET', 'S3_ACCESS_KEY', 'S3_SECRET_KEY', 'S3_REGION', 'S3_ENDPOINT'] as const;
const saved: Record<string, string | undefined> = {};

function lead(extra: Record<string, unknown> = {}) {
  return { source: 'homepage-cta', receivedAt: '2026-08-21T10:00:00.000Z', ...extra };
}

beforeEach(() => {
  for (const k of ENV_KEYS) saved[k] = process.env[k];
  process.env.S3_BUCKET = 'komplid-leads';
  process.env.S3_ACCESS_KEY = 'key';
  process.env.S3_SECRET_KEY = 'secret';
  h.sent.length = 0;
  h.impl = async () => ({});
  resetS3Cache();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  for (const k of ENV_KEYS) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
  vi.restoreAllMocks();
});

describe('s3Config', () => {
  it('без бакета или ключей выключен — тогда работает файловый драйвер', () => {
    delete process.env.S3_BUCKET;
    expect(s3Config()).toBeNull();

    process.env.S3_BUCKET = 'komplid-leads';
    delete process.env.S3_SECRET_KEY;
    expect(s3Config()).toBeNull();
  });

  it('подставляет endpoint и регион Timeweb по умолчанию', () => {
    delete process.env.S3_REGION;
    delete process.env.S3_ENDPOINT;
    expect(s3Config()).toMatchObject({
      bucket: 'komplid-leads',
      region: 'ru-1',
      endpoint: 'https://s3.twcstorage.ru',
    });
  });

  it('пустая строка в переменной не побеждает значение по умолчанию', () => {
    process.env.S3_REGION = '';
    expect(s3Config()?.region).toBe('ru-1');
  });
});

describe('append', () => {
  it('пишет и событие, и контакт — разными объектами', async () => {
    const ok = await s3Driver.append(lead({ email: 'a@example.ru' }));

    expect(ok).toBe(true);
    expect(h.sent).toHaveLength(2);
    expect(h.sent[0]?.input['Key']).toMatch(/^leads\/events\/2026-08-21T10-00-00-000Z-/);
    // Контакт — по хэшу, чтобы повторная заявка перезаписала свой же объект
    // и не заняла второе место в бете.
    expect(h.sent[1]?.input['Key']).toMatch(/^leads\/contacts\/[0-9a-f]{64}\.json$/);
  });

  it('один и тот же адрес даёт один и тот же ключ контакта', async () => {
    await s3Driver.append(lead({ email: 'a@example.ru' }));
    await s3Driver.append(lead({ email: ' A@Example.RU ' }));

    expect(h.sent[1]?.input['Key']).toBe(h.sent[3]?.input['Key']);
  });

  it('заявка без контакта сохраняется, но места не занимает', async () => {
    const ok = await s3Driver.append(lead());

    expect(ok).toBe(true);
    expect(h.sent).toHaveLength(1);
    expect(h.sent[0]?.input['Key']).toContain('leads/events/');
  });

  it('возвращает false, если событие записать не удалось', async () => {
    h.impl = async () => {
      throw new Error('S3 недоступен');
    };
    expect(await s3Driver.append(lead({ email: 'a@example.ru' }))).toBe(false);
  });

  it('сбой записи контакта не теряет саму заявку', async () => {
    // Счётчик покажет чуть больше свободных мест — это безопаснее, чем
    // выдуманный дефицит (CLAUDE.md §21).
    h.impl = async (cmd) => {
      if (String(cmd.input['Key']).includes('contacts/')) throw new Error('нет прав');
      return {};
    };
    expect(await s3Driver.append(lead({ email: 'a@example.ru' }))).toBe(true);
  });
});

describe('count', () => {
  it('считает ключи контактов, проходя все страницы', async () => {
    let page = 0;
    h.impl = async () => {
      page += 1;
      return page === 1
        ? { KeyCount: 1000, IsTruncated: true, NextContinuationToken: 'next' }
        : { KeyCount: 34, IsTruncated: false };
    };

    expect(await s3Driver.count()).toBe(1034);
    expect(h.sent[0]?.input['Prefix']).toBe('leads/contacts/');
  });

  it('пустой бакет — это ноль, а не ошибка', async () => {
    h.impl = async () => ({ IsTruncated: false });
    expect(await s3Driver.count()).toBe(0);
  });

  it('не ходит в S3 повторно, пока держится кэш', async () => {
    h.impl = async () => ({ KeyCount: 7, IsTruncated: false });

    expect(await s3Driver.count()).toBe(7);
    expect(await s3Driver.count()).toBe(7);
    expect(h.sent.filter((c) => c.type === 'list')).toHaveLength(1);
  });

  it('новая заявка сбрасывает кэш счётчика', async () => {
    h.impl = async () => ({ KeyCount: 7, IsTruncated: false });
    await s3Driver.count();

    await s3Driver.append(lead({ email: 'a@example.ru' }));
    h.impl = async () => ({ KeyCount: 8, IsTruncated: false });

    expect(await s3Driver.count()).toBe(8);
  });

  it('при сбое отдаёт последнее известное значение, а не ноль', async () => {
    // Ноль означал бы «свободны все 100 мест» — обещание очереди, которой нет.
    // Время двигаем поддельными таймерами: иначе кэш остался бы горячим и тест
    // проверял бы не ветку с ошибкой, а возврат из кэша.
    vi.useFakeTimers();
    try {
      h.impl = async () => ({ KeyCount: 42, IsTruncated: false });
      expect(await s3Driver.count()).toBe(42);

      vi.advanceTimersByTime(61_000);
      h.impl = async () => {
        throw new Error('S3 недоступен');
      };

      expect(await s3Driver.count()).toBe(42);
      expect(h.sent.filter((c) => c.type === 'list')).toHaveLength(2);
    } finally {
      vi.useRealTimers();
    }
  });

  it('без прежнего значения сбой даёт ноль, а не падение', async () => {
    h.impl = async () => {
      throw new Error('S3 недоступен');
    };
    expect(await s3Driver.count()).toBe(0);
  });
});
