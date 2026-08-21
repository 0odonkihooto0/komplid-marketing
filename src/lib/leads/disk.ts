import { appendFile, mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { envOr } from '../env';
import { contactKey, type LeadsDriver, type StoredLead } from './types';

/**
 * Файловое хранилище заявок — JSONL на диске сайта.
 *
 * Используется, когда S3 не настроен: локальная разработка, тесты и запасной
 * путь на собственном VDS (там каталог примонтирован томом, см.
 * docker-compose.prod.yml). На Timeweb App Platform так работать нельзя —
 * контейнер эфемерный, файл умирает на каждом деплое.
 */

// Путь читаем при каждом вызове, а не при импорте модуля: значение, снятое один раз
// на этапе загрузки, невозможно переопределить ни в тестах, ни при смене конфигурации.
function dataDir(): string {
  return envOr(process.env.LEADS_DATA_DIR, path.join(process.cwd(), '.data'));
}

/**
 * Дописывает заявку в JSONL. Одна строка — одна заявка: формат переживает
 * конкурентную дозапись и не требует читать и разбирать весь файл ради
 * одной новой записи.
 */
async function append(record: StoredLead): Promise<boolean> {
  try {
    const dir = dataDir();
    await mkdir(dir, { recursive: true });
    await appendFile(path.join(dir, 'leads.jsonl'), `${JSON.stringify(record)}\n`, 'utf8');
    return true;
  } catch (err) {
    console.error('[leads-store] не удалось записать заявку на диск:', err);
    return false;
  }
}

/**
 * Сколько уникальных контактов уже в файле.
 *
 * Файла может не быть (свежий том, никто ещё не записался) — это ноль,
 * а не ошибка.
 */
async function count(): Promise<number> {
  try {
    const raw = await readFile(path.join(dataDir(), 'leads.jsonl'), 'utf8');
    const contacts = new Set<string>();

    for (const line of raw.split('\n')) {
      if (!line.trim()) continue;
      try {
        const lead = JSON.parse(line) as Partial<StoredLead>;
        const key = contactKey(lead);
        if (key) contacts.add(key);
      } catch {
        // Битую строку пропускаем: она не должна ронять счётчик целиком.
      }
    }

    return contacts.size;
  } catch {
    return 0;
  }
}

/** Все заявки из файла. Битые строки пропускаются, а не роняют выгрузку. */
async function list(): Promise<StoredLead[]> {
  try {
    const raw = await readFile(path.join(dataDir(), 'leads.jsonl'), 'utf8');
    const leads: StoredLead[] = [];
    for (const line of raw.split('\n')) {
      if (!line.trim()) continue;
      try {
        leads.push(JSON.parse(line) as StoredLead);
      } catch {
        // Битую строку пропускаем.
      }
    }
    return leads;
  } catch {
    return [];
  }
}

export const diskDriver: LeadsDriver = { append, count, list };
