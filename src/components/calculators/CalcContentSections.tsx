import Link from 'next/link';
import type { CalculatorMeta } from '@/lib/calculators-data';
import { getCalcBySlug } from '@/lib/calculators-data';

// Контент-блоки страницы калькулятора по стандарту §4 плана 02-CALCULATORS-PLAN.md:
// «Как считается» (формула текстом — доступна краулерам), «Пример расчёта»
// (конкретные числа — AEO), «Как использовать», «Нормативное обоснование»
// (авторитетные внешние ссылки) и «Связанные калькуляторы» (семантический граф).

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontSize: 22,
        fontWeight: 600,
        letterSpacing: '-0.015em',
        marginBottom: 16,
        color: 'var(--ink)',
      }}
    >
      {children}
    </h2>
  );
}

function HowItWorksSection({ calc }: { calc: CalculatorMeta }) {
  return (
    <section style={{ marginTop: 48 }}>
      <SectionHeading>Как считается</SectionHeading>
      <p
        className="mono"
        style={{
          padding: '14px 18px',
          background: 'var(--bg-inset)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          fontSize: 13.5,
          lineHeight: 1.6,
          color: 'var(--ink)',
          margin: '0 0 16px',
        }}
      >
        {calc.howItWorks.formula}
      </p>
      <ul style={{ paddingLeft: 20, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {calc.howItWorks.variables.map(v => (
          <li key={v.name} style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.55 }}>
            <strong style={{ color: 'var(--ink)' }}>{v.name}</strong> — {v.description}
          </li>
        ))}
      </ul>
      {calc.howItWorks.note && (
        <p style={{ marginTop: 12, fontSize: 13, color: 'var(--ink-mute)' }}>{calc.howItWorks.note}</p>
      )}
    </section>
  );
}

function ExampleSection({ calc }: { calc: CalculatorMeta }) {
  return (
    <section style={{ marginTop: 48 }}>
      <SectionHeading>Пример расчёта</SectionHeading>
      <div
        style={{
          border: '1px solid var(--border)',
          borderRadius: 10,
          background: 'var(--bg-elev)',
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <div>
          <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>
            Условия
          </p>
          <ul style={{ paddingLeft: 20, margin: 0 }}>
            {calc.example.conditions.map((c, i) => (
              <li key={i} style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.6 }}>{c}</li>
            ))}
          </ul>
        </div>
        <div>
          <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>
            Расчёт
          </p>
          <ul style={{ paddingLeft: 20, margin: 0 }}>
            {calc.example.calculation.map((c, i) => (
              <li
                key={i}
                style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.6, fontVariantNumeric: 'tabular-nums' }}
              >
                {c}
              </li>
            ))}
          </ul>
        </div>
        <p
          style={{
            margin: 0,
            paddingTop: 12,
            borderTop: '1px solid var(--border)',
            fontSize: 14,
            fontWeight: 500,
            color: 'var(--accent-strong)',
          }}
        >
          {calc.example.result}
        </p>
      </div>
    </section>
  );
}

function HowToUseSection({ calc }: { calc: CalculatorMeta }) {
  return (
    <section style={{ marginTop: 48 }}>
      <SectionHeading>Как использовать калькулятор</SectionHeading>
      <ol style={{ paddingLeft: 20, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {calc.howToUse.map((step, i) => (
          <li key={i} style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.55 }}>
            {step}
          </li>
        ))}
      </ol>
    </section>
  );
}

function NormativeBasisSection({ calc }: { calc: CalculatorMeta }) {
  return (
    <section style={{ marginTop: 48 }}>
      <SectionHeading>Нормативное обоснование</SectionHeading>
      <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {calc.normativeBasis.map(ref => (
          <li
            key={ref.url + ref.reference}
            style={{
              padding: '12px 16px',
              border: '1px solid var(--border)',
              borderRadius: 8,
              background: 'var(--bg-elev)',
              fontSize: 14,
              lineHeight: 1.5,
            }}
          >
            <span style={{ color: 'var(--ink)' }}>{ref.title}</span>
            {' — '}
            <a
              href={ref.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--accent-strong)', textDecoration: 'underline' }}
            >
              {ref.reference}
            </a>
          </li>
        ))}
      </ul>
      <p style={{ marginTop: 12, fontSize: 12.5, color: 'var(--ink-mute)' }}>
        Калькулятор носит справочный характер — проверяйте актуальные редакции нормативных
        документов в официальных источниках.
      </p>
    </section>
  );
}

function RelatedSection({ calc }: { calc: CalculatorMeta }) {
  const related = calc.related
    .map(slug => getCalcBySlug(slug))
    .filter((c): c is CalculatorMeta => Boolean(c));
  if (related.length === 0) return null;

  return (
    <section style={{ marginTop: 48 }}>
      <SectionHeading>Связанные калькуляторы</SectionHeading>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
        {related.map(rel => (
          <Link
            key={rel.slug}
            href={`/kalkulyator/${rel.slug}`}
            className="border border-[var(--border)] transition-[border-color] duration-150 hover:border-[var(--accent)]"
            style={{
              display: 'block',
              padding: '14px 18px',
              borderRadius: 10,
              background: 'var(--bg-elev)',
              textDecoration: 'none',
            }}
          >
            <span style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>
              {rel.titleShort}
            </span>
            <span style={{ fontSize: 12.5, color: 'var(--accent-strong)' }}>Открыть →</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function CalcContentSections({ calc }: { calc: CalculatorMeta }) {
  return (
    <>
      <HowItWorksSection calc={calc} />
      <ExampleSection calc={calc} />
      <HowToUseSection calc={calc} />
      <NormativeBasisSection calc={calc} />
      <RelatedSection calc={calc} />
    </>
  );
}
