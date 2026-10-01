import { renderSitemapIndex } from '@/lib/sitemap';

// Индекс разделов. Адрес /sitemap.xml прежний — он прописан в robots.txt
// и уже добавлен в Вебмастер и Search Console, менять его не нужно.
export const dynamic = 'force-static';

export async function GET(): Promise<Response> {
  return new Response(await renderSitemapIndex(), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
