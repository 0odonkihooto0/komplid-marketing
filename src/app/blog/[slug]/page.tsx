import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { getAllBlogPosts, getBlogPostBySlug, getRelatedPosts } from '@/content-loader/blog';
import { useMDXComponents } from '@/mdx-components';
import { ArticleSchema } from '@/components/seo/ArticleSchema';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';
import { FaqSchema } from '@/components/seo/FaqSchema';
import { TableOfContents } from '@/components/blog/TableOfContents';
import { ShareButtons } from '@/components/blog/ShareButtons';
import { RelatedPosts } from '@/components/blog/RelatedPosts';
import { extractFaqFromContent } from '@/lib/extract-faq';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getAllBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    keywords: post.tags,
    alternates: { canonical: `https://komplid.ru/blog/${slug}` },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.description,
      publishedTime: post.publishedAt,
      modifiedTime: post.modifiedAt,
      authors: [post.author],
      tags: post.tags,
      images: post.image ? [{ url: post.image, width: 1200, height: 630 }] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  const [related, faqs] = await Promise.all([
    getRelatedPosts(slug),
    Promise.resolve(extractFaqFromContent(post.content)),
  ]);

  const components = useMDXComponents({});
  const url = `https://komplid.ru/blog/${slug}`;

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Главная', url: 'https://komplid.ru' },
          { name: 'Блог', url: 'https://komplid.ru/blog' },
          { name: post.title, url },
        ]}
      />
      <ArticleSchema
        title={post.title}
        description={post.description}
        url={url}
        imageUrl={post.image}
        publishedAt={post.publishedAt}
        modifiedAt={post.modifiedAt}
        authorName={post.author}
      />
      {faqs.length > 0 && <FaqSchema items={faqs} />}

      <article className="section">
        <div className="wrap max-w-3xl">
          {/* Шапка статьи */}
          <header className="mb-12">
            <div className="mb-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
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
              {post.title}
            </h1>

            <p className="mb-6 text-xl leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
              {post.description}
            </p>

            <div
              className="flex flex-wrap items-center gap-4 text-sm"
              style={{ color: 'var(--ink-mute)' }}
            >
              <span>{post.author}</span>
              <span>·</span>
              <time dateTime={post.publishedAt}>
                {new Date(post.publishedAt).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </time>
              {post.readingTime && (
                <>
                  <span>·</span>
                  <span>{post.readingTime} мин чтения</span>
                </>
              )}
            </div>
          </header>

          {/* Блок «Главное» — keyTakeaway — AEO-сигнал */}
          {post.keyTakeaway && (
            <div
              className="mb-8 rounded-r-lg border-l-4 p-4"
              style={{
                borderColor: 'var(--accent)',
                background: 'var(--bg-inset)',
              }}
            >
              <div
                className="mb-1 font-mono text-[10px] uppercase tracking-widest"
                style={{ color: 'var(--ink-mute)' }}
              >
                Главное
              </div>
              <div className="font-medium leading-snug" style={{ color: 'var(--ink)' }}>
                {post.keyTakeaway}
              </div>
            </div>
          )}

          {/* Оглавление */}
          <TableOfContents content={post.content} />

          {/* Обложка статьи */}
          {post.image && (
            <img
              src={post.image}
              alt={post.title}
              className="mb-10 w-full rounded-lg object-cover"
              style={{ aspectRatio: '16/9' }}
            />
          )}

          {/* Контент статьи */}
          <div className="prose-custom">
            <MDXRemote
              source={post.content}
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

          {/* Кнопки шаринга */}
          <ShareButtons url={url} title={post.title} />

          {/* Похожие статьи */}
          <RelatedPosts posts={related} />
        </div>
      </article>
    </>
  );
}
