import { getAllBlogPosts } from '@/content-loader/blog';
import { getAllTemplates } from '@/content-loader/shablony';
import { CALCULATORS } from '@/lib/calculators-data';
import { getAllNormativDocs } from '@/lib/normativ-data';
import { SP_CLAUSES, clauseUrl } from '@/lib/normativ-clauses';
import { DOC_FORMS } from '@/lib/formy-data';
import { GLOSSARY_TERMS } from '@/lib/glossariy-data';
import { XSD_SCHEMAS } from '@/lib/isup-data';
import { PAGE_UPDATED_AT } from '@/lib/sitemap-dates';

/**
 * Sitemap, разбитый по разделам: /sitemap.xml — индекс, /sitemaps/<раздел>.xml —
 * адреса раздела. Зачем дробить: в Search Console и Вебмастере видно, сколько
 * проиндексировано в каждом разделе отдельно, — а значит, видно, тянет ли корпус
 * СП (323 из ~430 адресов) вниз собственные страницы сайта.
 *
 * Хаб раздела лежит в одном файле со своими страницами.
 */

export const SITE_URL = 'https://komplid.ru';

/** Порядок — порядок файлов в индексе: сначала собственный контент, корпус СП в конце. */
export const SITEMAP_SECTIONS = [
  'osnovnoe',
  'blog',
  'shablony',
  'kalkulyator',
  'formy',
  'glossariy',
  'isup',
  'normativ-punkty',
  'normativ',
] as const;

export type SitemapSection = (typeof SITEMAP_SECTIONS)[number];

type ChangeFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface SitemapEntry {
  url: string;
  /** YYYY-MM-DD; нет даты — нет тега */
  lastModified?: string;
  changeFrequency: ChangeFrequency;
  priority: number;
}

/** YYYY-MM-DD из строки frontmatter или реестра. */
function toDay(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString().slice(0, 10);
}

/** Позднейшая из дат: ISO-даты сравниваются как строки. */
function latest(dates: Array<string | undefined>): string | undefined {
  return dates.filter((d): d is string => Boolean(d)).sort().at(-1);
}

/** Страница с датой из sitemap-dates.ts. */
function page(path: string, changeFrequency: ChangeFrequency, priority: number): SitemapEntry {
  return { url: `${SITE_URL}${path}`, lastModified: PAGE_UPDATED_AT[path], changeFrequency, priority };
}

/** Хаб меняется, когда в разделе появляется или правится страница: берём позднейшую дату. */
function hub(path: string, children: SitemapEntry[], changeFrequency: ChangeFrequency, priority: number): SitemapEntry[] {
  const own = page(path, changeFrequency, priority);
  own.lastModified = latest([own.lastModified, ...children.map((c) => c.lastModified)]);
  return [own, ...children];
}

