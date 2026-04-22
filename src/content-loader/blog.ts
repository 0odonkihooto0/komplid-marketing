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

export async function getAllBlogPosts(): Promise<BlogPostFrontmatter[]> {
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

    return posts.sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
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
  const current = await getBlogPostBySlug(slug);
  if (!current) return [];

  const all = await getAllBlogPosts();
  return all
    .filter((p) => p.slug !== slug)
    .map((post) => ({
      post,
      score: post.tags.filter((t) => current.tags.includes(t)).length,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.post);
}
