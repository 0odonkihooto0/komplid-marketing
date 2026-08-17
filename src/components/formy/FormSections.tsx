import type { DocForm } from '@/lib/formy-data';

/** Кто подписывает и что подтверждает каждая подпись. */
export function FormSigners({ form }: { form: DocForm }) {
  return (
    <section className="section" style={{ background: 'var(--bg3)' }}>
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow-ref">Подписи</span>
          <h2>Кто подписывает</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 620 }}>
            <thead>
              <tr>
                <th style={headCell}>Сторона</th>
                <th style={headCell}>Что подтверждает подпись</th>
                <th style={headCell}>Когда нужна</th>
              </tr>
            </thead>
            <tbody>
              {form.signers.map((s) => (
                <tr key={s.role}>
                  <td style={{ ...bodyCell, fontWeight: 500, color: 'var(--t1)' }}>{s.role}</td>
                  <td style={{ ...bodyCell, color: 'var(--t3)' }}>{s.confirms}</td>
                  <td style={{ ...bodyCell, color: 'var(--t4)', whiteSpace: 'nowrap' }}>
                    {s.required}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

/** Обязательные приложения к форме. */
export function FormAppendices({ form }: { form: DocForm }) {
  return (
    <section className="section">
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow-ref">Приложения</span>
          <h2>Что прикладывается обязательно</h2>
        </div>
        <div style={{ display: 'grid', gap: 10 }}>
          {form.appendices.map((a) => (
            <div
              key={a.title}
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
                  marginTop: 6,
                  width: 6,
                  height: 6,
                  background: 'var(--acc)',
                }}
              />
              <div>
                <div style={{ fontSize: 14.5, fontWeight: 500, color: 'var(--t1)' }}>{a.title}</div>
                <div style={{ marginTop: 4, fontSize: 13, color: 'var(--t4)' }}>{a.note}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Когда оформляется — по шагам. */
export function FormTimeline({ form }: { form: DocForm }) {
  return (
    <section className="section" style={{ background: 'var(--bg3)' }}>
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow-ref">Сроки</span>
          <h2>Когда оформляется</h2>
        </div>
        <div className="mod-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {form.timeline.map((step) => (
            <div className="mod-featured" key={step.when}>
              <div
                style={{
                  display: 'inline-flex',
                  padding: '4px 10px',
                  borderRadius: 999,
                  background: 'var(--accSoft)',
                  color: 'var(--acc)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10.5,
                  fontWeight: 500,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                {step.when}
              </div>
              <h3 style={{ margin: '12px 0 0', fontSize: 15.5, fontWeight: 500, letterSpacing: 0 }}>
                {step.title}
              </h3>
              <p style={{ margin: '9px 0 0', fontSize: 12.5, lineHeight: 1.55, color: 'var(--t3)' }}>
                {step.note}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Из-за чего форму возвращают. Доли рядом с причинами — оценка составителя
 * прототипа, а не наша измеренная статистика, поэтому подписаны явно.
 */
export function FormReturns({ form }: { form: DocForm }) {
  return (
    <section className="section">
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow-ref">Возвраты</span>
          <h2>Из-за чего эту форму возвращают</h2>
          <p>
            Порядок причин — по опыту составителей документации, а не по нашим замерам:
            своей статистики возвратов у нас пока нет.
          </p>
        </div>
        <div style={{ display: 'grid', gap: 10 }}>
          {form.returns.map((r) => (
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

const headCell: React.CSSProperties = {
  textAlign: 'left',
  padding: '0 16px 12px',
  borderBottom: '1px solid var(--line3)',
  fontFamily: 'var(--font-mono)',
  fontSize: 10.5,
  fontWeight: 500,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: 'var(--t4)',
};

const bodyCell: React.CSSProperties = {
  padding: '15px 16px',
  borderBottom: '1px solid var(--lineSoft)',
  fontSize: 13.5,
  lineHeight: 1.5,
  verticalAlign: 'top',
};
