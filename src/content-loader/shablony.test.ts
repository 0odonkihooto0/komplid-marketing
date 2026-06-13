import { describe, it, expect, vi, beforeEach } from 'vitest';

const { readdir, readFile } = vi.hoisted(() => ({
  readdir: vi.fn(),
  readFile: vi.fn(),
}));

vi.mock('fs/promises', () => ({
  default: { readdir, readFile },
}));

function template(slug: string, opts: { category?: string; publishedAt?: string } = {}) {
  const { category = 'Исполнительная документация', publishedAt = '2026-01-01' } = opts;
  return [
    '---',
    `title: "Шаблон ${slug}"`,
    `slug: "${slug}"`,
    `publishedAt: "${publishedAt}"`,
    `filename: "${slug}.docx"`,
    'format: "docx"',
    'size: "95 КБ"',
    `category: "${category}"`,
    '---',
    'Описание шаблона.',
  ].join('\n');
}

beforeEach(() => {
  vi.resetModules();
  readdir.mockReset();
  readFile.mockReset();
});

describe('getAllTemplates', () => {
  it('читает .mdx и игнорирует файлы с префиксом _', async () => {
    readdir.mockResolvedValue(['aosr.mdx', '_template.mdx', 'ozr.mdx']);
    readFile.mockImplementation((p: string) =>
      Promise.resolve(p.includes('aosr.mdx') ? template('aosr') : template('ozr')),
    );

    const { getAllTemplates } = await import('./shablony');
    const templates = await getAllTemplates();

    expect(templates.map((t) => t.slug).sort()).toEqual(['aosr', 'ozr']);
  });

  it('сортирует по publishedAt по убыванию', async () => {
    readdir.mockResolvedValue(['old.mdx', 'new.mdx']);
    readFile.mockImplementation((p: string) =>
      Promise.resolve(
        p.includes('old.mdx')
          ? template('old', { publishedAt: '2026-01-01' })
          : template('new', { publishedAt: '2026-06-01' }),
      ),
    );

    const { getAllTemplates } = await import('./shablony');
    const templates = await getAllTemplates();

    expect(templates.map((t) => t.slug)).toEqual(['new', 'old']);
  });

  it('кэширует результат между вызовами', async () => {
    readdir.mockResolvedValue(['aosr.mdx']);
    readFile.mockResolvedValue(template('aosr'));

    const { getAllTemplates } = await import('./shablony');
    await getAllTemplates();
    await getAllTemplates();

    expect(readdir).toHaveBeenCalledTimes(1);
  });

  it('возвращает [] при ошибке файловой системы', async () => {
    readdir.mockRejectedValue(new Error('ENOENT'));

    const { getAllTemplates } = await import('./shablony');
    expect(await getAllTemplates()).toEqual([]);
  });
});

describe('getTemplateBySlug', () => {
  it('возвращает шаблон с контентом по slug', async () => {
    readFile.mockResolvedValue(template('aosr'));

    const { getTemplateBySlug } = await import('./shablony');
    const result = await getTemplateBySlug('aosr');

    expect(result?.slug).toBe('aosr');
    expect(result?.filename).toBe('aosr.docx');
    expect(result?.content).toContain('Описание шаблона.');
  });

  it('возвращает null, если файл не найден', async () => {
    readFile.mockRejectedValue(new Error('ENOENT'));

    const { getTemplateBySlug } = await import('./shablony');
    expect(await getTemplateBySlug('missing')).toBeNull();
  });
});
