import ExcelJS from 'exceljs';
import { envOr } from '../env';
import type { StoredLead } from './types';

/**
 * Зеркало заявок в таблицу на Яндекс.Диске.
 *
 * Зачем: разбирать заявки в объектном хранилище неудобно — нужна таблица,
 * которая сама дополняется и открывается в Яндекс Документах или Excel.
 *
 * Почему Яндекс, а не Google Sheets: заявки — персональные данные, а часть 5
 * статьи 18 152-ФЗ требует вести их запись, накопление и хранение в базах
 * на территории РФ. Сайт вдобавок обещает «данные в РФ» в подвале каждой
 * страницы и в пункте 10.2 оферты. Google Sheets потребовал бы отдельного
 * уведомления Роскомнадзора о трансграничной передаче и снятия этих обещаний.
 *
 * Это именно **зеркало**, а не хранилище: источник правды — S3 или диск
 * (см. leads-store.ts), по нему же считается счётчик мест на главной.
 * Если Диск недоступен или токен протух, заявка всё равно сохранена,
 * а таблицу можно собрать заново из хранилища (`rebuildSheet`).
 */

const API = 'https://cloud-api.yandex.net/v1/disk';

/** Колонки таблицы. Порядок публичный: владелец смотрит её глазами. */
const COLUMNS: { header: string; key: string; width: number }[] = [
  { header: 'Дата и время', key: 'receivedAt', width: 20 },
  { header: 'Почта', key: 'email', width: 32 },
  { header: 'Телефон', key: 'phone', width: 18 },
  { header: 'Имя', key: 'name', width: 22 },
  { header: 'Компания', key: 'company', width: 26 },
  { header: 'Роль', key: 'role', width: 14 },
  { header: 'Откуда', key: 'source', width: 24 },
  { header: 'Ранний доступ', key: 'earlyAccess', width: 14 },
  { header: 'Согласие на рассылку', key: 'newsletterConsent', width: 20 },
  { header: 'Согласие на ПДн', key: 'pdConsent', width: 16 },
  { header: 'Редакция политики', key: 'pdConsentVersion', width: 18 },
  { header: 'Прочее', key: 'rest', width: 40 },
];

const KNOWN = new Set(COLUMNS.map((c) => c.key).filter((k) => k !== 'rest'));

interface DiskConfig {
  token: string;
  path: string;
}

/** Конфигурация читается при каждом обращении: тесты подменяют её на лету. */
export function diskConfig(): DiskConfig | null {
  const token = process.env.YANDEX_DISK_TOKEN?.trim();
  if (!token) return null;
  return {
    token,
    // Путь на Диске владельца. Папка создаётся при первой записи.
    path: envOr(process.env.YANDEX_DISK_PATH, 'disk:/Комплид/Заявки.xlsx'),
  };
}

function authHeaders(cfg: DiskConfig): HeadersInit {
  return { Authorization: `OAuth ${cfg.token}` };
}

/**
 * Ссылка на скачивание или загрузку. API Диска двухшаговый: сначала берём
 * одноразовый href, потом уже работаем с файлом по нему.
 */
async function href(cfg: DiskConfig, kind: 'download' | 'upload'): Promise<string | null> {
  const overwrite = kind === 'upload' ? '&overwrite=true' : '';
  const res = await fetch(`${API}/resources/${kind}?path=${encodeURIComponent(cfg.path)}${overwrite}`, {
    headers: authHeaders(cfg),
  });
  // 404 при скачивании — файла ещё нет, это штатное начало жизни таблицы.
  if (res.status === 404 && kind === 'download') return null;
  if (!res.ok) throw new Error(`Яндекс.Диск: ${kind} → HTTP ${res.status}`);
  const data = (await res.json()) as { href?: string };
  if (!data.href) throw new Error(`Яндекс.Диск: ${kind} без href`);
  return data.href;
}

/** Создаёт папку под файл. Существующая папка отвечает 409 — это не ошибка. */
async function ensureFolder(cfg: DiskConfig): Promise<void> {
  const folder = cfg.path.slice(0, cfg.path.lastIndexOf('/'));
  if (!folder || folder === 'disk:' || folder === 'app:') return;
  const res = await fetch(`${API}/resources?path=${encodeURIComponent(folder)}`, {
    method: 'PUT',
    headers: authHeaders(cfg),
  });
  if (!res.ok && res.status !== 409) {
    throw new Error(`Яндекс.Диск: создание папки → HTTP ${res.status}`);
  }
}

