import path from 'path';
import { readCollection, readEntryBySlug } from './load-collection';

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
    comparisonsCache = await readCollection<ComparisonFrontmatter>(CONTENT_DIR);
    return comparisonsCache;
  } catch {
    return [];
  }
}

export async function getComparisonBySlug(slug: string): Promise<Comparison | null> {
  return readEntryBySlug<Comparison>(CONTENT_DIR, slug);
}
