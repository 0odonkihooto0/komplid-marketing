import type { SpClause } from '@/lib/normativ-clauses';

/** Что пункт означает на объекте — по одному тезису на строку. */
export function ClausePractice({ clause }: { clause: SpClause }) {
  return (
    <section className="section" style={{ background: 'var(--bg3)' }}>
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow-ref">На объекте</span>
          <h2>Что это значит на практике</h2>
        </div>
        <div style={{ display: 'grid', gap: 10, maxWidth: 900 }}>
          {clause.practice.map((line, i) => (
            <div
              key={line}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 14,
                padding: '16px 20px',
                background: 'var(--panel)',
                border: '1px solid var(--line2)',
                borderRadius: 10,
              }}
            >
              <span
                style={{
                  flex: 'none',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--acc)',
                  minWidth: 22,
                }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <span style={{ fontSize: 14.5, lineHeight: 1.55, color: 'var(--t2)' }}>{line}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Какие документы требует пункт. */
export function ClauseDocs({ clause }: { clause: SpClause }) {
  return (
    <section className="section">
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow-ref">Документы</span>
          <h2>Какие документы требует этот пункт</h2>
        </div>
        <div className="mod-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {clause.docs.map((doc) => (
            <div className="mod-featured" key={doc.name}>
              <span
                style={{
                  display: 'inline-block',
                  padding: '4px 9px',
                  borderRadius: 6,
                  background: 'var(--accSoft)',
                  color: 'var(--acc)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                {doc.code}
              </span>
              <h3 style={{ margin: '12px 0 0', fontSize: 15, fontWeight: 500, letterSpacing: 0 }}>
                {doc.name}
              </h3>
              <p style={{ margin: '8px 0 0', fontSize: 12.5, lineHeight: 1.5, color: 'var(--t3)' }}>
                {doc.note}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Из-за чего по этому пункту возвращают документацию. */
export function ClauseReturns({ clause }: { clause: SpClause }) {
  return (
    <section className="section" style={{ background: 'var(--bg3)' }}>
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow-ref">Возвраты</span>
          <h2>Из-за этого пункта возвращают</h2>
          <p>
            Порядок причин — по опыту составителей документации, а не по нашим замерам:
            своей статистики возвратов у нас пока нет.
          </p>
        </div>
        <div style={{ display: 'grid', gap: 10, maxWidth: 900 }}>
          {clause.returns.map((r) => (
            <div
              key={r.text}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '15px 20px',
                background: 'var(--panel)',
                border: '1px solid var(--line2)',
                borderRadius: 10,
              }}
            >
              <span
                style={{
                  flex: 'none',
                  minWidth: 52,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--acc)',
                }}
              >
                {r.share}
              </span>
              <span style={{ fontSize: 14, color: 'var(--t2)' }}>{r.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
