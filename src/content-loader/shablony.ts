import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

const CONTENT_DIR = path.join(process.cwd(), 'content', 'shablony');

export interface TemplateFrontmatter {
  title: string;
  description: string;
  slug: string;
  publishedAt: string;
  filename: string;
  format: string;
  formats?: string[];
  size: string;
  regulation?: string;
  category: string;
  relatedTemplates?: string[];
}

export interface Template extends TemplateFrontmatter {
  content: string;
}

export async function getAllTemplates(): Promise<TemplateFrontmatter[]> {
  try {
    const files = await fs.readdir(CONTENT_DIR);
    const mdxFiles = files.filter((f) => f.endsWith('.mdx') && !f.startsWith('_'));

    const templates = await Promise.all(
      mdxFiles.map(async (file) => {
        const filePath = path.join(CONTENT_DIR, file);
        const source = await fs.readFile(filePath, 'utf-8');
        const { data } = matter(source);
        return {
          ...data,
          slug: (data['slug'] as string | undefined) ?? file.replace(/\.mdx$/, ''),
        } as TemplateFrontmatter;
      })
    );

    return templates.sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  } catch {
    return [];
  }
}

export async function getTemplateBySlug(slug: string): Promise<Template | null> {
  try {
    const filePath = path.join(CONTENT_DIR, `${slug}.mdx`);
    const source = await fs.readFile(filePath, 'utf-8');
    const { data, content } = matter(source);
    return { ...data, slug, content } as Template;
  } catch {
    return null;
  }
}
