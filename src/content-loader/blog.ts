import path from 'path';
import { readCollection, readEntryBySlug } from './load-collection';

const CONTENT_DIR = path.join(process.cwd(), 'content', 'blog');

export interface BlogPostFrontmatter {
  title: string;
  description: string;
  slug: string;
  publishedAt: string;
  modifiedAt?: string;
  author: string;
  tags: string[];
  image?: string;
  primaryQuestion: string;
  keyTakeaway: string;
  readingTime?: number;
  featured?: boolean;
}

export interface BlogPost extends BlogPostFrontmatter {
  content: string;
}

// Кэш на уровне модуля: избегает повторных I/O при SSG (sitemap, related posts, страницы блога).
let postsCache: BlogPostFrontmatter[] | null = null;

export async function getAllBlogPosts(): Promise<BlogPostFrontmatter[]> {
  if (postsCache) return postsCache;

  try {
    postsCache = await readCollection<BlogPostFrontmatter>(CONTENT_DIR);
    return postsCache;
  } catch {
    return [];
  }
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  return readEntryBySlug<BlogPost>(CONTENT_DIR, slug);
}

export async function getRelatedPosts(slug: string, limit = 3): Promise<BlogPostFrontmatter[]> {
  // Берём текущий пост из кэшированного списка, а не повторным чтением файла с диска:
  // теги уже есть во frontmatter, контент здесь не нужен.
  const all = await getAllBlogPosts();
  const current = all.find((p) => p.slug === slug);
  if (!current) return [];

  // Set из тегов текущей статьи — O(1) проверка вместо линейного .includes в цикле.
  const currentTags = new Set(current.tags);
  return all
    .filter((p) => p.slug !== slug)
    .map((post) => ({
      post,
      score: post.tags.filter((t) => currentTags.has(t)).length,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.post);
}
