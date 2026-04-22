import Link from 'next/link';
import type { BlogPostFrontmatter } from '@/content-loader/blog';

interface RelatedPostsProps {
  posts: BlogPostFrontmatter[];
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <section
      className="mt-12 border-t pt-10"
      style={{ borderColor: 'var(--border)' }}
    >
      <div
        className="mb-6 font-mono text-[11px] uppercase tracking-widest"
        style={{ color: 'var(--ink-mute)' }}
      >
        Читайте также
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group block rounded-lg p-4 transition-colors"
            style={{
              background: 'var(--bg-elev)',
              border: '1px solid var(--border)',
            }}
          >
            <div className="mb-2 flex flex-wrap gap-1">
              {post.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="font-mono text-[10px] uppercase tracking-wide"
                  style={{ color: 'var(--ink-mute)' }}
                >
                  #{tag}
                </span>
              ))}
            </div>
            <h3
              className="text-sm font-semibold leading-snug transition-colors group-hover:text-[var(--accent-strong)]"
              style={{ color: 'var(--ink)' }}
            >
              {post.title}
            </h3>
            <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--ink-mute)' }}>
              {new Date(post.publishedAt).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
