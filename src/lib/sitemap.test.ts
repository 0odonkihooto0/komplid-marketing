import { describe, it, expect } from 'vitest';
import {
  SITE_URL,
  SITEMAP_SECTIONS,
  getSitemapSection,
  renderSitemapIndex,
  renderUrlset,
  sectionFromFile,
  type SitemapEntry,
} from './sitemap';
import { PAGE_UPDATED_AT } from './sitemap-dates';

async function allSections(): Promise<Array<[string, SitemapEntry[]]>> {
  return Promise.all(SITEMAP_SECTIONS.map(async (s) => [s, await getSitemapSection(s)] as [string, SitemapEntry[]]));
}

describe('разделы sitemap', () => {
  it('каждый раздел непустой, адреса только наши и не повторяются между файлами', async () => {
    const seen = new Set<string>();
    for (const [section, entries] of await allSections()) {
      expect(entries.length, section).toBeGreaterThan(0);
      for (const e of entries) {
        expect(e.url.startsWith(`${SITE_URL}/`), e.url).toBe(true);
        expect(seen.has(e.url), `дубль ${e.url}`).toBe(false);
        seen.add(e.url);
      }
    }
    // Корпус СП целиком плюс собственные страницы: число не должно тихо просесть
    expect(seen.size).toBeGreaterThanOrEqual(427);
  });

  it('у каждой страницы есть дата — новая страница без строки в sitemap-dates.ts не пройдёт', async () => {
    for (const [, entries] of await allSections()) {
      for (const e of entries) {
        expect(e.lastModified, `нет даты у ${e.url} — добавьте её в src/lib/sitemap-dates.ts`).toMatch(
          /^\d{4}-\d{2}-\d{2}$/,
        );
      }
    }
  });

  it('даты не из будущего и не зависят от момента сборки', async () => {
    const today = new Date().toISOString().slice(0, 10);
    const first = await allSections();
    for (const [, entries] of first) {
      for (const e of entries) expect(e.lastModified! <= today, e.url).toBe(true);
    }
    const second = await allSections();
    expect(second).toEqual(first);
  });

  it('в sitemap-dates.ts нет строк для удалённых страниц', async () => {
    const urls = new Set((await allSections()).flatMap(([, entries]) => entries.map((e) => e.url)));
    for (const path of Object.keys(PAGE_UPDATED_AT)) {
      expect(urls.has(`${SITE_URL}${path}`), `лишняя строка ${path}`).toBe(true);
    }
  });

  it('хаб раздела не старше своих страниц', async () => {
    for (const section of ['blog', 'shablony', 'kalkulyator', 'formy', 'glossariy', 'isup', 'normativ'] as const) {
      const [hubEntry, ...children] = await getSitemapSection(section);
      expect(hubEntry!.url).toBe(`${SITE_URL}/${section}`);
      for (const c of children) expect(hubEntry!.lastModified! >= c.lastModified!, c.url).toBe(true);
    }
  });

  it('главная — с косой чертой, как в её canonical', async () => {
    const [home] = await getSitemapSection('osnovnoe');
    expect(home!.url).toBe(`${SITE_URL}/`);
  });
});

describe('sectionFromFile', () => {
  it('узнаёт разделы и отвергает чужие имена', () => {
    expect(sectionFromFile('blog.xml')).toBe('blog');
    expect(sectionFromFile('normativ-punkty.xml')).toBe('normativ-punkty');
    expect(sectionFromFile('blog')).toBeNull();
    expect(sectionFromFile('secret.xml')).toBeNull();
    expect(sectionFromFile('.xml')).toBeNull();
  });
});

describe('XML', () => {
  it('urlset экранирует спецсимволы и опускает пустую дату', () => {
    const xml = renderUrlset([
      { url: `${SITE_URL}/a?x=1&y=2`, changeFrequency: 'monthly', priority: 0.5 },
      { url: `${SITE_URL}/b`, lastModified: '2026-08-17', changeFrequency: 'yearly', priority: 0.6 },
    ]);
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('<loc>https://komplid.ru/a?x=1&amp;y=2</loc>');
    expect(xml.match(/<lastmod>/g)).toHaveLength(1);
    expect(xml).toContain('<lastmod>2026-08-17</lastmod>');
  });

  it('индекс перечисляет все разделы с датой', async () => {
    const xml = await renderSitemapIndex();
    expect(xml).toContain('<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    for (const s of SITEMAP_SECTIONS) expect(xml).toContain(`<loc>${SITE_URL}/sitemaps/${s}.xml</loc>`);
    expect(xml.match(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g)).toHaveLength(SITEMAP_SECTIONS.length);
  });
});
