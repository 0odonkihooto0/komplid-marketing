import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

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
    const files = await fs.readdir(CONTENT_DIR);
    const mdxFiles = files.filter((f) => f.endsWith('.mdx') && !f.startsWith('_'));

    const posts = await Promise.all(
      mdxFiles.map(async (file) => {
        const filePath = path.join(CONTENT_DIR, file);
        const source = await fs.readFile(filePath, 'utf-8');
        const { data } = matter(source);
        return {
          ...data,
          slug: (data['slug'] as string | undefined) ?? file.replace(/\.mdx$/, ''),
        } as BlogPostFrontmatter;
      })
    );

    // Дату парсим один раз на элемент, а не на каждое сравнение в sort (O(N) вместо O(N log N)).
    postsCache = posts
      .map((post) => ({ post, time: new Date(post.publishedAt).getTime() }))
      .sort((a, b) => b.time - a.time)
      .map((entry) => entry.post);
    return postsCache;
  } catch {
    return [];
  }
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const filePath = path.join(CONTENT_DIR, `${slug}.mdx`);
    const source = await fs.readFile(filePath, 'utf-8');
    const { data, content } = matter(source);
    return { ...data, slug, content } as BlogPost;
  } catch {
    return null;
  }
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
