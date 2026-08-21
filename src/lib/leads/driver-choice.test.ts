import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

/**
 * Выбор хранилища. Ошибка здесь не видна глазом, но стоит дорого: на App
 * Platform запись «на диск» означает базу заявок, которая исчезает при каждом
 * деплое, а в локальной разработке попытка ходить в S3 — потерянные заявки.
 */

const h = vi.hoisted(() => ({ puts: [] as string[] }));

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
    send(cmd: { input: Record<string, unknown> }) {
      h.puts.push(String(cmd.input['Key'] ?? ''));
      return Promise.resolve({ KeyCount: 0, IsTruncated: false });
    }
  }
  return { S3Client, PutObjectCommand, ListObjectsV2Command };
});

const { appendLead } = await import('../leads-store');
const { resetS3Cache } = await import('./s3');

const ENV_KEYS = ['S3_BUCKET', 'S3_ACCESS_KEY', 'S3_SECRET_KEY', 'LEADS_DATA_DIR'] as const;
const saved: Record<string, string | undefined> = {};
let dir: string;

beforeEach(async () => {
  for (const k of ENV_KEYS) saved[k] = process.env[k];
  dir = await mkdtemp(path.join(tmpdir(), 'komplid-driver-'));
  process.env.LEADS_DATA_DIR = dir;
  for (const k of ['S3_BUCKET', 'S3_ACCESS_KEY', 'S3_SECRET_KEY']) delete process.env[k];
  h.puts.length = 0;
  resetS3Cache();
});

afterEach(async () => {
  for (const k of ENV_KEYS) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
  await rm(dir, { recursive: true, force: true });
});

async function diskLines(): Promise<string[]> {
  try {
    const raw = await readFile(path.join(dir, 'leads.jsonl'), 'utf8');
    return raw.split('\n').filter(Boolean);
  } catch {
    return [];
  }
}

describe('выбор хранилища заявок', () => {
  it('без настроек S3 пишет на диск', async () => {
    expect(await appendLead({ email: 'a@example.ru', source: 'homepage-cta' })).toBe(true);

    expect(await diskLines()).toHaveLength(1);
    expect(h.puts).toHaveLength(0);
  });

  it('с настроенным S3 на диск ничего не попадает', async () => {
    process.env.S3_BUCKET = 'komplid-leads';
    process.env.S3_ACCESS_KEY = 'key';
    process.env.S3_SECRET_KEY = 'secret';

    expect(await appendLead({ email: 'a@example.ru', source: 'homepage-cta' })).toBe(true);

    expect(h.puts).toHaveLength(2);
    expect(await diskLines()).toHaveLength(0);
  });

  it('незаполненные ключи S3 не считаются настройкой', async () => {
    // .env.example объявляет их пустыми — половина окружений приезжает такой.
    process.env.S3_BUCKET = 'komplid-leads';
    process.env.S3_ACCESS_KEY = '';
    process.env.S3_SECRET_KEY = '  ';

    await appendLead({ email: 'a@example.ru', source: 'homepage-cta' });

    expect(await diskLines()).toHaveLength(1);
    expect(h.puts).toHaveLength(0);
  });

  it('receivedAt проставляется хранилищем и не подменяется из формы', async () => {
    await appendLead({
      email: 'a@example.ru',
      source: 'homepage-cta',
      receivedAt: '1999-01-01T00:00:00.000Z',
    });

    const [line] = await diskLines();
    expect(JSON.parse(line ?? '{}').receivedAt).not.toBe('1999-01-01T00:00:00.000Z');
  });
});
