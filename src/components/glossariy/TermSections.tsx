import Link from 'next/link';
import type { GlossaryTerm } from '@/lib/glossariy-data';

interface BlockProps {
  eyebrow: string;
  title: string;
  text: string;
  /** Фон посветлее — чтобы соседние блоки чередовались */
  muted?: boolean;
  /** Живая речь со стройки — набирается крупнее и курсивом */
  quote?: boolean;
}

/** Однотипный текстовый блок словарной статьи. */
export function TermBlock({ eyebrow, title, text, muted = false, quote = false }: BlockProps) {
  return (
    <section className="section" style={muted ? { background: 'var(--bg3)' } : undefined}>
      <div className="wrap">
        <div className="section-head" style={{ marginBottom: 20 }}>
          <span className="eyebrow-ref">{eyebrow}</span>
          <h2>{title}</h2>
        </div>
        <p
          style={{
            margin: 0,
            maxWidth: 820,
            fontSize: quote ? 20 : 16,
            lineHeight: 1.6,
            fontStyle: quote ? 'italic' : undefined,
            color: quote ? 'var(--t2)' : 'var(--t3)',
            borderLeft: quote ? '3px solid var(--acc)' : undefined,
            paddingLeft: quote ? 20 : undefined,
          }}
        >
          {text}
        </p>
      </div>
    </section>
  );
}

/** Где термин встречается в работе — перелинковка на формы, нормативы и схемы. */
export function TermUsageList({ term }: { term: GlossaryTerm }) {
  return (
    <section className="section">
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow-ref">Связи</span>
          <h2>Где встречается в работе</h2>
        </div>

        <div style={{ display: 'grid', gap: 10 }}>
          {term.usage.map((u) => (
            <Link
              key={u.url}
              href={u.url}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '16px 20px',
                background: 'var(--panel)',
                border: '1px solid var(--line2)',
                borderRadius: 10,
              }}
              className="profi-card"
            >
              <span
                style={{
                  flex: 'none',
                  minWidth: 88,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10.5,
                  fontWeight: 500,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--acc)',
                }}
              >
                {u.kind}
              </span>
              <span style={{ fontSize: 14, color: 'var(--t2)' }}>{u.text}</span>
              <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', color: 'var(--t4)' }}>
                →
              </span>
            </Link>
          ))}
        </div>

        {term.synonyms.length > 0 && (
          <div style={{ marginTop: 28 }}>
            <div className="counter-label" style={{ marginTop: 0, marginBottom: 12 }}>
              Как ещё называют
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {term.synonyms.map((s) => (
                <span
                  key={s}
                  style={{
                    padding: '7px 13px',
                    borderRadius: 999,
                    background: 'var(--inset)',
                    border: '1px solid var(--line2)',
                    fontSize: 13,
                    color: 'var(--t3)',
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        <div
          style={{
            marginTop: 28,
            padding: '18px 22px',
            borderRadius: 12,
            background: 'var(--accCard)',
            border: '1px solid var(--acc)',
            maxWidth: 820,
          }}
        >
          <div className="counter-label" style={{ marginTop: 0, color: 'var(--acc)' }}>
            В «Комплид»
          </div>
          <p style={{ margin: '9px 0 0', fontSize: 14.5, lineHeight: 1.55, color: 'var(--t2)' }}>
            {term.product}
          </p>
        </div>
      </div>
    </section>
  );
}
