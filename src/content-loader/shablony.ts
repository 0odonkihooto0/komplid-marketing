import path from 'path';
import { readCollection, readEntryBySlug } from './load-collection';

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

// Кэш на уровне модуля: избегает повторных I/O при SSG.
let templatesCache: TemplateFrontmatter[] | null = null;

export async function getAllTemplates(): Promise<TemplateFrontmatter[]> {
  if (templatesCache) return templatesCache;

  try {
    templatesCache = await readCollection<TemplateFrontmatter>(CONTENT_DIR);
    return templatesCache;
  } catch {
    return [];
  }
}

export async function getTemplateBySlug(slug: string): Promise<Template | null> {
  return readEntryBySlug<Template>(CONTENT_DIR, slug);
}
