import { describe, it, expect } from 'vitest';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

/**
 * Согласованность каталога шаблонов с файлами на диске.
 *
 * Тест появился после того, как все пять бланков пролежали в репозитории
 * нулевого размера: страницы работали, форма собирала почту, а по кнопке
 * «Скачать» приходил пустой .docx. Отдать пустышку в обмен на контакт хуже,
 * чем не показывать кнопку вовсе, — и заметить это можно было только руками.
 *
 * Заодно ловится расхождение заявленного формата и размера с реальным файлом:
 * их пишут во фронтматтере руками, а файл потом меняют.
 */

const CONTENT_DIR = path.join(process.cwd(), 'content', 'shablony');
const FILES_DIR = path.join(process.cwd(), 'public', 'shablony-files');

interface Entry {
  slug: string;
  filename: string;
  format: string;
  formats?: string[];
  size: string;
  category: string;
  title: string;
}

async function templates(): Promise<Entry[]> {
  const files = (await readdir(CONTENT_DIR)).filter((f) => f.endsWith('.mdx') && !f.startsWith('_'));
  return Promise.all(
    files.map(async (file) => {
      const { data } = matter(await readFile(path.join(CONTENT_DIR, file), 'utf8'));
      return { ...(data as Omit<Entry, 'slug'>), slug: (data['slug'] as string) ?? file.replace(/\.mdx$/, '') };
    }),
  );
}

/** «18 КБ» → 18. Размер во фронтматтере пишется по-русски, с неразрывным пробелом. */
function declaredKb(size: string): number | null {
  const m = size.replace(/ /g, ' ').match(/([\d\s]+)\s*КБ/i);
  return m?.[1] ? Number(m[1].replace(/\s/g, '')) : null;
}

const all = await templates();

describe('шаблоны и файлы', () => {
  it('каталог не пуст', () => {
    expect(all.length).toBeGreaterThan(0);
  });

  it.each(all.map((t) => [t.slug, t] as const))('%s — файл на месте и не пуст', async (_slug, tpl) => {
    const file = path.join(FILES_DIR, tpl.filename);
    const info = await stat(file).catch(() => null);

    expect(info, `нет файла ${tpl.filename}`).not.toBeNull();
    expect(info?.size ?? 0, `${tpl.filename} пустой`).toBeGreaterThan(1024);
  });

  it.each(all.map((t) => [t.slug, t] as const))('%s — формат совпадает с расширением', (_slug, tpl) => {
    const ext = path.extname(tpl.filename).replace('.', '').toLowerCase();
    expect(tpl.format.toLowerCase()).toBe(ext);
    // formats перечисляет то, что реально доступно к скачиванию. Раньше там
    // стоял XLSX у документов, которых в формате xlsx не существует.
    if (tpl.formats) expect(tpl.formats.map((f) => f.toLowerCase())).toContain(ext);
  });

  it.each(all.map((t) => [t.slug, t] as const))('%s — заявленный размер близок к реальному', async (_slug, tpl) => {
    const info = await stat(path.join(FILES_DIR, tpl.filename)).catch(() => null);
    const declared = declaredKb(tpl.size);

    expect(declared, `не разобрал size «${tpl.size}»`).not.toBeNull();
    const actual = Math.round((info?.size ?? 0) / 1024);
    // Допуск в 1 КБ — на округление; всё, что больше, значит файл подменили,
    // а фронтматтер забыли.
    expect(Math.abs((declared ?? 0) - actual), `заявлено ${declared} КБ, на диске ${actual} КБ`).toBeLessThanOrEqual(1);
  });

  it('slug уникальны', () => {
    const slugs = all.map((t) => t.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('в каталоге файлов нет лишнего — всё, что лежит, откуда-то скачивается', async () => {
    const onDisk = (await readdir(FILES_DIR)).filter((f) => !f.startsWith('.'));
    const referenced = new Set(all.map((t) => t.filename));
    expect(onDisk.filter((f) => !referenced.has(f))).toEqual([]);
  });
});
