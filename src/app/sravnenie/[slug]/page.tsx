import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { getAllComparisons, getComparisonBySlug } from '@/content-loader/sravneniya';
import { useMDXComponents } from '@/mdx-components';
import { ArticleSchema } from '@/components/seo/ArticleSchema';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';
import { FaqSchema } from '@/components/seo/FaqSchema';
import { extractFaqFromContent } from '@/lib/extract-faq';
import { ShareButtons } from '@/components/blog/ShareButtons';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const comparisons = await getAllComparisons();
  return comparisons.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const comparison = await getComparisonBySlug(slug);
  if (!comparison) return {};

  return {
    title: comparison.title,
    description: comparison.description,
    keywords: comparison.tags,
    alternates: { canonical: `https://komplid.ru/sravnenie/${slug}` },
    openGraph: {
      type: 'article',
      title: comparison.title,
      description: comparison.description,
      publishedTime: comparison.publishedAt,
      tags: comparison.tags,
    },
  };
}

export default async function ComparisonPage({ params }: PageProps) {
  const { slug } = await params;
  const comparison = await getComparisonBySlug(slug);
  if (!comparison) notFound();

  const [allComparisons, faqs] = await Promise.all([
    getAllComparisons(),
    Promise.resolve(extractFaqFromContent(comparison.content)),
  ]);

  const others = allComparisons.filter((c) => c.slug !== slug);
  const components = useMDXComponents({});
  const url = `https://komplid.ru/sravnenie/${slug}`;

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Главная', url: 'https://komplid.ru' },
          { name: 'Сравнение', url: 'https://komplid.ru/sravnenie' },
          { name: comparison.title, url },
        ]}
      />
      <ArticleSchema
        title={comparison.title}
        description={comparison.description}
        url={url}
        publishedAt={comparison.publishedAt}
        authorName="Komplid"
      />
      {faqs.length > 0 && <FaqSchema items={faqs} />}

      <article className="section">
        <div className="wrap max-w-3xl">
          {/* Шапка */}
          <header className="mb-12">
            <div className="mb-4 flex flex-wrap gap-2">
              {comparison.tags?.map((tag) => (
                <span
                  key={tag}
                  className="rounded px-2 py-1 font-mono text-[10px] uppercase tracking-widest"
                  style={{ background: 'var(--bg-inset)', color: 'var(--ink-mute)' }}
                >
                  #{tag}
                </span>
              ))}
            </div>

            <h1
              className="mb-5 text-4xl font-semibold leading-tight"
              style={{ letterSpacing: '-0.025em', color: 'var(--ink)' }}
            >
              {comparison.title}
            </h1>

            <p className="mb-6 text-xl leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
              {comparison.description}
            </p>

            <div
              className="flex flex-wrap items-center gap-4 text-sm"
              style={{ color: 'var(--ink-mute)' }}
            >
              <span>Komplid</span>
              <span>·</span>
              <time dateTime={comparison.publishedAt}>
                {new Date(comparison.publishedAt).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </time>
              {comparison.readingTime && (
                <>
                  <span>·</span>
                  <span>{comparison.readingTime} мин чтения</span>
                </>
              )}
            </div>
          </header>

          {/* Блок «Главное» — keyTakeaway — AEO-сигнал */}
          {comparison.keyTakeaway && (
            <div
              className="mb-8 rounded-r-lg border-l-4 p-4"
              style={{ borderColor: 'var(--accent)', background: 'var(--bg-inset)' }}
            >
              <div
                className="mb-1 font-mono text-[10px] uppercase tracking-widest"
                style={{ color: 'var(--ink-mute)' }}
              >
                Главное
              </div>
              <div className="font-medium leading-snug" style={{ color: 'var(--ink)' }}>
                {comparison.keyTakeaway}
              </div>
            </div>
          )}

          {/* Контент MDX */}
          <div className="prose-custom">
            <MDXRemote
              source={comparison.content}
              components={components}
              options={{
                mdxOptions: {
                  remarkPlugins: [remarkGfm],
                  rehypePlugins: [
                    rehypeSlug,
                    [rehypeAutolinkHeadings, { behavior: 'wrap' }],
                  ],
                },
              }}
            />
          </div>

          {/* CTA */}
          <div
            className="mt-12 rounded-xl p-8 text-center"
            style={{ background: 'var(--bg-invert)', color: 'var(--ink-invert)' }}
          >
            <div
              className="mb-1 font-mono text-[11px] uppercase tracking-widest"
              style={{ color: 'var(--accent)' }}
            >
              14 дней бесплатно · без карты
            </div>
            <h2
              className="mb-3 text-2xl font-semibold"
              style={{ letterSpacing: '-0.02em', color: 'var(--ink-invert)' }}
            >
              Попробуйте Komplid на реальном объекте
            </h2>
            <p className="mb-6 text-sm" style={{ color: 'var(--ink-invert-mute)' }}>
              Настройка за день. Триал — все 18 модулей без ограничений.
            </p>
            <a
              href={`https://app.komplid.ru/signup?utm_source=comparison&utm_campaign=vs_${slug}&utm_medium=organic`}
              className="inline-flex items-center gap-2 rounded-lg px-6 py-3 font-semibold transition-colors"
              style={{
                background: 'var(--accent)',
                color: 'var(--accent-ink)',
                fontSize: '15px',
              }}
            >
              Начать бесплатно
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </a>
          </div>

          <ShareButtons url={url} title={comparison.title} />

          {/* Другие сравнения */}
          {others.length > 0 && (
            <div className="mt-12">
              <h3
                className="mb-4 font-mono text-[11px] uppercase tracking-widest"
                style={{ color: 'var(--ink-mute)' }}
              >
                Другие сравнения
              </h3>
              <div className="flex flex-col gap-3">
                {others.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/sravnenie/${c.slug}`}
                    className="group flex items-center gap-3 rounded-lg border p-4 transition-colors"
                    style={{ borderColor: 'var(--border)', background: 'var(--bg-elev)' }}
                  >
                    <div className="flex-1">
                      <div className="font-medium group-hover:text-[var(--accent-strong)]" style={{ color: 'var(--ink)' }}>
                        {c.title}
                      </div>
                      <div className="mt-1 text-sm" style={{ color: 'var(--ink-soft)' }}>
                        {c.description}
                      </div>
                    </div>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      style={{ color: 'var(--ink-mute)', flexShrink: 0 }}
                    >
                      <path d="M5 12h14M13 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>
    </>
  );
}
