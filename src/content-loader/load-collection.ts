import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

// Общая логика загрузки MDX-коллекций (blog, shablony, sravneniya).
// Раньше дублировалась один-в-один в трёх content-loader'ах: обход каталога,
// фильтр .mdx и _черновиков, параллельное чтение, парсинг frontmatter,
// сортировка по publishedAt по убыванию. Кэширование остаётся на стороне
// вызывающего модуля (у каждой коллекции свой module-scope кэш).

interface CollectionItem {
  slug: string;
  publishedAt: string;
}

/**
 * Читает все .mdx-файлы каталога (кроме начинающихся с «_» черновиков),
 * парсит frontmatter и возвращает их отсортированными по publishedAt
 * по убыванию (новые первыми). Slug берётся из frontmatter либо из имени файла.
 *
 * Ошибки файловой системы НЕ глотает — это решает вызывающий код (обычно
 * возвращает [] на отсутствующий каталог при первой сборке).
 */
export async function readCollection<T extends CollectionItem>(dir: string): Promise<T[]> {
  const files = await fs.readdir(dir);
  const mdxFiles = files.filter((f) => f.endsWith('.mdx') && !f.startsWith('_'));

  const items = await Promise.all(
    mdxFiles.map(async (file) => {
      const source = await fs.readFile(path.join(dir, file), 'utf-8');
      const { data } = matter(source);
      return {
        ...data,
        slug: (data['slug'] as string | undefined) ?? file.replace(/\.mdx$/, ''),
      } as T;
    })
  );

  // Дату парсим один раз на элемент, а не на каждое сравнение в sort (O(N) вместо O(N log N)).
  return items
    .map((item) => ({ item, time: new Date(item.publishedAt).getTime() }))
    .sort((a, b) => b.time - a.time)
    .map((entry) => entry.item);
}

/**
 * Читает один MDX-файл по slug вместе с содержимым. Возвращает null,
 * если файла нет (несуществующий slug).
 */
export async function readEntryBySlug<T>(dir: string, slug: string): Promise<T | null> {
  try {
    const source = await fs.readFile(path.join(dir, `${slug}.mdx`), 'utf-8');
    const { data, content } = matter(source);
    return { ...data, slug, content } as T;
  } catch {
    return null;
  }
}
