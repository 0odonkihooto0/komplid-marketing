import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { GLOSSARY_TERMS, getGlossaryTerm } from '@/lib/glossariy-data';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';
import { JsonLd } from '@/components/seo/JsonLd';
import { Faq } from '@/components/blocks/Faq';
import { WaitlistSection } from '@/components/blocks/WaitlistSection';
import { TermBlock, TermUsageList } from '@/components/glossariy/TermSections';

interface Params {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return GLOSSARY_TERMS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const term = getGlossaryTerm(slug);
  if (!term) return {};

  const title = term.abbr ? `${term.abbr} — ${term.term}: что это` : `${term.term}: что это`;
  return {
    title,
    description: term.teaser,
    keywords: [term.term, term.abbr, ...term.synonyms].filter(Boolean),
    alternates: { canonical: `https://komplid.ru/glossariy/${slug}` },
  };
}

export default async function TermPage({ params }: Params) {
  const { slug } = await params;
  const term = getGlossaryTerm(slug);
  if (!term) notFound();

  const related = GLOSSARY_TERMS.filter((t) => term.related.includes(t.slug));

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Главная', url: 'https://komplid.ru' },
          { name: 'Глоссарий ИД', url: 'https://komplid.ru/glossariy' },
          { name: term.abbr || term.term, url: `https://komplid.ru/glossariy/${slug}` },
        ]}
      />
      {/* DefinedTerm — профильная разметка для словарной статьи: по ней
          ассистенты понимают, что это определение, а не обычный текст. */}
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'DefinedTerm',
          name: term.term,
          alternateName: [term.abbr, ...term.synonyms].filter(Boolean),
          description: term.definition,
          inDefinedTermSet: {
            '@type': 'DefinedTermSet',
            name: 'Глоссарий исполнительной документации «Комплид»',
            url: 'https://komplid.ru/glossariy',
          },
          url: `https://komplid.ru/glossariy/${slug}`,
        }}
      />

      <div className="grid-bg">
        <div className="wrap" style={{ paddingTop: 52, paddingBottom: 44 }}>
          <span className="eyebrow-ref">{term.category}</span>
          <h1
            style={{
              margin: '18px 0 16px',
              maxWidth: 860,
              fontSize: 'clamp(26px, 3.6vw, 42px)',
              lineHeight: 1.08,
              fontWeight: 500,
            }}
          >
            {term.term}
            {term.abbr && <span style={{ color: 'var(--t4)' }}> · {term.abbr}</span>}
          </h1>
          {/* Определение первым абзацем — это и есть прямой ответ для AEO */}
          <p style={{ margin: 0, maxWidth: 780, fontSize: 16.5, lineHeight: 1.6, color: 'var(--t3)' }}>
            {term.definition}
          </p>
          <div
            style={{
              marginTop: 22,
              padding: '14px 18px',
              borderRadius: 10,
              background: 'var(--panel)',
              border: '1px solid var(--line2)',
              maxWidth: 780,
            }}
          >
            <div className="counter-label" style={{ marginTop: 0 }}>
              Основание
            </div>
            <div style={{ marginTop: 7, fontSize: 14, color: 'var(--t2)' }}>{term.source}</div>
            <div style={{ marginTop: 5, fontSize: 12.5, color: 'var(--t4)' }}>{term.sourceNote}</div>
          </div>
        </div>
      </div>

      <TermBlock eyebrow="На объекте" title="Как выглядит на объекте" text={term.example} />
      <TermBlock
        eyebrow="Как говорят"
        title="Как это звучит на стройке"
        text={`«${term.speech}»`}
        muted
        quote
      />
      <TermBlock eyebrow="Внимание" title="Что важно не перепутать" text={term.confusion} />

      <TermUsageList term={term} />

      <Faq
        eyebrow="Часто спрашивают"
        title={`Вопросы про ${term.abbr || term.term.toLowerCase()}`}
        items={term.faq.map((f) => ({ question: f.q, answer: f.a }))}
      />

      {related.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <h2 style={{ fontSize: 22, fontWeight: 600, margin: '0 0 18px' }}>Смежные термины</h2>
            <div className="mod-grid mod-grid--3">
              {related.map((r) => (
                <Link key={r.slug} href={`/glossariy/${r.slug}`} className="mod-featured">
                  <h3 style={{ margin: 0, fontSize: 15.5, fontWeight: 500, letterSpacing: 0 }}>
                    {r.term}
                  </h3>
                  <p style={{ margin: '8px 0 0', fontSize: 12.5, lineHeight: 1.5, color: 'var(--t3)' }}>
                    {r.teaser}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <WaitlistSection source={`glossariy-${slug}`} />
    </>
  );
}
