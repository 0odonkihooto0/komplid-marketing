interface ComparisonRow {
  feature: string;
  values: Array<string | boolean>;
}

interface ComparisonTableProps {
  eyebrow?: string;
  title?: string;
  columns: string[];
  rows: ComparisonRow[];
  highlightColumn?: number;
}

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
    <path d="M5 12l5 5L20 7" />
  </svg>
);

const CrossIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
    <path d="M6 6l12 12M6 18L18 6" />
  </svg>
);

export function ComparisonTable({ eyebrow, title, columns, rows, highlightColumn }: ComparisonTableProps) {
  return (
    <section className="section">
      <div className="wrap">
        {(eyebrow || title) && (
          <div className="section-head">
            {eyebrow && <span className="eyebrow">{eyebrow}</span>}
            {title && <h2>{title}</h2>}
          </div>
        )}

        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: 14,
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '12px 16px',
                    borderBottom: '2px solid var(--border-strong)',
                    fontWeight: 600,
                    fontSize: 13,
                    color: 'var(--ink-soft)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Возможность
                </th>
                {columns.map((col, i) => (
                  <th
                    key={col}
                    style={{
                      textAlign: 'center',
                      padding: '12px 16px',
                      borderBottom: '2px solid var(--border-strong)',
                      fontWeight: 600,
                      fontSize: 13,
                      color: i === highlightColumn ? 'var(--accent-strong)' : 'var(--ink-soft)',
                      borderLeft: i === highlightColumn ? '2px solid var(--accent)' : undefined,
                      borderRight: i === highlightColumn ? '2px solid var(--accent)' : undefined,
                      whiteSpace: 'nowrap',
                      background: i === highlightColumn ? 'color-mix(in oklch, var(--accent) 6%, transparent)' : undefined,
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr
                  key={row.feature}
                  style={{ background: ri % 2 === 0 ? 'var(--bg-inset)' : 'var(--bg-elev)' }}
                >
                  <td
                    style={{
                      padding: '11px 16px',
                      borderBottom: '1px solid var(--border)',
                      color: 'var(--ink-soft)',
                      fontWeight: 500,
                    }}
                  >
                    {row.feature}
                  </td>
                  {row.values.map((val, vi) => (
                    <td
                      key={vi}
                      style={{
                        textAlign: 'center',
                        padding: '11px 16px',
                        borderBottom: '1px solid var(--border)',
                        borderLeft: vi === highlightColumn ? '2px solid var(--accent)' : undefined,
                        borderRight: vi === highlightColumn ? '2px solid var(--accent)' : undefined,
                        background: vi === highlightColumn ? 'color-mix(in oklch, var(--accent) 6%, transparent)' : undefined,
                        fontWeight: vi === highlightColumn ? 600 : 400,
                      }}
                    >
                      {typeof val === 'boolean' ? (
                        <span style={{ color: val ? 'var(--ok)' : 'var(--ink-mute)', display: 'inline-flex', justifyContent: 'center' }}>
                          {val ? <CheckIcon /> : <CrossIcon />}
                        </span>
                      ) : (
                        <span style={{ color: vi === highlightColumn ? 'var(--ink)' : 'var(--ink-soft)' }}>{val}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
