import { NextRequest } from 'next/server';
import { z } from 'zod';
import { postToInternalApi } from '@/lib/internal-api';

const schema = z.object({
  slug: z.string().min(1),
  filename: z.string().min(1).regex(/^[\w\-\.]+$/, 'Invalid filename'),
  email: z.string().email(),
  role: z.enum(['prorab', 'pto', 'smetchik', 'other']).optional(),
  newsletterConsent: z.boolean().optional(),
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

  const { slug, filename, email, role, newsletterConsent } = parsed.data;

  // Отправляем лид в основное приложение — fire-and-forget, не блокируем скачивание.
  // Тот же клиент, что и в /lead и /newsletter (читает env, ставит Authorization).
  void postToInternalApi('/leads', {
    email,
    role,
    source: 'template_download',
    newsletterConsent,
    metadata: { template: slug },
  }).then((result) => {
    // not_configured — штатно для окружений без API, логируем только реальные сбои.
    if (!result.ok && result.reason === 'error') {
      console.error('[api/template-download] lead dispatch failed');
    }
  });

  return Response.json({ downloadUrl: `/shablony-files/${filename}` });
}
