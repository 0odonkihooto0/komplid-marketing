import type { XsdSchema } from '@/lib/isup-data';

/** Обязательные поля схемы с пояснением, что туда кладут. */
export function SchemaFields({ schema }: { schema: XsdSchema }) {
  return (
    <section className="section" style={{ background: 'var(--bg3)' }}>
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow-ref">Состав</span>
          <h2>Обязательные поля</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
            <thead>
              <tr>
                <th style={headCell}>Элемент</th>
                <th style={headCell}>Тип</th>
                <th style={headCell}>Что туда кладут</th>
              </tr>
            </thead>
            <tbody>
              {schema.fields.map((f) => (
                <tr key={f.name}>
                  <td
                    style={{
                      ...bodyCell,
                      fontFamily: 'var(--font-mono)',
                      fontSize: 13,
                      color: 'var(--t1)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {f.name}
                  </td>
                  <td
                    style={{
                      ...bodyCell,
                      fontFamily: 'var(--font-mono)',
                      fontSize: 12,
                      color: 'var(--t4)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {f.type}
                  </td>
                  <td style={{ ...bodyCell, color: 'var(--t3)' }}>{f.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

/** Фрагмент XML-пакета: служебные строки приглушены, значения выделены. */
export function SchemaXml({ schema }: { schema: XsdSchema }) {
  return (
    <section className="section">
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow-ref">Пример</span>
          <h2>Фрагмент пакета</h2>
        </div>
        <pre
          style={{
            margin: 0,
            padding: '20px 22px',
            borderRadius: 12,
            background: 'var(--inset)',
            border: '1px solid var(--line2)',
            overflowX: 'auto',
            fontFamily: 'var(--font-mono)',
            fontSize: 12.5,
            lineHeight: 1.7,
          }}
        >
          <code>
            {schema.xml.map((line, i) => (
              <div key={i} style={{ color: line.tone === 'tag' ? 'var(--t4)' : 'var(--t2)' }}>
                {line.text || ' '}
              </div>
            ))}
          </code>
        </pre>
      </div>
    </section>
  );
}

/** Ошибки валидатора: код, что он на самом деле значит, и что делать. */
export function SchemaErrors({ schema }: { schema: XsdSchema }) {
  return (
    <section className="section" style={{ background: 'var(--bg3)' }}>
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow-ref">Валидация</span>
          <h2>Ошибки валидации и что они значат</h2>
          <p>
            Сообщения валидатора написаны языком схемы, а не языком стройки. Здесь — перевод
            и то, что с этим делать.
          </p>
        </div>
        <div style={{ display: 'grid', gap: 14 }}>
          {schema.errors.map((err) => (
            <div
              key={err.tag}
              style={{
                padding: '20px 22px',
                background: 'var(--panel)',
                border: '1px solid var(--line2)',
                borderRadius: 12,
              }}
            >
              <div
                style={{
                  display: 'inline-block',
                  padding: '4px 10px',
                  borderRadius: 6,
                  background: 'oklch(0.62 0.18 27 / 0.12)',
                  color: 'var(--err)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                {err.tag}
              </div>
              <pre
                style={{
                  margin: '12px 0 0',
                  padding: '12px 14px',
                  borderRadius: 8,
                  background: 'var(--inset)',
                  border: '1px solid var(--line2)',
                  overflowX: 'auto',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  lineHeight: 1.55,
                  color: 'var(--t3)',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {err.code}
              </pre>
              <div style={{ marginTop: 14 }}>
                <div className="counter-label" style={{ marginTop: 0 }}>
                  Что это значит
                </div>
                <p style={{ margin: '7px 0 0', fontSize: 13.5, lineHeight: 1.55, color: 'var(--t3)' }}>
                  {err.cause}
                </p>
              </div>
              <div style={{ marginTop: 14 }}>
                <div className="counter-label" style={{ marginTop: 0, color: 'var(--acc)' }}>
                  Что делать
                </div>
                <p style={{ margin: '7px 0 0', fontSize: 13.5, lineHeight: 1.55, color: 'var(--t2)' }}>
                  {err.fix}
                </p>
              </div>
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
  padding: '14px 16px',
  borderBottom: '1px solid var(--lineSoft)',
  fontSize: 13.5,
  lineHeight: 1.5,
  verticalAlign: 'top',
};
