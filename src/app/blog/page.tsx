import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllBlogPosts } from '@/content-loader/blog';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';

export const metadata: Metadata = {
  title: 'Блог — исполнительная документация, сметы, стройконтроль',
  description:
    'Гайды для инженеров стройки: шаблоны АОСР и ОЖР, сравнение смет, нормативы Минстроя и Ростехнадзора.',
  alternates: { canonical: 'https://komplid.ru/blog' },
};

export default async function BlogPage() {
  const posts = await getAllBlogPosts();

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Главная', url: 'https://komplid.ru' },
          { name: 'Блог', url: 'https://komplid.ru/blog' },
        ]}
      />

      <div
        className="section"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="wrap">
          <span className="eyebrow">Komplid · Блог</span>
          <h1
            className="mb-4 mt-3 text-4xl font-medium tracking-tight"
            style={{ letterSpacing: '-0.025em', color: 'var(--ink)' }}
          >
            Блог для инженеров стройки
          </h1>
          <p className="max-w-xl text-lg" style={{ color: 'var(--ink-soft)' }}>
            Гайды, шаблоны и разборы нормативов — для ПТО, сметчиков, прорабов и технадзора.
          </p>
        </div>
      </div>

      <div className="section wrap">
        {posts.length === 0 ? (
          <p style={{ color: 'var(--ink-soft)' }}>Статьи скоро появятся.</p>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group block"
              >
                <article className="flex h-full flex-col">
                  {post.image && (
                    <div
                      className="mb-4 aspect-[16/9] overflow-hidden rounded-lg"
                      style={{ background: 'var(--bg-inset)' }}
                    >
                      <img
                        src={post.image}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  )}

                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="font-mono text-[10px] uppercase tracking-widest"
                        style={{ color: 'var(--ink-mute)' }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <h2
                    className="mb-2 text-lg font-semibold leading-snug transition-colors group-hover:text-[var(--accent-strong)]"
                    style={{ color: 'var(--ink)' }}
                  >
                    {post.title}
                  </h2>

                  <p
                    className="mb-4 flex-1 text-sm leading-relaxed"
                    style={{ color: 'var(--ink-soft)' }}
                  >
                    {post.description}
                  </p>

                  <div
                    className="flex items-center gap-3 text-xs"
                    style={{ color: 'var(--ink-mute)' }}
                  >
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
                        <span>{post.readingTime} мин</span>
                      </>
                    )}
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
