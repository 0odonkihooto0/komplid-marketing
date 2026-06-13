import { describe, it, expect, vi, beforeEach } from 'vitest';

// Мокаем только fs/promises — gray-matter работает на реальных строках frontmatter,
// чтобы тест проверял настоящий парсинг, а не его заглушку.
const { readdir, readFile } = vi.hoisted(() => ({
  readdir: vi.fn(),
  readFile: vi.fn(),
}));

vi.mock('fs/promises', () => ({
  default: { readdir, readFile },
}));

function post(slug: string, opts: { title?: string; tags?: string[]; publishedAt?: string } = {}) {
  const { title = slug, tags = [], publishedAt = '2026-01-01' } = opts;
  return [
    '---',
    `title: "${title}"`,
    `slug: "${slug}"`,
    `publishedAt: "${publishedAt}"`,
    `tags: [${tags.map((t) => `"${t}"`).join(', ')}]`,
    '---',
    `# ${title}`,
    '',
    'Контент статьи.',
  ].join('\n');
}

beforeEach(() => {
  vi.resetModules(); // сбрасывает кэш модуля (postsCache) между тестами
  readdir.mockReset();
  readFile.mockReset();
});

describe('getAllBlogPosts', () => {
  it('читает .mdx, игнорирует не-mdx и файлы с префиксом _', async () => {
    readdir.mockResolvedValue(['a.mdx', '_template.mdx', 'readme.txt', 'b.mdx']);
    readFile.mockImplementation((p: string) =>
      Promise.resolve(p.includes('a.mdx') ? post('a') : post('b')),
    );

    const { getAllBlogPosts } = await import('./blog');
    const posts = await getAllBlogPosts();

    expect(posts.map((p) => p.slug).sort()).toEqual(['a', 'b']);
    expect(readFile).toHaveBeenCalledTimes(2);
  });

  it('сортирует по publishedAt по убыванию (новые первыми)', async () => {
    readdir.mockResolvedValue(['old.mdx', 'new.mdx']);
    readFile.mockImplementation((p: string) =>
      Promise.resolve(
        p.includes('old.mdx')
          ? post('old', { publishedAt: '2026-01-01' })
          : post('new', { publishedAt: '2026-06-01' }),
      ),
    );

    const { getAllBlogPosts } = await import('./blog');
    const posts = await getAllBlogPosts();

    expect(posts.map((p) => p.slug)).toEqual(['new', 'old']);
  });

  it('кэширует результат — readdir вызывается один раз при повторных обращениях', async () => {
    readdir.mockResolvedValue(['a.mdx']);
    readFile.mockResolvedValue(post('a'));

    const { getAllBlogPosts } = await import('./blog');
    await getAllBlogPosts();
    await getAllBlogPosts();

    expect(readdir).toHaveBeenCalledTimes(1);
  });

  it('возвращает [] при ошибке файловой системы', async () => {
    readdir.mockRejectedValue(new Error('ENOENT'));

    const { getAllBlogPosts } = await import('./blog');
    expect(await getAllBlogPosts()).toEqual([]);
  });
});

describe('getBlogPostBySlug', () => {
  it('возвращает пост с контентом по slug', async () => {
    readFile.mockResolvedValue(post('aosr', { title: 'АОСР' }));

    const { getBlogPostBySlug } = await import('./blog');
    const result = await getBlogPostBySlug('aosr');

    expect(result?.slug).toBe('aosr');
    expect(result?.title).toBe('АОСР');
    expect(result?.content).toContain('Контент статьи.');
  });

  it('возвращает null, если файл не найден', async () => {
    readFile.mockRejectedValue(new Error('ENOENT'));

    const { getBlogPostBySlug } = await import('./blog');
    expect(await getBlogPostBySlug('missing')).toBeNull();
  });
});

describe('getRelatedPosts', () => {
  it('ранжирует по числу общих тегов и исключает текущий пост', async () => {
    readdir.mockResolvedValue(['cur.mdx', 'a.mdx', 'b.mdx', 'c.mdx']);
    const byName: Record<string, string> = {
      'cur.mdx': post('cur', { tags: ['x', 'y'] }),
      'a.mdx': post('a', { tags: ['x', 'y'] }), // 2 общих
      'b.mdx': post('b', { tags: ['x'] }), // 1 общий
      'c.mdx': post('c', { tags: ['z'] }), // 0 общих
    };
    readFile.mockImplementation((p: string) => {
      const key = Object.keys(byName).find((k) => p.includes(k))!;
      return Promise.resolve(byName[key]);
    });

    const { getRelatedPosts } = await import('./blog');
    const related = await getRelatedPosts('cur', 2);

    expect(related.map((p) => p.slug)).toEqual(['a', 'b']);
    expect(related.some((p) => p.slug === 'cur')).toBe(false);
  });

  it('не читает файл повторно — использует кэш getAllBlogPosts', async () => {
    readdir.mockResolvedValue(['cur.mdx', 'a.mdx']);
    readFile.mockImplementation((p: string) =>
      Promise.resolve(p.includes('cur.mdx') ? post('cur', { tags: ['x'] }) : post('a', { tags: ['x'] })),
    );

    const { getRelatedPosts } = await import('./blog');
    await getRelatedPosts('cur');

    // Только обход каталога: ни одного дополнительного чтения сверх двух файлов списка.
    expect(readFile).toHaveBeenCalledTimes(2);
  });

  it('возвращает [], если текущий slug не найден', async () => {
    readdir.mockResolvedValue(['a.mdx']);
    readFile.mockResolvedValue(post('a'));

    const { getRelatedPosts } = await import('./blog');
    expect(await getRelatedPosts('missing')).toEqual([]);
  });
});
