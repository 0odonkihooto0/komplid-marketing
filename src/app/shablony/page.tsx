import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllTemplates, type TemplateFrontmatter } from '@/content-loader/shablony';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';
import { WaitlistSection } from '@/components/blocks/WaitlistSection';

export const metadata: Metadata = {
  title: 'Бесплатные шаблоны документов для стройки 2026 — 26 бланков',
  description:
    'Бланки исполнительной документации: акты по приказу Минстроя № 344/пр, общий журнал работ, КС-2, КС-3, КС-6а, специальные журналы и акты приёмки. Форматы .docx и .xlsx, без регистрации.',
  alternates: { canonical: 'https://komplid.ru/shablony' },
  openGraph: {
    type: 'website',
    title: 'Бесплатные шаблоны строительной документации',
    description:
      'Акты по приказу № 344/пр, общий журнал работ, формы КС, специальные журналы и акты приёмки — 26 бланков. Скачать бесплатно.',
  },
};

/**
 * Порядок разделов каталога.
 *
 * Задан явно, а не выводится из порядка файлов: категории собирались в Map по
 * мере чтения каталога, то есть по дате публикации шаблонов. Раздел с формами
 * по приказу № 344/пр от этого уезжал вниз, хотя именно за ними приходят чаще
 * всего. Категория, которой нет в списке, выводится после перечисленных.
 */
const CATEGORY_ORDER = [
  'Исполнительная документация',
  'Журналы работ',
  'Приёмка работ',
  'Приёмка конструкций и покрытий',
  'Свайные и земляные работы',
] as const;

/** Подпись под заголовком раздела — что за документы внутри. */
const CATEGORY_HINT: Record<string, string> = {
  'Исполнительная документация':
    'Акты по приложениям к составу исполнительной документации, приказ Минстроя России от 16.05.2023 № 344/пр.',
  'Журналы работ':
    'Общий журнал работ по приказу № 1026/пр и специальные журналы из приложения Б.1 СП 48.13330.2019.',
  'Приёмка работ':
    'Унифицированные формы Госкомстата для расчётов с заказчиком: акт, справка о стоимости и журнал учёта.',
  'Приёмка конструкций и покрытий':
    'Итоговые акты по готовым конструкциям, покрытиям и результатам контроля сварных соединений.',
  'Свайные и земляные работы':
    'Котлованы, погружение и приёмка свай, испытания — документы нулевого цикла.',
};

function sortCategories(categories: string[]): string[] {
  const rank = (name: string) => {
    const i = CATEGORY_ORDER.indexOf(name as (typeof CATEGORY_ORDER)[number]);
    return i === -1 ? CATEGORY_ORDER.length : i;
  };
  return [...categories].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b, 'ru'));
}

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
          <span className="eyebrow">Комплид · Шаблоны</span>
          <h1
            className="mb-4 mt-3 text-4xl font-medium"
            style={{ letterSpacing: '-0.025em', color: 'var(--ink)' }}
          >
            Бесплатные шаблоны строительной документации
          </h1>
          <p className="max-w-xl text-lg" style={{ color: 'var(--ink-soft)' }}>
            {templates.length} бланков в форматах .docx и .xlsx — акты по приказу Минстроя
            № 344/пр, общий журнал работ, формы КС, специальные журналы и акты приёмки.
            Скачивание без регистрации.
          </p>
        </div>
      </div>

      <div className="section wrap">
        {templates.length === 0 ? (
          <p style={{ color: 'var(--ink-soft)' }}>Шаблоны скоро появятся.</p>
        ) : (
          <div className="flex flex-col gap-16">
            {sortCategories(Array.from(byCategory.keys())).map((category) => (
              <section key={category}>
                <h2
                  className="mb-1 text-sm font-mono uppercase tracking-widest"
                  style={{ color: 'var(--ink-mute)', letterSpacing: '0.14em' }}
                >
                  {category}
                </h2>
                {CATEGORY_HINT[category] && (
                  <p className="mb-6 max-w-2xl text-sm" style={{ color: 'var(--ink-soft)' }}>
                    {CATEGORY_HINT[category]}
                  </p>
                )}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {(byCategory.get(category) ?? []).map((tpl) => (
                    <TemplateCard key={tpl.slug} tpl={tpl} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      <WaitlistSection source="shablony" />
    </>
  );
}

function TemplateCard({ tpl }: { tpl: TemplateFrontmatter; key?: string }) {
  return (
    <Link href={`/shablony/${tpl.slug}`} className="group block">
      <article
        className="flex h-full flex-col rounded-xl border border-[var(--border)] p-5 transition-colors group-hover:border-[var(--accent)]"
        style={{
          background: 'var(--bg-elev)',
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
