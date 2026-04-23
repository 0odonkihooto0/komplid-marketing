import type { MetadataRoute } from 'next';
import { getAllBlogPosts } from '@/content-loader/blog';
import { getAllTemplates } from '@/content-loader/shablony';
import { getAllComparisons } from '@/content-loader/sravneniya';
import { CALCULATORS } from '@/lib/calculators-data';

const BASE_URL = 'https://komplid.ru';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = [
    { path: '', priority: 1.0, changeFrequency: 'weekly' as const },
    { path: '/smetchik', priority: 0.9, changeFrequency: 'monthly' as const },
    { path: '/pto', priority: 0.9, changeFrequency: 'monthly' as const },
    { path: '/prorab', priority: 0.9, changeFrequency: 'monthly' as const },
    { path: '/pricing', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/features', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/blog', priority: 0.8, changeFrequency: 'daily' as const },
    { path: '/shablony', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/kalkulyator', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/sravnenie', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/solutions/general-contractor', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/solutions/customer', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/solutions/technical-supervisor', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/solutions/designer', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/company/about', priority: 0.5, changeFrequency: 'monthly' as const },
    { path: '/company/contact', priority: 0.5, changeFrequency: 'monthly' as const },
    { path: '/legal/privacy', priority: 0.3, changeFrequency: 'yearly' as const },
    { path: '/legal/terms', priority: 0.3, changeFrequency: 'yearly' as const },
    { path: '/legal/oferta', priority: 0.3, changeFrequency: 'yearly' as const },
  ].map(({ path, priority, changeFrequency }) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));

  const [posts, templates, comparisons] = await Promise.all([
    getAllBlogPosts(),
    getAllTemplates(),
    getAllComparisons(),
  ]);

  const postPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.modifiedAt ?? post.publishedAt),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  const templatePages: MetadataRoute.Sitemap = templates.map((tpl) => ({
    url: `${BASE_URL}/shablony/${tpl.slug}`,
    lastModified: new Date(tpl.publishedAt),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const comparisonPages: MetadataRoute.Sitemap = comparisons.map((cmp) => ({
    url: `${BASE_URL}/sravnenie/${cmp.slug}`,
    lastModified: new Date(cmp.publishedAt),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const calcPages: MetadataRoute.Sitemap = CALCULATORS.map(c => ({
    url: `${BASE_URL}/kalkulyator/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...calcPages, ...postPages, ...templatePages, ...comparisonPages];
}
