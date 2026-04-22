interface ComparisonTableProps {
  columns: string[];
  rows: Array<{ feature: string; values: Array<string | boolean> }>;
}

export function ComparisonTable({ columns, rows }: ComparisonTableProps) {
  return (
    <div className="my-8 overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr style={{ borderBottom: '2px solid var(--ink)' }}>
            <th
              className="py-2 px-4 text-left font-semibold"
              style={{ color: 'var(--ink)' }}
            >
              Возможность
            </th>
            {columns.map((col) => (
              <th
                key={col}
                className="py-2 px-4 text-center font-semibold"
                style={{ color: 'var(--ink)' }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              style={{ borderBottom: '1px solid var(--border)' }}
              className="hover:bg-[var(--bg-hover)] transition-colors"
            >
              <td className="py-2 px-4 font-medium text-[var(--ink)]">
                {row.feature}
              </td>
              {row.values.map((v, j) => (
                <td
                  key={j}
                  className="py-2 px-4 text-center"
                  style={{
                    color:
                      v === true
                        ? 'var(--ok)'
                        : v === false
                          ? 'var(--ink-mute)'
                          : 'var(--ink-soft)',
                  }}
                >
                  {typeof v === 'boolean' ? (v ? '✓' : '✗') : v}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
