import { NextRequest } from 'next/server';
import { z } from 'zod';
import { postToInternalApi } from '@/lib/internal-api';

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

  const result = await postToInternalApi('/newsletter', parsed.data);
  if (!result.ok) {
    if (result.reason === 'not_configured') {
      console.error('[api/newsletter] INTERNAL_API_URL or INTERNAL_API_TOKEN not set — subscription lost');
      return Response.json({ error: 'API not configured' }, { status: 500 });
    }
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }

  return Response.json({ success: true });
}
