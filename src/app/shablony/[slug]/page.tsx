import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { getAllTemplates, getTemplateBySlug } from '@/content-loader/shablony';
import { useMDXComponents } from '@/mdx-components';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';
import { FaqSchema } from '@/components/seo/FaqSchema';
import { TemplateDownloadForm } from '@/components/forms/TemplateDownloadForm';
import { extractFaqFromContent } from '@/lib/extract-faq';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const templates = await getAllTemplates();
  return templates.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tpl = await getTemplateBySlug(slug);
  if (!tpl) return {};

  return {
    title: tpl.title,
    description: tpl.description,
    alternates: { canonical: `https://komplid.ru/shablony/${slug}` },
    openGraph: {
      type: 'website',
      title: tpl.title,
      description: tpl.description,
    },
  };
}

export default async function ShablonPage({ params }: PageProps) {
  const { slug } = await params;
  const tpl = await getTemplateBySlug(slug);
  if (!tpl) notFound();

  const faqs = extractFaqFromContent(tpl.content);
  const components = useMDXComponents({});
  const url = `https://komplid.ru/shablony/${slug}`;

  const relatedTemplates = tpl.relatedTemplates
    ? await Promise.all(tpl.relatedTemplates.map((s) => getTemplateBySlug(s)))
    : [];
  const validRelated = relatedTemplates.filter(Boolean);

  const ctaHref =
    tpl.category === 'Исполнительная документация' || tpl.category === 'Журналы работ'
      ? '/pto'
      : tpl.category === 'Приёмка работ'
        ? '/smetchik'
        : '/pto';

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Главная', url: 'https://komplid.ru' },
          { name: 'Шаблоны', url: 'https://komplid.ru/shablony' },
          { name: tpl.title, url },
        ]}
      />
      {faqs.length > 0 && <FaqSchema items={faqs} />}

      <article className="section">
        <div className="wrap max-w-3xl">
          {/* Мета-строка */}
          <div className="mb-4 flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-widest" style={{ color: 'var(--ink-mute)' }}>
            <span
              className="rounded px-2 py-1"
              style={{ background: 'var(--bg-inset)', border: '1px solid var(--border)' }}
            >
              {tpl.format}
            </span>
            <span>{tpl.size}</span>
            {tpl.regulation && (
              <>
                <span>·</span>
                <span>{tpl.regulation}</span>
              </>
            )}
            <span>·</span>
            <Link href="/shablony" style={{ color: 'var(--ink-mute)' }}>
              {tpl.category}
            </Link>
          </div>

          <h1
            className="mb-4 text-4xl font-semibold leading-tight"
            style={{ letterSpacing: '-0.025em', color: 'var(--ink)' }}
          >
            {tpl.title}
          </h1>

          <p className="mb-8 text-xl leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
            {tpl.description}
          </p>

          {/* Форма скачивания — основной UX-путь с захватом email */}
          <TemplateDownloadForm slug={tpl.slug} filename={tpl.filename} />

          {/* MDX-контент */}
          <div className="prose-custom mt-10">
            <MDXRemote
              source={tpl.content}
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

          {/* Связанные шаблоны */}
          {validRelated.length > 0 && (
            <div className="mt-12 border-t pt-10" style={{ borderColor: 'var(--border)' }}>
              <h2
                className="mb-5 font-mono text-xs uppercase tracking-widest"
                style={{ color: 'var(--ink-mute)' }}
              >
                Связанные шаблоны
              </h2>
              <div className="flex flex-wrap gap-3">
                {validRelated.map((rel) => {
                  if (!rel) return null;
                  return (
                    <Link
                      key={rel.slug}
                      href={`/shablony/${rel.slug}`}
                      className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
                      style={{
                        background: 'var(--bg-elev)',
                        border: '1px solid var(--border)',
                        color: 'var(--ink)',
                      }}
                    >
                      <span
                        className="font-mono text-[10px]"
                        style={{ color: 'var(--ink-mute)' }}
                      >
                        {rel.format}
                      </span>
                      {rel.title}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* CTA автоматизации */}
          <div
            className="mt-12 rounded-xl p-6"
            style={{ background: 'var(--bg-inset)', border: '1px solid var(--border)' }}
          >
            <p className="mb-4 font-medium" style={{ color: 'var(--ink)' }}>
              Хотите автоматизировать работу с этими документами?
            </p>
            <p className="mb-5 text-sm" style={{ color: 'var(--ink-soft)' }}>
              Komplid генерирует АОСР, ОЖР, КС-2 и КС-3 автоматически — из данных объекта и записей
              журналов. Триал 14 дней без карты.
            </p>
            <Link
              href={ctaHref}
              className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium"
              style={{ background: 'var(--bg-invert)', color: 'var(--ink-invert)' }}
            >
              Узнать подробнее
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
