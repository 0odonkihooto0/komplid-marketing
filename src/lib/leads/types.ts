/**
 * Что приходит из формы. Обязателен только source; контакт — почта или телефон,
 * хотя бы один (проверяет схема роута). Остальное свободно.
 */
export interface LeadInput {
  email?: string;
  phone?: string;
  source: string;
  [key: string]: unknown;
}

/** Что ложится в хранилище. Отдельный тип, а не Omit: Omit над типом с индексной
 *  сигнатурой «съедает» обязательные поля и перестаёт их проверять. */
export interface StoredLead extends LeadInput {
  receivedAt: string;
}

/**
 * Драйвер хранилища заявок. Их два: файл на диске и S3.
 *
 * `count` возвращает число уникальных контактов — по нему считается остаток мест
 * в бете на главной. Ошибка чтения не должна ронять страницу, поэтому драйверы
 * возвращают ноль вместо исключения.
 */
export interface LeadsDriver {
  append(record: StoredLead): Promise<boolean>;
  count(): Promise<number>;
  /**
   * Все заявки — для пересборки таблицы-зеркала на Яндекс.Диске.
   * Операция редкая и дорогая (в S3 это чтение каждого объекта), в обычном
   * потоке не вызывается.
   */
  list(): Promise<StoredLead[]>;
}

/**
 * Ключ, по которому заявки считаются за одного человека.
 *
 * Почта приводится к нижнему регистру, телефон — к одним цифрам: «+7 (999)
 * 123-45-67» и «89991234567» это один номер, и два места он занимать не должен.
 * Российские номера дополнительно сводим к виду 7XXXXXXXXXX — иначе тот же
 * номер, записанный с восьмёрки, посчитался бы вторым.
 */
export function contactKey(lead: Partial<StoredLead>): string | null {
  if (typeof lead.email === 'string' && lead.email.trim()) {
    return `email:${lead.email.trim().toLowerCase()}`;
  }
  if (typeof lead.phone === 'string') {
    let digits = lead.phone.replace(/\D/g, '');
    if (digits.length === 11 && digits.startsWith('8')) digits = `7${digits.slice(1)}`;
    if (digits.length === 10) digits = `7${digits}`;
    if (digits) return `phone:${digits}`;
  }
  return null;
}
