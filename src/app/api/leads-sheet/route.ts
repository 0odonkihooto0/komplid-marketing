import { NextRequest } from 'next/server';
import { rebuildLeadsSheet } from '@/lib/leads-store';
import { rateLimit, clientKey, tooManyRequests } from '@/lib/rate-limit';

/**
 * Пересборка таблицы-зеркала (XLSX в бакете) из хранилища заявок.
 *
 * Когда нужна: запись файла не прошла или строку потеряла гонка двух
 * одновременных заявок — таблица разошлась с хранилищем. Роут читает все
 * заявки из `leads/events/` и перезаписывает таблицу целиком.
 *
 * Вызывать руками, изредка:
 *   curl -X POST https://komplid.ru/api/leads-sheet -H 'Authorization: Bearer <LEADS_ADMIN_TOKEN>'
 *
 * Защита — общий секрет, а не роль пользователя: на сайте нет ни входа,
 * ни сессий, а операция читает всю базу заявок и перезаписывает файл.
 * Без заданного LEADS_ADMIN_TOKEN роут выключен полностью: пустой секрет,
 * с которым сходится пустой заголовок, открыл бы базу наружу.
 */
export const dynamic = 'force-dynamic';

const LIMIT = { limit: 5, windowMs: 10 * 60_000 };

export async function POST(req: NextRequest) {
  const secret = process.env.LEADS_ADMIN_TOKEN?.trim();
  if (!secret) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  // Лимит и на верные, и на неверные попытки: иначе секрет перебирается.
  const limited = rateLimit(clientKey(req, 'leads-sheet'), LIMIT);
  if (!limited.ok) return tooManyRequests(limited.retryAfterSec);

  if (req.headers.get('authorization') !== `Bearer ${secret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const rows = await rebuildLeadsSheet();
    return Response.json({ success: true, rows });
  } catch (err) {
    console.error('[api/leads-sheet] пересборка таблицы не удалась:', err);
    return Response.json({ error: 'Не удалось пересобрать таблицу' }, { status: 500 });
  }
}
