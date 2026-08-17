import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { XSD_SCHEMAS, getXsdSchema } from '@/lib/isup-data';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';
import { Faq } from '@/components/blocks/Faq';
import { WaitlistSection } from '@/components/blocks/WaitlistSection';
import { SchemaFields, SchemaXml, SchemaErrors } from '@/components/isup/SchemaSections';

interface Params {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return XSD_SCHEMAS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const schema = getXsdSchema(slug);
  if (!schema) return {};

  return {
    title: `${schema.h1} — поля и ошибки валидации`,
    description: schema.teaser,
    alternates: { canonical: `https://komplid.ru/isup/${slug}` },
  };
}

export default async function SchemaPage({ params }: Params) {
  const { slug } = await params;
  const schema = getXsdSchema(slug);
  if (!schema) notFound();

  const others = XSD_SCHEMAS.filter((s) => s.slug !== slug).slice(0, 3);

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Главная', url: 'https://komplid.ru' },
          { name: 'ИСУП и XSD-схемы', url: 'https://komplid.ru/isup' },
          { name: schema.code, url: `https://komplid.ru/isup/${slug}` },
        ]}
      />

      <div className="grid-bg">
        <div className="wrap" style={{ paddingTop: 52, paddingBottom: 44 }}>
          <span className="eyebrow-ref">
            {schema.group} · схема {schema.code} · версия {schema.version}
          </span>
          <h1
            style={{
              margin: '18px 0 16px',
              maxWidth: 880,
              fontSize: 'clamp(26px, 3.6vw, 42px)',
              lineHeight: 1.08,
              fontWeight: 500,
            }}
          >
            {schema.h1}
          </h1>
          {/* Что это простыми словами — прямой ответ первым абзацем */}
          <p style={{ margin: 0, maxWidth: 800, fontSize: 16.5, lineHeight: 1.6, color: 'var(--t3)' }}>
            {schema.plain}
          </p>

          <div style={{ marginTop: 26, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {[
              { label: 'Файл', value: schema.fileName },
              { label: 'Версия схемы', value: schema.version },
              { label: 'Очередь в пакете', value: String(schema.order) },
            ].map((chip) => (
              <span
                key={chip.label}
                style={{
                  padding: '9px 14px',
                  borderRadius: 999,
                  background: 'var(--panel)',
                  border: '1px solid var(--line2)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  color: 'var(--t3)',
                }}
              >
                <span style={{ color: 'var(--t5)' }}>{chip.label}: </span>
                {chip.value}
              </span>
            ))}
          </div>
        </div>
      </div>

      <SchemaFields schema={schema} />
      <SchemaXml schema={schema} />
      <SchemaErrors schema={schema} />

      <Faq
        eyebrow="Часто спрашивают"
        title={`Вопросы по схеме ${schema.code}`}
        items={schema.faq.map((f) => ({ question: f.q, answer: f.a }))}
      />

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <h2 style={{ fontSize: 22, fontWeight: 600, margin: '0 0 18px' }}>Другие схемы пакета</h2>
          <div className="mod-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {others.map((s) => (
              <Link key={s.slug} href={`/isup/${s.slug}`} className="mod-featured">
                <div className="counter-label" style={{ marginTop: 0, color: 'var(--acc)' }}>
                  {s.code}
                </div>
                <h3 style={{ margin: '10px 0 0', fontSize: 15.5, fontWeight: 500, letterSpacing: 0 }}>
                  {s.short}
                </h3>
                <p style={{ margin: '8px 0 0', fontSize: 12.5, lineHeight: 1.5, color: 'var(--t3)' }}>
                  {s.teaser}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <WaitlistSection source={`isup-${slug}`} />
    </>
  );
}
