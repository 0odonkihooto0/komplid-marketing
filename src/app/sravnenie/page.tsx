import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllComparisons } from '@/content-loader/sravneniya';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';

export const metadata: Metadata = {
  title: 'Сравнение Komplid с конкурентами — ЦУС, Exon, Pragmacore',
  description:
    'Честное сравнение Komplid с ведущими платформами для управления строительством. Функциональность, цены, внедрение — по 20-25 критериям.',
  alternates: { canonical: 'https://komplid.ru/sravnenie' },
};

export default async function ComparisonsPage() {
  const comparisons = await getAllComparisons();

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Главная', url: 'https://komplid.ru' },
          { name: 'Сравнение', url: 'https://komplid.ru/sravnenie' },
        ]}
      />

      <div className="section" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="wrap">
          <span className="eyebrow">Komplid · Сравнение</span>
          <h1
            className="mb-4 mt-3 text-4xl font-medium tracking-tight"
            style={{ letterSpacing: '-0.025em', color: 'var(--ink)' }}
          >
            Komplid vs конкуренты
          </h1>
          <p className="max-w-xl text-lg" style={{ color: 'var(--ink-soft)' }}>
            Честные сравнения с другими платформами для цифрового управления строительством в России.
          </p>
        </div>
      </div>

      <div className="section wrap">
        {comparisons.length === 0 ? (
          <p style={{ color: 'var(--ink-soft)' }}>Сравнения скоро появятся.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {comparisons.map((comparison) => (
              <Link
                key={comparison.slug}
                href={`/sravnenie/${comparison.slug}`}
                className="group block"
              >
                <article
                  className="flex h-full flex-col rounded-xl border p-6 transition-colors"
                  style={{
                    borderColor: 'var(--border)',
                    background: 'var(--bg-elev)',
                  }}
                >
                  <div className="mb-3 flex flex-wrap gap-1.5">
                    {comparison.tags?.slice(0, 2).map((tag) => (
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
                    className="mb-2 text-xl font-semibold leading-snug transition-colors group-hover:text-[var(--accent-strong)]"
                    style={{ color: 'var(--ink)' }}
                  >
                    Komplid vs {comparison.competitor}
                  </h2>

                  <p
                    className="mb-4 flex-1 text-sm leading-relaxed"
                    style={{ color: 'var(--ink-soft)' }}
                  >
                    {comparison.description}
                  </p>

                  <div
                    className="flex items-center justify-between text-xs"
                    style={{ color: 'var(--ink-mute)' }}
                  >
                    <time dateTime={comparison.publishedAt}>
                      {new Date(comparison.publishedAt).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </time>
                    {comparison.readingTime && (
                      <span>{comparison.readingTime} мин</span>
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
