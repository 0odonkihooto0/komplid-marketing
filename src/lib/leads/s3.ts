import { createHash, randomUUID } from 'node:crypto';
import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  GetObjectCommand,
  type S3ClientConfig,
} from '@aws-sdk/client-s3';
import { envOr } from '../env';
import { contactKey, type LeadsDriver, type StoredLead } from './types';

/**
 * Хранилище заявок в S3 — основной путь на Timeweb App Platform.
 *
 * Зачем не файл: «каждый новый деплой запускает новое окружение, то есть
 * создаётся новый Docker-контейнер, в котором не сохраняются данные из
 * предыдущих версий контейнера» (документация App Platform). Постоянного диска
 * там нет, и собранная база пре-лонча исчезала бы при каждом выкате.
 *
 * Раскладка — два префикса, а не один файл:
 *
 *   leads/events/{время}-{uuid}.json  — по объекту на каждую отправку, история
 *   leads/contacts/{sha256}.json      — по объекту на уникальный контакт
 *
 * Один объект-журнал не годится: дозаписи в S3 не бывает, объект неизменяем,
 * а чтение-изменение-запись при двух одновременных заявках теряет одну из них.
 * Отдельный объект на контакт заодно делает подсчёт уникальных бесплатным —
 * их не надо читать, достаточно сосчитать ключи.
 */

const CONTACTS_PREFIX = 'leads/contacts/';
const EVENTS_PREFIX = 'leads/events/';

/** Счётчик остатка мест дёргается с каждой загрузки главной. */
const COUNT_TTL_MS = 60_000;

export interface S3Config {
  bucket: string;
  region: string;
  endpoint: string;
  accessKey: string;
  secretKey: string;
}

/** Конфигурация читается при каждом обращении: тесты подменяют её на лету. */
export function s3Config(): S3Config | null {
  const bucket = process.env.S3_BUCKET?.trim();
  const accessKey = process.env.S3_ACCESS_KEY?.trim();
  const secretKey = process.env.S3_SECRET_KEY?.trim();
  if (!bucket || !accessKey || !secretKey) return null;

  return {
    bucket,
    accessKey,
    secretKey,
    region: envOr(process.env.S3_REGION, 'ru-1'),
    endpoint: envOr(process.env.S3_ENDPOINT, 'https://s3.twcstorage.ru'),
  };
}

let cached: { key: string; client: S3Client } | null = null;

/**
 * Клиент с кэшем. Экспортируется ради `s3-sheet.ts`: таблица-зеркало живёт
 * в том же бакете, и второй клиент с той же конфигурацией был бы лишним.
 */
export function s3Client(cfg: S3Config): S3Client {
  // Ключ кэша — вся конфигурация: смена бакета или ключей должна поднять
  // новый клиент, а не молча писать в старый.
  const key = `${cfg.endpoint}|${cfg.region}|${cfg.bucket}|${cfg.accessKey}`;
  if (cached?.key === key) return cached.client;

  const config: S3ClientConfig = {
    region: cfg.region,
    endpoint: cfg.endpoint,
    credentials: { accessKeyId: cfg.accessKey, secretAccessKey: cfg.secretKey },
  };
  cached = { key, client: new S3Client(config) };
  return cached.client;
}

/** Сбрасывает кэш клиента и счётчика. Только для тестов. */
export function resetS3Cache(): void {
  cached = null;
  countCache = null;
}

async function append(record: StoredLead): Promise<boolean> {
  const cfg = s3Config();
  if (!cfg) return false;

  const s3 = s3Client(cfg);
  const body = JSON.stringify(record);
  // Двоеточия из ISO-времени в ключе допустимы, но мешают при выгрузке
  // бакета на диск: в именах файлов Windows их нет.
  const stamp = record.receivedAt.replace(/[:.]/g, '-');

  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: cfg.bucket,
        Key: `${EVENTS_PREFIX}${stamp}-${randomUUID()}.json`,
        Body: body,
        ContentType: 'application/json; charset=utf-8',
      }),
    );
  } catch (err) {
    console.error('[leads-store] не удалось записать заявку в S3:', err);
    return false;
  }

  // Объект-контакт пишем вторым: он нужен только счётчику. Если упадёт именно
  // он, заявка уже сохранена, а счётчик покажет чуть больше свободных мест —
  // это безопаснее, чем выдуманный дефицит (CLAUDE.md §21).
  const key = contactKey(record);
  if (key) {
    try {
      await s3.send(
        new PutObjectCommand({
          Bucket: cfg.bucket,
          Key: `${CONTACTS_PREFIX}${createHash('sha256').update(key).digest('hex')}.json`,
          Body: body,
          ContentType: 'application/json; charset=utf-8',
        }),
      );
      countCache = null;
    } catch (err) {
      console.error('[leads-store] заявка сохранена, но контакт не записан:', err);
    }
  }

  return true;
}

let countCache: { value: number; at: number } | null = null;

async function count(): Promise<number> {
  const cfg = s3Config();
  if (!cfg) return 0;

  const now = Date.now();
  if (countCache && now - countCache.at < COUNT_TTL_MS) return countCache.value;

  const s3 = s3Client(cfg);
  let total = 0;
  let token: string | undefined;

  try {
    do {
      const page = await s3.send(
        new ListObjectsV2Command({
          Bucket: cfg.bucket,
          Prefix: CONTACTS_PREFIX,
          ContinuationToken: token,
        }),
      );
      total += page.KeyCount ?? 0;
      token = page.IsTruncated ? page.NextContinuationToken : undefined;
    } while (token);
  } catch (err) {
    console.error('[leads-store] не удалось сосчитать заявки в S3:', err);
    // Последнее известное значение лучше нуля: ноль означал бы «мест 100»
    // и обещал бы очередь, которой нет.
    return countCache?.value ?? 0;
  }

  countCache = { value: total, at: now };
  return total;
}

/**
 * Все заявки из истории. Читает каждый объект префикса events/ — операция
 * дорогая, поэтому вызывается только при пересборке таблицы-зеркала.
 */
async function list(): Promise<StoredLead[]> {
  const cfg = s3Config();
  if (!cfg) return [];

  const s3 = s3Client(cfg);
  const keys: string[] = [];
  let token: string | undefined;

  try {
    do {
      const page = await s3.send(
        new ListObjectsV2Command({
          Bucket: cfg.bucket,
          Prefix: EVENTS_PREFIX,
          ContinuationToken: token,
        }),
      );
      for (const item of page.Contents ?? []) {
        if (item.Key) keys.push(item.Key);
      }
      token = page.IsTruncated ? page.NextContinuationToken : undefined;
    } while (token);

    const leads: StoredLead[] = [];
    for (const Key of keys) {
      const obj = await s3.send(new GetObjectCommand({ Bucket: cfg.bucket, Key }));
      const body = await obj.Body?.transformToString();
      if (!body) continue;
      try {
        leads.push(JSON.parse(body) as StoredLead);
      } catch {
        // Битый объект пропускаем — остальные заявки важнее.
      }
    }
    return leads;
  } catch (err) {
    console.error('[leads-store] не удалось выгрузить заявки из S3:', err);
    return [];
  }
}

export const s3Driver: LeadsDriver = { append, count, list };
