import { NextRequest } from 'next/server';
import { z } from 'zod';
import { postToInternalApi } from '@/lib/internal-api';
import { appendLead, notifyTelegram } from '@/lib/leads-store';

const schema = z.object({
  slug: z.string().min(1),
  filename: z.string().min(1).regex(/^[\w\-\.]+$/, 'Invalid filename'),
  email: z.string().email(),
  role: z.enum(['prorab', 'pto', 'smetchik', 'other']).optional(),
  newsletterConsent: z.boolean().optional(),
  earlyAccess: z.boolean().optional(),
  // Согласие на обработку ПДн — отдельно от newsletterConsent (подписка).
  // Необязательные: клиент с закэшированной страницей не должен терять лид.
  pdConsent: z.boolean().optional(),
  pdConsentVersion: z.string().optional(),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: 'Validation error', issues: parsed.error.issues }, { status: 400 });
  }

  const { slug, filename, email, role, newsletterConsent, earlyAccess, pdConsent, pdConsentVersion } =
    parsed.data;

  const lead = {
    email,
    role,
    source: earlyAccess ? 'template_download+waitlist' : 'template_download',
    newsletterConsent,
    earlyAccess,
    pdConsent,
    pdConsentVersion,
    metadata: { template: slug },
  };

  // Сначала пишем лид к себе. Скачивания шаблонов — основной лид-магнит пре-лонча
  // (PROMOTION_STRATEGY §4.2), а приложение до запуска недоступно: раньше такой лид
  // просто исчезал в fire-and-forget-запросе.
  await appendLead(lead);

  // Пересылка в приложение — по-прежнему fire-and-forget: скачивание не ждёт сети.
  void postToInternalApi('/leads', lead).then((result) => {
    // not_configured — штатно для окружений без API, логируем только реальные сбои.
    if (!result.ok && result.reason === 'error') {
      console.error('[api/template-download] lead dispatch failed');
    }
  });

  if (earlyAccess) {
    void notifyTelegram(`Ранний доступ (из шаблона ${slug})\n${email}`);
  }

  return Response.json({ downloadUrl: `/shablony-files/${filename}` });
}
