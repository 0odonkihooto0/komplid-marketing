import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { DOC_FORMS, getDocForm } from '@/lib/formy-data';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';
import { Faq } from '@/components/blocks/Faq';
import { WaitlistSection } from '@/components/blocks/WaitlistSection';
import { FormSigners, FormAppendices, FormTimeline, FormReturns } from '@/components/formy/FormSections';

interface Params {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return DOC_FORMS.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const form = getDocForm(slug);
  if (!form) return {};

  return {
    title: `${form.name} (${form.code}) — кто подписывает и когда оформляется`,
    description: form.summary,
    alternates: { canonical: `https://komplid.ru/formy/${slug}` },
  };
}

export default async function FormPage({ params }: Params) {
  const { slug } = await params;
  const form = getDocForm(slug);
  if (!form) notFound();

  const related = form.related
    .map((s) => getDocForm(s))
    .filter((f): f is NonNullable<typeof f> => Boolean(f));

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Главная', url: 'https://komplid.ru' },
          { name: 'Формы ИД', url: 'https://komplid.ru/formy' },
          { name: form.code, url: `https://komplid.ru/formy/${slug}` },
        ]}
      />

      <div className="grid-bg">
        <div className="wrap" style={{ paddingTop: 52, paddingBottom: 44 }}>
          <span className="eyebrow-ref">
            {form.section} · {form.code}
          </span>
          <h1
            style={{
              margin: '18px 0 16px',
              maxWidth: 860,
              fontSize: 'clamp(26px, 3.6vw, 42px)',
              lineHeight: 1.08,
              fontWeight: 500,
            }}
          >
            {form.name}
          </h1>
          {/* Прямой ответ «когда оформляется» — первым же абзацем, для AEO */}
          <p style={{ margin: 0, maxWidth: 760, fontSize: 16.5, lineHeight: 1.6, color: 'var(--t3)' }}>
            {form.answer}
          </p>

          <div
            style={{
              marginTop: 26,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 10,
            }}
          >
            {[
              { label: 'Основание', value: form.basis },
              { label: 'Формат', value: form.format },
              { label: 'Хранение', value: form.storage },
              { label: 'Виды работ', value: form.works.join(' · ') },
            ].map((chip) => (
              <span
                key={chip.label}
                style={{
                  padding: '9px 14px',
                  borderRadius: 999,
                  background: 'var(--panel)',
                  border: '1px solid var(--line2)',
                  fontSize: 12.5,
                  color: 'var(--t3)',
                }}
              >
                <span style={{ color: 'var(--t5)' }}>{chip.label}: </span>
                {chip.value}
              </span>
            ))}
          </div>
          <p style={{ margin: '16px 0 0', maxWidth: 760, fontSize: 13, color: 'var(--t4)' }}>
            {form.basisNote}
          </p>
        </div>
      </div>

      <FormSigners form={form} />
      <FormAppendices form={form} />
      <FormTimeline form={form} />
      <FormReturns form={form} />

      <Faq eyebrow="Часто спрашивают" title={`Вопросы по форме «${form.code}»`} items={form.faq.map((f) => ({ question: f.q, answer: f.a }))} />

      {form.templateSlug && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 16,
                padding: '20px 24px',
                borderRadius: 12,
                background: 'var(--bg-inset)',
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ flex: '1 1 320px' }}>
                <div className="counter-label" style={{ marginTop: 0, color: 'var(--acc)' }}>
                  Готовый бланк
                </div>
                <p style={{ margin: '8px 0 0', fontSize: 14.5, color: 'var(--ink)' }}>
                  Бланк формы «{form.code}» — заполненная шапка, таблицы и поля подписей.
                  Скачивание без регистрации.
                </p>
              </div>
              <Link
                href={`/shablony/${form.templateSlug}`}
                className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium"
                style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}
              >
                Открыть бланк
              </Link>
            </div>
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <h2 style={{ fontSize: 22, fontWeight: 600, margin: '0 0 18px' }}>Связанные формы</h2>
            <div className="mod-grid mod-grid--3">
              {related.map((r) => (
                <Link key={r.slug} href={`/formy/${r.slug}`} className="mod-featured">
                  <div className="counter-label" style={{ marginTop: 0, color: 'var(--acc)' }}>
                    {r.code}
                  </div>
                  <h3 style={{ margin: '10px 0 0', fontSize: 15.5, fontWeight: 500, letterSpacing: 0 }}>
                    {r.name}
                  </h3>
                  <p style={{ margin: '8px 0 0', fontSize: 12.5, lineHeight: 1.5, color: 'var(--t3)' }}>
                    {r.summary}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <WaitlistSection source={`formy-${slug}`} />
    </>
  );
}
