import type { MetadataRoute } from 'next';
import { getAllBlogPosts } from '@/content-loader/blog';
import { getAllTemplates } from '@/content-loader/shablony';
import { CALCULATORS } from '@/lib/calculators-data';
import { getAllNormativDocs } from '@/lib/normativ-data';
import { SP_CLAUSES, clauseUrl } from '@/lib/normativ-clauses';
import { DOC_FORMS } from '@/lib/formy-data';
import { GLOSSARY_TERMS } from '@/lib/glossariy-data';
import { XSD_SCHEMAS } from '@/lib/isup-data';

const BASE_URL = 'https://komplid.ru';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = [
    { path: '', priority: 1.0, changeFrequency: 'weekly' as const },
    { path: '/smetchik', priority: 0.9, changeFrequency: 'monthly' as const },
    { path: '/pto', priority: 0.9, changeFrequency: 'monthly' as const },
    { path: '/prorab', priority: 0.9, changeFrequency: 'monthly' as const },
    { path: '/pricing', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/blog', priority: 0.8, changeFrequency: 'daily' as const },
    { path: '/normativ', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/formy', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/glossariy', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/isup', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/shablony', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/kalkulyator', priority: 0.7, changeFrequency: 'monthly' as const },
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

  const [posts, templates, normativDocs] = await Promise.all([
    getAllBlogPosts(),
    getAllTemplates(),
    getAllNormativDocs(),
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

  const calcPages: MetadataRoute.Sitemap = CALCULATORS.map(c => ({
    url: `${BASE_URL}/kalkulyator/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // тексты СП меняются только при пересборке корпуса → yearly
  const normativPages: MetadataRoute.Sitemap = normativDocs.map((doc) => ({
    url: `${BASE_URL}/normativ/${doc.slug}`,
    lastModified: doc.publishedAt ? new Date(doc.publishedAt) : new Date(),
    changeFrequency: 'yearly',
    priority: 0.6,
  }));

  // Разборы отдельных пунктов СП — отвечают на запросы вида «СП 48 пункт 6.13»
  const clausePages: MetadataRoute.Sitemap = SP_CLAUSES.map((clause) => ({
    url: `${BASE_URL}${clauseUrl(clause)}`,
    lastModified: new Date(),
    changeFrequency: 'yearly',
    priority: 0.6,
  }));

  const formPages: MetadataRoute.Sitemap = DOC_FORMS.map((form) => ({
    url: `${BASE_URL}/formy/${form.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const termPages: MetadataRoute.Sitemap = GLOSSARY_TERMS.map((term) => ({
    url: `${BASE_URL}/glossariy/${term.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  const schemaPages: MetadataRoute.Sitemap = XSD_SCHEMAS.map((schema) => ({
    url: `${BASE_URL}/isup/${schema.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [
    ...staticPages,
    ...calcPages,
    ...postPages,
    ...templatePages,
    ...normativPages,
    ...clausePages,
    ...formPages,
    ...termPages,
    ...schemaPages,
  ];
}