export async function getSitemapSection(section: SitemapSection): Promise<SitemapEntry[]> {
  switch (section) {
    case 'osnovnoe': {
      // На главной — три свежие статьи: новая статья меняет и главную
      const posts = await getAllBlogPosts();
      const home = page('/', 'weekly', 1.0);
      home.url = `${SITE_URL}/`;
      home.lastModified = latest([home.lastModified, ...posts.map((p) => toDay(p.modifiedAt ?? p.publishedAt))]);
      return [
        home,
        page('/smetchik', 'monthly', 0.9),
        page('/pto', 'monthly', 0.9),
        page('/prorab', 'monthly', 0.9),
        page('/pricing', 'monthly', 0.8),
        page('/solutions/general-contractor', 'monthly', 0.7),
        page('/solutions/customer', 'monthly', 0.7),
        page('/solutions/technical-supervisor', 'monthly', 0.7),
        page('/solutions/designer', 'monthly', 0.7),
        page('/company/about', 'monthly', 0.5),
        page('/company/contact', 'monthly', 0.5),
        page('/legal/privacy', 'yearly', 0.3),
        page('/legal/terms', 'yearly', 0.3),
        page('/legal/oferta', 'yearly', 0.3),
      ];
    }
    case 'blog': {
      const posts = await getAllBlogPosts();
      return hub('/blog', posts.map((p) => ({
        url: `${SITE_URL}/blog/${p.slug}`,
        lastModified: toDay(p.modifiedAt ?? p.publishedAt),
        changeFrequency: 'monthly',
        priority: 0.6,
      })), 'daily', 0.8);
    }
    case 'shablony': {
      const templates = await getAllTemplates();
      return hub('/shablony', templates.map((t) => ({
        url: `${SITE_URL}/shablony/${t.slug}`,
        lastModified: toDay(t.publishedAt),
        changeFrequency: 'monthly',
        priority: 0.7,
      })), 'weekly', 0.8);
    }
    case 'kalkulyator':
      return hub('/kalkulyator', CALCULATORS.map((c) => page(`/kalkulyator/${c.slug}`, 'monthly', 0.7)), 'monthly', 0.7);
    case 'formy':
      return hub('/formy', DOC_FORMS.map((f) => page(`/formy/${f.slug}`, 'monthly', 0.7)), 'monthly', 0.8);
    case 'glossariy':
      return hub('/glossariy', GLOSSARY_TERMS.map((t) => page(`/glossariy/${t.slug}`, 'monthly', 0.6)), 'monthly', 0.7);
    case 'isup':
      return hub('/isup', XSD_SCHEMAS.map((s) => page(`/isup/${s.slug}`, 'monthly', 0.6)), 'monthly', 0.7);
    case 'normativ-punkty':
      // Разборы пунктов — собственный текст, в отличие от самих СП, поэтому отдельным файлом
      return SP_CLAUSES.map((c) => page(clauseUrl(c), 'yearly', 0.6));
    case 'normativ': {
      // тексты СП меняются только при пересборке корпуса → yearly
      const docs = await getAllNormativDocs();
      return hub('/normativ', docs.map((d) => ({
        url: `${SITE_URL}/normativ/${d.slug}`,
        lastModified: toDay(d.publishedAt),
        changeFrequency: 'yearly',
        priority: 0.6,
      })), 'weekly', 0.8);
    }
  }
}

export function sitemapFileUrl(section: SitemapSection): string {
  return `${SITE_URL}/sitemaps/${section}.xml`;
}

/** Раздел по имени файла `blog.xml`; чужое имя — null. */
export function sectionFromFile(file: string): SitemapSection | null {
  const id = file.endsWith('.xml') ? file.slice(0, -'.xml'.length) : '';
  return (SITEMAP_SECTIONS as readonly string[]).includes(id) ? (id as SitemapSection) : null;
}

const XML_HEAD = '<?xml version="1.0" encoding="UTF-8"?>\n';
const NS = 'http://www.sitemaps.org/schemas/sitemap/0.9';

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

export function renderUrlset(entries: SitemapEntry[]): string {
  const body = entries.map((e) => [
    '<url>',
    `<loc>${esc(e.url)}</loc>`,
    e.lastModified ? `<lastmod>${e.lastModified}</lastmod>` : '',
    `<changefreq>${e.changeFrequency}</changefreq>`,
    `<priority>${e.priority}</priority>`,
    '</url>',
  ].filter(Boolean).join('\n')).join('\n');
  return `${XML_HEAD}<urlset xmlns="${NS}">\n${body}\n</urlset>\n`;
}

/** Индекс: у каждого файла — дата самой свежей страницы в нём. */
export async function renderSitemapIndex(): Promise<string> {
  const items = await Promise.all(SITEMAP_SECTIONS.map(async (section) => {
    const lastmod = latest((await getSitemapSection(section)).map((e) => e.lastModified));
    return ['<sitemap>', `<loc>${esc(sitemapFileUrl(section))}</loc>`, lastmod ? `<lastmod>${lastmod}</lastmod>` : '', '</sitemap>']
      .filter(Boolean).join('\n');
  }));
  return `${XML_HEAD}<sitemapindex xmlns="${NS}">\n${items.join('\n')}\n</sitemapindex>\n`;
}
