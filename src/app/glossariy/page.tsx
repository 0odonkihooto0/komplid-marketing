import type { Metadata } from 'next';
import Link from 'next/link';
import { GLOSSARY_TERMS } from '@/lib/glossariy-data';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';
import { ItemListSchema } from '@/components/seo/ItemListSchema';
import { WaitlistSection } from '@/components/blocks/WaitlistSection';

export const metadata: Metadata = {
  title: 'Глоссарий исполнительной документации — термины с примером из практики',
  description:
    'Термины ИД простыми словами: АОСР, АООК, ОЖР, исполнительная схема, захватка, предписание. По каждому — определение, как выглядит на объекте, с чем путают и как называют на стройке.',
  alternates: { canonical: 'https://komplid.ru/glossariy' },
};

export default function GlossariyPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Главная', url: 'https://komplid.ru' },
          { name: 'Глоссарий ИД', url: 'https://komplid.ru/glossariy' },
        ]}
      />
      <ItemListSchema
        name="Глоссарий исполнительной документации"
        items={GLOSSARY_TERMS.map((t) => ({
          name: t.term,
          url: `https://komplid.ru/glossariy/${t.slug}`,
        }))}
      />

      <section className="section" style={{ paddingBottom: 48 }}>
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow-ref">Глоссарий · {GLOSSARY_TERMS.length} терминов</span>
            <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 500, margin: '14px 0' }}>
              Термины исполнительной документации — с примером из практики
            </h1>
            <p>
              Не пересказ определения из свода правил, а объяснение с тем, как это выглядит
              на объекте, с чем путают и как звучит в живой речи на стройке.
            </p>
          </div>

          <div className="mod-grid mod-grid--3">
            {GLOSSARY_TERMS.map((term) => (
              <Link key={term.slug} href={`/glossariy/${term.slug}`} className="mod-featured">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {term.abbr && (
                    <span
                      style={{
                        padding: '4px 9px',
                        borderRadius: 6,
                        background: 'var(--accSoft)',
                        color: 'var(--acc)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      {term.abbr}
                    </span>
                  )}
                  <span
                    className="counter-label"
                    style={{ marginTop: 0, marginLeft: 'auto', letterSpacing: '0.08em' }}
                  >
                    {term.category}
                  </span>
                </div>
                <h2
                  style={{
                    margin: '12px 0 0',
                    fontSize: 16,
                    fontWeight: 500,
                    letterSpacing: 0,
                    color: 'var(--t1)',
                  }}
                >
                  {term.term}
                </h2>
                <p style={{ margin: '9px 0 0', fontSize: 12.5, lineHeight: 1.55, color: 'var(--t3)' }}>
                  {term.teaser}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <WaitlistSection source="glossariy" />
    </>
  );
}
