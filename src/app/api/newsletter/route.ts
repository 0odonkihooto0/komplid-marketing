import { NextRequest } from 'next/server';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const schema = z.object({
  email: z.string().email(),
  tags: z.array(z.string()).optional(),
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
    return Response.json(
      { error: 'Validation error', issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const apiUrl = process.env.INTERNAL_API_URL;
  const apiToken = process.env.INTERNAL_API_TOKEN;

  if (!apiUrl || !apiToken) {
    console.warn('[api/newsletter] INTERNAL_API_URL or INTERNAL_API_TOKEN not set');
    return Response.json({ success: true });
  }

  let res: Response;
  try {
    res = await fetch(`${apiUrl}/newsletter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify(parsed.data),
    });
  } catch {
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }

  if (!res.ok) {
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }

  return Response.json({ success: true });
}
