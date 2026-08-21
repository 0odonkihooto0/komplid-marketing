import { diskDriver } from './leads/disk';
import { s3Driver, s3Config } from './leads/s3';
import { contactKey, type LeadInput, type StoredLead } from './leads/types';

/**
 * Хранилище заявок сайта.
 *
 * Зачем оно вообще: до запуска app.komplid.ru приложение недоступно, и раньше
 * `/api/lead` при недоступном INTERNAL_API_URL отдавал 500 — заявка терялась.
 * На пре-лонче сбор базы и есть главная задача сайта (PROMOTION_STRATEGY §3).
 * Поэтому порядок такой: сначала пишем к себе, потом best-effort отправляем
 * дальше. Успех для пользователя = запись легла в хранилище.
 *
 * Драйвер выбирается по конфигурации, а не по флагу окружения:
 *  · заданы S3_BUCKET и ключи → S3 (основной прод — Timeweb App Platform,
 *    где контейнер эфемерный и файл не переживает деплой);
 *  · не заданы → файл на диске (локальная разработка, тесты, запасной путь
 *    на собственном VDS с примонтированным томом).
 */

export type { LeadInput, StoredLead };
export { contactKey };

function driver() {
  return s3Config() ? s3Driver : diskDriver;
}

/** Сохраняет заявку. Возвращает false, только если не удалось записать вообще. */
export async function appendLead(lead: LeadInput): Promise<boolean> {
  // receivedAt после спреда — чтобы данными из формы его нельзя было подменить.
  const record: StoredLead = { ...lead, receivedAt: new Date().toISOString() };
  return driver().append(record);
}

/**
 * Сколько мест в очереди раннего доступа уже занято.
 *
 * Нужно для счётчика на главной. Показывать выдуманное число нельзя — это
 * недостоверные сведения по ст. 5 ФЗ «О рекламе» (CLAUDE.md §21), поэтому
 * считаем реальные заявки. Уникальность по контакту: один человек, дважды
 * заполнивший форму, не должен съедать два места.
 *
 * Заявка без почты, но с телефоном — тоже занятое место: считаем по контакту,
 * какой бы он ни был, иначе счётчик занижал бы очередь и обещал места, которых нет.
 */
export async function countWaitlistLeads(): Promise<number> {
  return driver().count();
}

/**
 * Дублирует заявку в Telegram, чтобы владелец видел её сразу, а не при разборе
 * хранилища. Полностью необязательно: без переменных окружения тихо пропускаем.
 */
export async function notifyTelegram(text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
    });
  } catch (err) {
    // Уведомление — не критичный путь: заявка уже в хранилище.
    console.error('[leads-store] Telegram-уведомление не ушло:', err);
  }
}
