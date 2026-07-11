import { describe, it, expect, vi, beforeEach } from 'vitest';

// Мокаем только fs/promises — gray-matter парсит реальные строки frontmatter,
// чтобы тест проверял настоящий парсинг, а не его заглушку.
const { readdir, readFile } = vi.hoisted(() => ({
  readdir: vi.fn(),
  readFile: vi.fn(),
}));

vi.mock('fs/promises', () => ({
  default: { readdir, readFile },
}));

import { readCollection, readEntryBySlug } from './load-collection';

function entry(opts: { slug?: string; publishedAt?: string } = {}) {
  const { slug, publishedAt = '2026-01-01' } = opts;
  return [
    '---',
    ...(slug ? [`slug: "${slug}"`] : []),
    `publishedAt: "${publishedAt}"`,
    '---',
    'Контент.',
  ].join('\n');
}

interface TestItem {
  slug: string;
  publishedAt: string;
}

beforeEach(() => {
  readdir.mockReset();
  readFile.mockReset();
});

describe('readCollection', () => {
  it('читает .mdx, игнорирует не-mdx и черновики с префиксом _', async () => {
    readdir.mockResolvedValue(['a.mdx', '_draft.mdx', 'notes.txt', 'b.mdx']);
    readFile.mockImplementation((p: string) =>
      Promise.resolve(p.includes('a.mdx') ? entry({ slug: 'a' }) : entry({ slug: 'b' })),
    );

    const items = await readCollection<TestItem>('/content/test');

    expect(items.map((i) => i.slug).sort()).toEqual(['a', 'b']);
    expect(readFile).toHaveBeenCalledTimes(2);
  });

  it('берёт slug из имени файла, если его нет во frontmatter', async () => {
    readdir.mockResolvedValue(['iz-imeni-fayla.mdx']);
    readFile.mockResolvedValue(entry());

    const items = await readCollection<TestItem>('/content/test');

    expect(items[0]?.slug).toBe('iz-imeni-fayla');
  });

  it('сортирует по publishedAt по убыванию (новые первыми)', async () => {
    readdir.mockResolvedValue(['old.mdx', 'new.mdx', 'mid.mdx']);
    const byName: Record<string, string> = {
      'old.mdx': entry({ slug: 'old', publishedAt: '2026-01-01' }),
      'new.mdx': entry({ slug: 'new', publishedAt: '2026-06-01' }),
      'mid.mdx': entry({ slug: 'mid', publishedAt: '2026-03-01' }),
    };
    readFile.mockImplementation((p: string) => {
      const key = Object.keys(byName).find((k) => p.includes(k))!;
      return Promise.resolve(byName[key]);
    });

    const items = await readCollection<TestItem>('/content/test');

    expect(items.map((i) => i.slug)).toEqual(['new', 'mid', 'old']);
  });

  it('НЕ глотает ошибку файловой системы — пробрасывает вызывающему коду', async () => {
    readdir.mockRejectedValue(new Error('ENOENT: no such directory'));

    await expect(readCollection<TestItem>('/content/missing')).rejects.toThrow('ENOENT');
  });
});

describe('readEntryBySlug', () => {
  it('возвращает запись с frontmatter, slug и контентом', async () => {
    readFile.mockResolvedValue(entry({ publishedAt: '2026-05-01' }));

    const result = await readEntryBySlug<TestItem & { content: string }>('/content/test', 'aosr');

    expect(result?.slug).toBe('aosr');
    expect(result?.publishedAt).toBe('2026-05-01');
    expect(result?.content).toContain('Контент.');
  });

  it('возвращает null при ошибке чтения файла (несуществующий slug)', async () => {
    readFile.mockRejectedValue(new Error('ENOENT'));

    expect(await readEntryBySlug<TestItem>('/content/test', 'missing')).toBeNull();
  });

  it('возвращает null при битом frontmatter (ошибка парсинга)', async () => {
    // Невалидный YAML внутри frontmatter — gray-matter бросит исключение.
    readFile.mockResolvedValue('---\ntitle: "незакрытая\n  кавычка: [\n---\nтекст');

    expect(await readEntryBySlug<TestItem>('/content/test', 'broken')).toBeNull();
  });
});
