import { appendFile, mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';

/**
 * Локальное хранилище лидов — JSONL-файл на диске сайта.
 *
 * Зачем: до запуска app.komplid.ru приложение недоступно, и раньше `/api/lead`
 * при недоступном INTERNAL_API_URL отдавал 500 — лид просто терялся. На пре-лонче
 * сбор базы и есть главная задача сайта (PROMOTION_STRATEGY §3), терять лиды нельзя.
 *
 * Поэтому порядок такой: сначала пишем к себе, потом best-effort отправляем дальше.
 * Успех для пользователя = запись легла на диск.
 *
 * Каталог должен быть примонтирован томом (docker-compose.prod.yml), иначе файл
 * умрёт при первой пересборке образа — deploy.sh пересобирает его каждый раз.
 */

// Путь читаем при каждом вызове, а не при импорте модуля: значение, снятое один раз
// на этапе загрузки, невозможно переопределить ни в тестах, ни при смене конфигурации.
function dataDir(): string {
  return process.env.LEADS_DATA_DIR ?? path.join(process.cwd(), '.data');
}

/** Что приходит из формы: email и source обязательны, остальное свободно. */
export interface LeadInput {
  email: string;
  source: string;
  [key: string]: unknown;
}

/** Что ложится в файл. Отдельный тип, а не Omit: Omit над типом с индексной
 *  сигнатурой «съедает» обязательные поля и перестаёт их проверять. */
export interface StoredLead extends LeadInput {
  receivedAt: string;
}

/**
 * Дописывает лид в JSONL. Одна строка — один лид: формат переживает конкурентную
 * дозапись и не требует читать и разбирать весь файл ради одной новой записи.
 */
export async function appendLead(lead: LeadInput): Promise<boolean> {
  try {
    const dir = dataDir();
    await mkdir(dir, { recursive: true });
    // receivedAt после спреда — чтобы данными из формы его нельзя было подменить.
    const record: StoredLead = { ...lead, receivedAt: new Date().toISOString() };
    await appendFile(path.join(dir, 'leads.jsonl'), `${JSON.stringify(record)}\n`, 'utf8');
    return true;
  } catch (err) {
    console.error('[leads-store] не удалось записать лид на диск:', err);
    return false;
  }
}

/**
 * Сколько заявок в очереди раннего доступа уже лежит.
 *
 * Нужно для счётчика мест на главной. Показывать выдуманное число нельзя —
 * это недостоверные сведения по ст. 5 ФЗ «О рекламе» (CLAUDE.md §21), поэтому
 * считаем реальные строки файла. Уникальность по почте: один человек, дважды
 * заполнивший форму, не должен съедать два места.
 *
 * Файла может не быть (свежий том, никто ещё не записался) — это ноль, а не ошибка.
 */
export async function countWaitlistLeads(): Promise<number> {
  try {
    const raw = await readFile(path.join(dataDir(), 'leads.jsonl'), 'utf8');
    const emails = new Set<string>();

    for (const line of raw.split('\n')) {
      if (!line.trim()) continue;
      try {
        const lead = JSON.parse(line) as Partial<StoredLead>;
        if (typeof lead.email === 'string') emails.add(lead.email.trim().toLowerCase());
      } catch {
        // Битую строку пропускаем: она не должна ронять счётчик целиком.
      }
    }

    return emails.size;
  } catch {
    return 0;
  }
}

/**
 * Дублирует лид в Telegram, чтобы владелец видел заявки сразу, а не при разборе файла.
 * Полностью необязательно: без переменных окружения тихо пропускаем.
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
    // Уведомление — не критичный путь: лид уже на диске.
    console.error('[leads-store] Telegram-уведомление не ушло:', err);
  }
}
