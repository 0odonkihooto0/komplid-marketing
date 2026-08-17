import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  SP_CLAUSES,
  CLAUSE_DOCS,
  getClauseByPath,
  getClause,
  clauseDocSlug,
  clauseUrlPart,
  clauseUrl,
} from '@/lib/normativ-clauses';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';
import { Faq } from '@/components/blocks/Faq';
import { WaitlistSection } from '@/components/blocks/WaitlistSection';
import { ClausePractice, ClauseDocs, ClauseReturns } from '@/components/normativ/ClauseSections';

interface Params {
  params: Promise<{ doc: string; clause: string }>;
}

export function generateStaticParams() {
  return SP_CLAUSES.map((c) => ({ doc: clauseDocSlug(c), clause: clauseUrlPart(c) }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { doc, clause } = await params;
  const item = getClauseByPath(doc, clause);
  if (!item) return {};

  const meta = CLAUSE_DOCS[item.docKey];
  return {
    title: `${meta?.label} п. ${item.clause} — ${item.short}`,
    description: item.teaser,
    alternates: { canonical: `https://komplid.ru${clauseUrl(item)}` },
  };
}

export default async function ClausePage({ params }: Params) {
  const { doc, clause } = await params;
  const item = getClauseByPath(doc, clause);
  if (!item) notFound();

  const meta = CLAUSE_DOCS[item.docKey];
  const related = item.related
    .map((id) => getClause(id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Главная', url: 'https://komplid.ru' },
          { name: 'Нормативы', url: 'https://komplid.ru/normativ' },
          // На документ ведём, только если он есть в корпусе: иначе хлебная
          // крошка обещала бы страницу, которой нет.
          ...(meta?.slug
            ? [{ name: meta.label, url: `https://komplid.ru/normativ/${meta.slug}` }]
            : []),
          { name: `Пункт ${item.clause}`, url: `https://komplid.ru${clauseUrl(item)}` },
        ]}
      />

      <div className="grid-bg">
        <div className="wrap" style={{ paddingTop: 52, paddingBottom: 44 }}>
          <span className="eyebrow-ref">
            {meta?.label} · {item.topic}
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
            {item.h1}
          </h1>
          {/* Пункт своими словами — прямой ответ, ради которого сюда и приходят */}
          <p style={{ margin: 0, maxWidth: 800, fontSize: 16.5, lineHeight: 1.6, color: 'var(--t3)' }}>
            {item.plain}
          </p>

          <div style={{ marginTop: 24, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {meta?.slug ? (
              <Link href={`/normativ/${meta.slug}`} className="btn-outline">
                Открыть {meta.label} целиком
              </Link>
            ) : (
              <span style={{ fontSize: 13, color: 'var(--t4)', maxWidth: 560, lineHeight: 1.55 }}>
                Полного текста {meta?.label} в нашей библиотеке пока нет — здесь разобран
                только этот пункт.
              </span>
            )}
            <Link href="/normativ" className="btn-outline">
              Все своды правил
            </Link>
          </div>
        </div>
      </div>

      <ClausePractice clause={item} />
      <ClauseDocs clause={item} />
      <ClauseReturns clause={item} />

      <Faq
        eyebrow="Часто спрашивают"
        title={`Вопросы по пункту ${item.clause}`}
        items={item.faq.map((f) => ({ question: f.q, answer: f.a }))}
      />

      {related.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <h2 style={{ fontSize: 22, fontWeight: 600, margin: '0 0 18px' }}>Смежные пункты</h2>
            <div className="mod-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              {related.map((r) => (
                <Link key={r.id} href={clauseUrl(r)} className="mod-featured">
                  <div className="counter-label" style={{ marginTop: 0, color: 'var(--acc)' }}>
                    {CLAUSE_DOCS[r.docKey]?.label} · п. {r.clause}
                  </div>
                  <h3 style={{ margin: '10px 0 0', fontSize: 15.5, fontWeight: 500, letterSpacing: 0 }}>
                    {r.short}
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

      <WaitlistSection source={`normativ-${item.id}`} />
    </>
  );
}
