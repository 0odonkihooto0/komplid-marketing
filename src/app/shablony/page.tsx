import type { Metadata } from 'next';
import type { MouseEvent } from 'react';
import Link from 'next/link';
import { getAllTemplates, type TemplateFrontmatter } from '@/content-loader/shablony';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';

export const metadata: Metadata = {
  title: 'Бесплатные шаблоны документов для стройки 2026',
  description:
    'Шаблоны АОСР, ОЖР, КС-2, КС-3, КС-6а. Актуальные формы 2026 года по приказам Минстроя и Ростехнадзора. Бесплатно, форматы .docx и .xlsx.',
  alternates: { canonical: 'https://komplid.ru/shablony' },
  openGraph: {
    type: 'website',
    title: 'Бесплатные шаблоны строительной документации',
    description: 'АОСР, ОЖР, КС-2, КС-3, КС-6а — актуальные формы 2026 года. Скачать бесплатно.',
  },
};

export default async function ShablonyPage() {
  const templates = await getAllTemplates();

  const byCategory = templates.reduce<Map<string, TemplateFrontmatter[]>>((acc, tpl) => {
    const list = acc.get(tpl.category) ?? [];
    list.push(tpl);
    acc.set(tpl.category, list);
    return acc;
  }, new Map());

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Главная', url: 'https://komplid.ru' },
          { name: 'Шаблоны', url: 'https://komplid.ru/shablony' },
        ]}
      />

      <div className="section" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="wrap">
          <span className="eyebrow">Komplid · Шаблоны</span>
          <h1
            className="mb-4 mt-3 text-4xl font-medium"
            style={{ letterSpacing: '-0.025em', color: 'var(--ink)' }}
          >
            Бесплатные шаблоны строительной документации
          </h1>
          <p className="max-w-xl text-lg" style={{ color: 'var(--ink-soft)' }}>
            Актуальные формы 2026 года по приказам Минстроя и Ростехнадзора. Скачайте шаблон
            в формате .docx или .xlsx — уже со всеми обязательными полями.
          </p>
        </div>
      </div>

      <div className="section wrap">
        {templates.length === 0 ? (
          <p style={{ color: 'var(--ink-soft)' }}>Шаблоны скоро появятся.</p>
        ) : (
          <div className="flex flex-col gap-16">
            {Array.from(byCategory.entries()).map(([category, items]) => (
              <section key={category}>
                <h2
                  className="mb-6 text-sm font-mono uppercase tracking-widest"
                  style={{ color: 'var(--ink-mute)', letterSpacing: '0.14em' }}
                >
                  {category}
                </h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {items.map((tpl) => (
                    <TemplateCard key={tpl.slug} tpl={tpl} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function TemplateCard({ tpl }: { tpl: TemplateFrontmatter; key?: string }) {
  return (
    <Link href={`/shablony/${tpl.slug}`} className="group block">
      <article
        className="flex h-full flex-col rounded-xl p-5 transition-colors"
        style={{
          background: 'var(--bg-elev)',
          border: '1px solid var(--border)',
        }}
        onMouseOver={(e: MouseEvent<HTMLElement>) => {
          e.currentTarget.style.borderColor = 'var(--accent)';
        }}
        onMouseOut={(e: MouseEvent<HTMLElement>) => {
          e.currentTarget.style.borderColor = 'var(--border)';
        }}
      >
        <div className="mb-4 flex items-start gap-3">
          <div
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg font-mono text-xs font-semibold"
            style={{
              background: 'var(--bg-inset)',
              color: 'var(--ink-soft)',
              border: '1px solid var(--border)',
            }}
          >
            {tpl.format}
          </div>
          <div className="min-w-0">
            <h3
              className="font-semibold leading-snug transition-colors group-hover:text-[var(--accent-strong)]"
              style={{ color: 'var(--ink)' }}
            >
              {tpl.title}
            </h3>
          </div>
        </div>

        <p className="mb-4 flex-1 text-sm leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
          {tpl.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            {tpl.regulation && (
              <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--ink-mute)' }}>
                {tpl.regulation}
              </span>
            )}
            <span className="font-mono text-[10px]" style={{ color: 'var(--ink-mute)' }}>
              {tpl.formats ? tpl.formats.join(' · ') : tpl.format} · {tpl.size}
            </span>
          </div>
          <span
            className="rounded-lg px-3 py-1.5 text-xs font-medium"
            style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}
          >
            Скачать
          </span>
        </div>
      </article>
    </Link>
  );
}
