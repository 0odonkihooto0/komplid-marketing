import { describe, it, expect, vi, beforeEach } from 'vitest';

const { readdir, readFile } = vi.hoisted(() => ({
  readdir: vi.fn(),
  readFile: vi.fn(),
}));

vi.mock('fs/promises', () => ({
  default: { readdir, readFile },
}));

function comparison(slug: string, opts: { competitor?: string; publishedAt?: string } = {}) {
  const { competitor = slug.toUpperCase(), publishedAt = '2026-01-01' } = opts;
  return [
    '---',
    `title: "Комплид vs ${competitor}"`,
    `slug: "${slug}"`,
    `publishedAt: "${publishedAt}"`,
    `competitor: "${competitor}"`,
    '---',
    'Текст сравнения.',
  ].join('\n');
}

beforeEach(() => {
  vi.resetModules();
  readdir.mockReset();
  readFile.mockReset();
});

describe('getAllComparisons', () => {
  it('читает .mdx и игнорирует файлы с префиксом _', async () => {
    readdir.mockResolvedValue(['cus.mdx', '_draft.mdx', 'exon.mdx']);
    readFile.mockImplementation((p: string) =>
      Promise.resolve(p.includes('cus.mdx') ? comparison('cus') : comparison('exon')),
    );

    const { getAllComparisons } = await import('./sravneniya');
    const items = await getAllComparisons();

    expect(items.map((c) => c.slug).sort()).toEqual(['cus', 'exon']);
  });

  it('сортирует по publishedAt по убыванию', async () => {
    readdir.mockResolvedValue(['old.mdx', 'new.mdx']);
    readFile.mockImplementation((p: string) =>
      Promise.resolve(
        p.includes('old.mdx')
          ? comparison('old', { publishedAt: '2026-01-01' })
          : comparison('new', { publishedAt: '2026-06-01' }),
      ),
    );

    const { getAllComparisons } = await import('./sravneniya');
    const items = await getAllComparisons();

    expect(items.map((c) => c.slug)).toEqual(['new', 'old']);
  });

  it('кэширует результат между вызовами', async () => {
    readdir.mockResolvedValue(['cus.mdx']);
    readFile.mockResolvedValue(comparison('cus'));

    const { getAllComparisons } = await import('./sravneniya');
    await getAllComparisons();
    await getAllComparisons();

    expect(readdir).toHaveBeenCalledTimes(1);
  });

  it('возвращает [] при ошибке файловой системы', async () => {
    readdir.mockRejectedValue(new Error('ENOENT'));

    const { getAllComparisons } = await import('./sravneniya');
    expect(await getAllComparisons()).toEqual([]);
  });
});

describe('getComparisonBySlug', () => {
  it('возвращает сравнение с контентом по slug', async () => {
    readFile.mockResolvedValue(comparison('cus', { competitor: 'ЦУС' }));

    const { getComparisonBySlug } = await import('./sravneniya');
    const result = await getComparisonBySlug('cus');

    expect(result?.slug).toBe('cus');
    expect(result?.competitor).toBe('ЦУС');
    expect(result?.content).toContain('Текст сравнения.');
  });

  it('возвращает null, если файл не найден', async () => {
    readFile.mockRejectedValue(new Error('ENOENT'));

    const { getComparisonBySlug } = await import('./sravneniya');
    expect(await getComparisonBySlug('missing')).toBeNull();
  });
});
