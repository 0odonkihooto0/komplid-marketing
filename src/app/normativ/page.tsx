import type { Metadata } from 'next';
import { getAllNormativDocs, getNormativByCategory } from '@/lib/normativ-data';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';
import { ItemListSchema } from '@/components/seo/ItemListSchema';

export const metadata: Metadata = {
  title: 'Своды правил (СП) — актуальные тексты с поиском и навигацией',
  description:
    'База сводов правил для строительства: 320+ СП с оглавлением, поиском по пунктам, формулами и таблицами. СП 48, СП 20, СП 63 и другие — бесплатно, без регистрации.',
  alternates: { canonical: 'https://komplid.ru/normativ' },
  openGraph: {
    type: 'website',
    title: 'База сводов правил (СП) для строительства',
    description:
      'Интерактивные тексты СП: навигация по пунктам, поиск, таблицы и формулы. Бесплатно.',
  },
};

export default async function NormativPage() {
  const [docs, categories] = await Promise.all([
    getAllNormativDocs(),
    getNormativByCategory(),
  ]);

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Главная', url: 'https://komplid.ru' },
          { name: 'Нормативные документы', url: 'https://komplid.ru/normativ' },
        ]}
      />
      <ItemListSchema
        name="Своды правил (СП) для строительства"
        items={docs.map((d) => ({
          name: `${d.designation} ${d.title}`,
          url: `https://komplid.ru/normativ/${d.slug}`,
        }))}
      />

      <div className="section" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="wrap">
          <span className="eyebrow">Комплид · Нормативы</span>
          <h1
            className="mb-4 mt-3 text-4xl font-medium"
            style={{ letterSpacing: '-0.025em', color: 'var(--ink)' }}
          >
            Своды правил (СП) — тексты с поиском и навигацией
          </h1>
          <p className="max-w-2xl text-lg" style={{ color: 'var(--ink-soft)' }}>
            {docs.length} сводов правил в интерактивном виде: оглавление, поиск по пунктам,
            якорные ссылки на каждый пункт, таблицы и формулы из оригинальных изданий.
            Бесплатно и без регистрации.
          </p>
          <p className="mt-4 max-w-2xl text-sm" style={{ color: 'var(--ink-muted)' }}>
            Справочные копии для удобной работы — не официальное опубликование. Официальный
            источник — Минстрой России. Перед применением проверяйте актуальность редакции.
          </p>
        </div>
      </div>

      <div className="section wrap">
        <div className="flex flex-col gap-14">
          {categories.map(({ category, docs: catDocs }) => (
            <section key={category}>
              <h2
                className="mb-5 text-2xl font-medium"
                style={{ letterSpacing: '-0.02em', color: 'var(--ink)' }}
              >
                {category}{' '}
                <span className="text-base" style={{ color: 'var(--ink-muted)' }}>
                  · {catDocs.length}
                </span>
              </h2>
              <ul className="grid gap-2 md:grid-cols-2">
                {catDocs.map((doc) => (
                  <li key={doc.slug}>
                    {/* обычный <a>: цель — статический HTML вне роутера Next */}
                    <a
                      href={`/normativ/${doc.slug}`}
                      className="block rounded-lg border px-4 py-3 transition-colors hover:border-[var(--accent)]"
                      style={{ borderColor: 'var(--border)', background: 'var(--bg-elev)' }}
                    >
                      <span
                        className="font-mono text-xs font-semibold"
                        style={{ color: 'var(--accent-strong)' }}
                      >
                        {doc.designation}
                      </span>
                      <span className="mt-1 block text-sm" style={{ color: 'var(--ink)' }}>
                        {doc.title}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
