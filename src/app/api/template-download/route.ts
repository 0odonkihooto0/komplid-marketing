import { NextRequest } from 'next/server';
import { z } from 'zod';

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

  // Отправляем лид в основное приложение — fire-and-forget, не блокируем скачивание
  const apiUrl = process.env.INTERNAL_API_URL;
  const apiToken = process.env.INTERNAL_API_TOKEN;
  if (apiUrl && apiToken) {
    fetch(`${apiUrl}/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify({
        email,
        role,
        source: 'template_download',
        newsletterConsent,
        metadata: { template: slug },
      }),
    }).catch(() => {});
  }

  return Response.json({ downloadUrl: `/shablony-files/${filename}` });
}
