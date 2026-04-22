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
}

export interface Comparison extends ComparisonFrontmatter {
  content: string;
}

export async function getAllComparisons(): Promise<ComparisonFrontmatter[]> {
  try {
    const files = await fs.readdir(CONTENT_DIR);
    const mdxFiles = files.filter((f) => f.endsWith('.mdx') && !f.startsWith('_'));

    const comparisons = await Promise.all(
      mdxFiles.map(async (file) => {
        const filePath = path.join(CONTENT_DIR, file);
        const source = await fs.readFile(filePath, 'utf-8');
        const { data } = matter(source);
        return {
          ...data,
          slug: (data['slug'] as string | undefined) ?? file.replace(/\.mdx$/, ''),
        } as ComparisonFrontmatter;
      })
    );

    return comparisons.sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
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
