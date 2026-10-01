import { SITEMAP_SECTIONS, getSitemapSection, renderUrlset, sectionFromFile } from '@/lib/sitemap';

// Файл раздела: /sitemaps/blog.xml, /sitemaps/normativ.xml и т.д.
// Все собираются на этапе сборки; неизвестное имя — 404.
export const dynamicParams = false;

export function generateStaticParams(): Array<{ file: string }> {
  return SITEMAP_SECTIONS.map((section) => ({ file: `${section}.xml` }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ file: string }> },
): Promise<Response> {
  const section = sectionFromFile((await params).file);
  if (!section) return new Response('Not found', { status: 404 });
  return new Response(renderUrlset(await getSitemapSection(section)), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
