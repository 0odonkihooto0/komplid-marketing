import { NextRequest } from 'next/server';
import { z } from 'zod';
import { postToInternalApi } from '@/lib/internal-api';
import { appendLead, notifyTelegram } from '@/lib/leads-store';
import { rateLimit, clientKey, tooManyRequests } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const schema = z.object({
  // Контакт: почта или телефон — хотя бы один, проверка ниже в .refine().
  // Форма раннего доступа даёт выбрать, куда отвечать; требовать почту
  // от человека, который оставил номер, значит потерять заявку.
  email: z.string().email().optional(),
  name: z.string().optional(),
  // Свободная строка: номера пишут и через +7, и через 8, и со скобками.
  // Жёсткая маска здесь отсекала бы живые заявки ради красоты хранилища.
  phone: z.string().trim().min(6).max(32).optional(),
  company: z.string().optional(),
  role: z.enum(['director', 'pto', 'prorab', 'smetchik', 'sk', 'other']).optional(),
  interest: z.string().optional(),
  source: z.string().min(1),
  // Факт согласия на обработку ПДн и редакция политики, на которую человек
  // соглашался. Не обязательные в схеме: старые клиенты с закэшированной
  // страницей продолжают присылать лиды без этих полей, терять их нельзя.
  pdConsent: z.boolean().optional(),
  pdConsentVersion: z.string().optional(),
  utm: z.record(z.string(), z.string()).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})
  .refine((d) => Boolean(d.email || d.phone), {
    message: 'Нужна почта или телефон',
    path: ['email'],
  });

/**
 * Приём лида.
 *
 * Порядок важен: сначала пишем лид на диск сайта, и только потом пытаемся
 * переслать его в приложение. До запуска app.komplid.ru приложение недоступно —
 * раньше в этом случае хендлер отдавал 500 и лид терялся безвозвратно, хотя сбор
 * базы и есть главная задача пре-лонча.
 *
 * 500 отдаём только если лид не удалось сохранить вообще нигде — тогда
 * пользователю честно предлагаем повторить.
 */
// Заявку человек отправляет раз, ну два. Десять за десять минут с одного
// адреса — уже скрипт, а он набивает и базу, и счётчик мест на главной.
const LIMIT = { limit: 10, windowMs: 10 * 60_000 };

export async function POST(req: NextRequest) {
  const limited = rateLimit(clientKey(req, 'lead'), LIMIT);
  if (!limited.ok) return tooManyRequests(limited.retryAfterSec);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: 'Validation error', issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const lead = parsed.data;

  const stored = await appendLead(lead);

  // Пересылка в приложение и уведомление — best-effort: их сбой не должен
  // отражаться на пользователе, лид уже у нас.
  const forwarded = await postToInternalApi('/leads', lead);
  if (!forwarded.ok) {
    console.warn(
      `[api/lead] лид ${lead.email ?? lead.phone} не ушёл в приложение (${forwarded.reason}), ` +
        `сохранён локально: ${stored}`,
    );
  }

  await notifyTelegram(
    `Новый лид · ${lead.source}\n${lead.email ?? lead.phone ?? '—'}` +
      (lead.role ? `\nроль: ${lead.role}` : '') +
      (lead.company ? `\nкомпания: ${lead.company}` : ''),
  );

  if (!stored && !forwarded.ok) {
    return Response.json({ error: 'Не удалось сохранить заявку' }, { status: 500 });
  }

  return Response.json({ success: true });
}
