import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

const CONTENT_DIR = path.join(process.cwd(), 'content', 'sravneniya');

export interface ComparisonFrontmatter {
  title: string;
  description: string;
  slug: string;
  publishedAt: string;
  competitor: string;
  competitorFullName?: string;
  keyTakeaway?: string;
  readingTime?: number;
  tags?: string[];
}

export interface Comparison extends ComparisonFrontmatter {
  content: string;
}

// Кэш на уровне модуля: избегает повторных I/O при SSG.
let comparisonsCache: ComparisonFrontmatter[] | null = null;

export async function getAllComparisons(): Promise<ComparisonFrontmatter[]> {
  if (comparisonsCache) return comparisonsCache;

  try {
    const files = await fs.readdir(CONTENT_DIR);
    const mdxFiles = files.filter((f) => f.endsWith('.mdx') && !f.startsWith('_'));

    const comparisons: ComparisonFrontmatter[] = [];
    for (const file of mdxFiles) {
      const filePath = path.join(CONTENT_DIR, file);
      const source = await fs.readFile(filePath, 'utf-8');
      const { data } = matter(source);
      comparisons.push({
        ...data,
        slug: (data['slug'] as string | undefined) ?? file.replace(/\.mdx$/, ''),
      } as ComparisonFrontmatter);
    }

    comparisonsCache = comparisons.sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
    return comparisonsCache;
  } catch {
    return [];
  }
}

export async function getComparisonBySlug(slug: string): Promise<Comparison | null> {
  try {
    const filePath = path.join(CONTENT_DIR, `${slug}.mdx`);
    const source = await fs.readFile(filePath, 'utf-8');
    const { data, content } = matter(source);
    return { ...data, slug, content } as Comparison;
  } catch {
    return null;
  }
}
