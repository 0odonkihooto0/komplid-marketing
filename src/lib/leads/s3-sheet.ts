import ExcelJS from 'exceljs';
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { envOr } from '../env';
import { s3Client, s3Config } from './s3';
import { buildWorkbook, startWorkbook, toRow } from './sheet';
import type { StoredLead } from './types';

/**
 * Зеркало заявок таблицей XLSX в том же бакете, где лежат сами заявки.
 *
 * Зачем: объекты JSON в `leads/events/` — источник правды, но читать их глазами
 * невозможно. Рядом лежит один файл, который открывается в Excel: зайти
 * в панель хранилища, скачать, посмотреть. Отдельный сервис для этого не нужен —
 * бакет уже есть, ключи уже есть, данные не покидают периметр и остаются в РФ
 * (ч. 5 ст. 18 152-ФЗ и обещание «данные в РФ» в подвале каждой страницы).
 *
 * Это именно **зеркало**, а не хранилище: если запись файла не удалась, заявка
 * уже сохранена в `leads/events/`, а таблицу можно собрать заново — POST
 * на `/api/leads-sheet`.
 */

/** Ключ файла в бакете. Латиницей: кириллица в именах объектов ломает выгрузку. */
export function sheetKey(): string {
  return envOr(process.env.S3_SHEET_KEY, 'leads/zayavki.xlsx');
}

const XLSX_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

/**
 * Читает существующую таблицу. Отсутствие файла — штатное начало жизни таблицы,
 * а не ошибка: до первой заявки его нет.
 */
async function readWorkbook(): Promise<ExcelJS.Workbook> {
  const cfg = s3Config();
  if (!cfg) throw new Error('таблица заявок: S3 не настроен');

  const workbook = new ExcelJS.Workbook();
  let body: Uint8Array | undefined;

  try {
    const obj = await s3Client(cfg).send(
      new GetObjectCommand({ Bucket: cfg.bucket, Key: sheetKey() }),
    );
    body = await obj.Body?.transformToByteArray();
  } catch (err) {
    // NoSuchKey — файла ещё нет. Любую другую ошибку (доступ, сеть) глушить
    // нельзя: иначе пустая книга затрёт таблицу, которая на самом деле есть.
    const name = (err as { name?: string })?.name;
    if (name !== 'NoSuchKey' && name !== 'NotFound') throw err;
  }

  if (!body?.length) return startWorkbook(workbook);

  // Именно Node-Buffer: от голого ArrayBuffer exceljs молча возвращает пустую
  // книгу, и очередная заявка затирала бы всё, что было в таблице до неё.
  // Приведение нужно потому, что exceljs объявляет собственный тип Buffer.
  type LoadArg = Parameters<typeof workbook.xlsx.load>[0];
  await workbook.xlsx.load(Buffer.from(body) as unknown as LoadArg);

  // Файл могли подменить или удалить лист — тогда начинаем заново,
  // данные всё равно есть в основном хранилище.
  return workbook.worksheets.length > 0 ? workbook : startWorkbook(new ExcelJS.Workbook());
}

async function upload(workbook: ExcelJS.Workbook): Promise<void> {
  const cfg = s3Config();
  if (!cfg) throw new Error('таблица заявок: S3 не настроен');

  const body = await workbook.xlsx.writeBuffer();
  await s3Client(cfg).send(
    new PutObjectCommand({
      Bucket: cfg.bucket,
      Key: sheetKey(),
      Body: new Uint8Array(body as ArrayBuffer),
      ContentType: XLSX_TYPE,
      // Чтобы браузер предлагал сохранить файл под понятным именем, а не
      // открывал его как поток байтов при скачивании по ссылке из панели.
      ContentDisposition: 'attachment; filename="zayavki.xlsx"',
    }),
  );
}

/**
 * Дописывает заявку в таблицу.
 *
 * Дозаписи в объект S3 не существует: файл читается, дополняется и кладётся
 * целиком. При двух одновременных заявках строка может потеряться — в
 * `leads/events/` обе на месте, и `rebuildSheet` восстановит таблицу полностью.
 * На пре-лонче заявки идут поштучно, и гонка маловероятна.
 */
export async function appendToSheet(lead: StoredLead): Promise<boolean> {
  if (!s3Config()) return false;

  try {
    const workbook = await readWorkbook();
    const sheet = workbook.worksheets[0];
    if (!sheet) throw new Error('таблица заявок: в книге нет листа');
    sheet.addRow(toRow(lead));
    await upload(workbook);
    return true;
  } catch (err) {
    // Заявка уже в основном хранилище — сбой зеркала не должен ничего ронять.
    console.error('[leads-store] не удалось дописать заявку в таблицу:', err);
    return false;
  }
}

/**
 * Собирает таблицу заново из переданных заявок и перезаписывает файл.
 *
 * Нужен, когда таблица разошлась с хранилищем: запись не прошла или строку
 * потеряла гонка одновременных заявок.
 */
export async function rebuildSheet(leads: StoredLead[]): Promise<number> {
  if (!s3Config()) throw new Error('таблица заявок не настроена: нет S3_BUCKET и ключей');

  await upload(buildWorkbook(leads));
  return leads.length;
}