async function readWorkbook(cfg: DiskConfig): Promise<ExcelJS.Workbook> {
  const link = await href(cfg, 'download');
  const workbook = new ExcelJS.Workbook();

  if (!link) return startWorkbook(workbook);

  const res = await fetch(link);
  if (!res.ok) throw new Error(`Яндекс.Диск: скачивание → HTTP ${res.status}`);
  // Именно Buffer: от голого ArrayBuffer exceljs молча возвращает пустую книгу,
  // и очередная заявка затирала бы всё, что было в таблице до неё.
  // Именно Node-Buffer: от голого ArrayBuffer exceljs молча возвращает пустую
  // книгу, и очередная заявка затирала бы всё, что было в таблице до неё.
  // Приведение нужно потому, что exceljs объявляет собственный тип Buffer.
  type LoadArg = Parameters<typeof workbook.xlsx.load>[0];
  await workbook.xlsx.load(Buffer.from(await res.arrayBuffer()) as unknown as LoadArg);

  // Файл на Диске могли подменить или удалить лист — тогда начинаем заново,
  // данные всё равно есть в основном хранилище.
  return workbook.worksheets.length > 0 ? workbook : startWorkbook(new ExcelJS.Workbook());
}

function startWorkbook(workbook: ExcelJS.Workbook): ExcelJS.Workbook {
  const sheet = workbook.addWorksheet('Заявки', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });
  sheet.columns = COLUMNS;
  sheet.getRow(1).font = { bold: true };
  return workbook;
}

/**
 * Значения полей заявки **в порядке колонок**; неизвестные поля сводятся
 * в «Прочее».
 *
 * Массивом, а не объектом с ключами: при чтении готового файла exceljs
 * не восстанавливает `key` у колонок, и `addRow({ email: ... })` добавлял
 * в скачанную с Диска таблицу пустую строку — заявка молча терялась.
 */
function toRow(lead: StoredLead): string[] {
  const rest = Object.entries(lead)
    .filter(([key, value]) => !KNOWN.has(key) && value !== undefined && value !== null)
    .map(([key, value]) => `${key}: ${typeof value === 'object' ? JSON.stringify(value) : String(value)}`)
    .join('; ');

  const flag = (v: unknown) => (v === true ? 'да' : v === false ? 'нет' : '');
  const str = (v: unknown) => (typeof v === 'string' ? v : '');

  return [
    // Время в московской зоне: таблицу читает человек, а не машина.
    new Date(lead.receivedAt).toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' }),
    lead.email ?? '',
    lead.phone ?? '',
    str(lead['name']),
    str(lead['company']),
    str(lead['role']),
    lead.source,
    flag(lead['earlyAccess']),
    flag(lead['newsletterConsent']),
    flag(lead['pdConsent']),
    str(lead['pdConsentVersion']),
    rest,
  ];
}

async function upload(cfg: DiskConfig, workbook: ExcelJS.Workbook): Promise<void> {
  await ensureFolder(cfg);
  const link = await href(cfg, 'upload');
  if (!link) throw new Error('Яндекс.Диск: не получен адрес загрузки');

  const body = await workbook.xlsx.writeBuffer();
  const res = await fetch(link, {
    method: 'PUT',
    body: body as ArrayBuffer,
    headers: { 'Content-Type': 'application/octet-stream' },
  });
  if (!res.ok) throw new Error(`Яндекс.Диск: загрузка → HTTP ${res.status}`);
}

/**
 * Дописывает заявку в таблицу.
 *
 * Дозаписи в файл на Диске не существует: файл скачивается, дополняется
 * и заливается целиком. При двух одновременных заявках одна строка в таблице
 * может потеряться — в хранилище обе на месте, и `rebuildSheet` восстановит
 * таблицу полностью. На пре-лонче заявки идут поштучно, и гонка маловероятна.
 */
export async function appendToSheet(lead: StoredLead): Promise<boolean> {
  const cfg = diskConfig();
  if (!cfg) return false;

  try {
    const workbook = await readWorkbook(cfg);
    const sheet = workbook.worksheets[0];
    if (!sheet) throw new Error('Яндекс.Диск: в книге нет листа');
    sheet.addRow(toRow(lead));
    await upload(cfg, workbook);
    return true;
  } catch (err) {
    // Заявка уже в основном хранилище — сбой зеркала не должен ничего ронять.
    console.error('[leads-store] не удалось дописать заявку в таблицу на Диске:', err);
    return false;
  }
}

/**
 * Собирает таблицу заново из переданных заявок и перезаписывает файл.
 *
 * Нужен, когда таблица разошлась с хранилищем: Диск был недоступен, токен
 * протух или строку потеряла гонка одновременных заявок.
 */
export async function rebuildSheet(leads: StoredLead[]): Promise<number> {
  const cfg = diskConfig();
  if (!cfg) throw new Error('Яндекс.Диск не настроен: нет YANDEX_DISK_TOKEN');

  const workbook = startWorkbook(new ExcelJS.Workbook());
  const sheet = workbook.worksheets[0];
  if (!sheet) throw new Error('Яндекс.Диск: не удалось создать лист');

  const sorted = [...leads].sort(
    (a, b) => new Date(a.receivedAt).getTime() - new Date(b.receivedAt).getTime(),
  );
  for (const lead of sorted) sheet.addRow(toRow(lead));

  await upload(cfg, workbook);
  return sorted.length;
}
