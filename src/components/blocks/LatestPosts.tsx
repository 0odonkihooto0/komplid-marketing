import Link from 'next/link';
import { getAllBlogPosts } from '@/content-loader/blog';

export async function LatestPosts({ limit = 3 }: { limit?: number }) {
  const posts = (await getAllBlogPosts()).slice(0, limit);
  if (posts.length === 0) return null;

  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 40,
          }}
        >
          <div className="section-head" style={{ marginBottom: 0 }}>
            <span className="eyebrow">Из блога</span>
            <h2 style={{ margin: '10px 0 0' }}>Свежие материалы</h2>
          </div>
          <Link
            href="/blog"
            style={{ fontSize: 14, color: 'var(--accent-strong)', fontWeight: 500, whiteSpace: 'nowrap' }}
          >
            Все статьи →
          </Link>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 24,
          }}
        >
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
              <article
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  padding: 20,
                  background: 'var(--bg-elev)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  height: '100%',
                  transition: 'border-color 0.15s',
                }}
              >
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {post.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 10,
                        letterSpacing: '0.1em',
                        color: 'var(--ink-mute)',
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: 16,
                    fontWeight: 600,
                    lineHeight: 1.3,
                    color: 'var(--ink)',
                  }}
                >
                  {post.title}
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    color: 'var(--ink-soft)',
                    lineHeight: 1.5,
                    flexGrow: 1,
                  }}
                >
                  {post.description}
                </p>
                <time
                  dateTime={post.publishedAt}
                  style={{ fontSize: 11, color: 'var(--ink-mute)', fontFamily: 'var(--font-mono)' }}
                >
                  {new Date(post.publishedAt).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </time>
              </article>
            </Link>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 760px) {
          .latest-posts-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
