import ExcelJS from 'exceljs';
import type { StoredLead } from './types';

/**
 * Построение таблицы заявок. Только формат, без транспорта: где лежит файл —
 * дело вызывающего модуля (`s3-sheet.ts`).
 *
 * Зачем таблица вообще: разбирать заявки объектами JSON в хранилище неудобно.
 * Владелец открывает один файл в Excel или Яндекс Документах и видит всё
 * поштучно — почта, дата, откуда пришёл, на какую редакцию политики согласился.
 */

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

/** Пустая книга с шапкой: закреплённая первая строка, жирные заголовки. */
export function startWorkbook(workbook: ExcelJS.Workbook): ExcelJS.Workbook {
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
 * в скачанную таблицу пустую строку — заявка молча терялась.
 */
export function toRow(lead: StoredLead): string[] {
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

/** Готовая книга со всеми заявками, отсортированными по времени. */
export function buildWorkbook(leads: StoredLead[]): ExcelJS.Workbook {
  const workbook = startWorkbook(new ExcelJS.Workbook());
  const sheet = workbook.worksheets[0];
  if (!sheet) throw new Error('таблица заявок: не удалось создать лист');

  const sorted = [...leads].sort(
    (a, b) => new Date(a.receivedAt).getTime() - new Date(b.receivedAt).getTime(),
  );
  for (const lead of sorted) sheet.addRow(toRow(lead));
  return workbook;
}
