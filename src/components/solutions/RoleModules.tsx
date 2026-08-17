import type { RoleSolution } from '@/lib/solutions-data';

/** Модули, которые закрывают задачи роли, с пометкой тарифа. */
export function RoleModules({ role }: { role: RoleSolution }) {
  return (
    <section className="section" style={{ background: 'var(--bg3)' }}>
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow-ref">Что открыто</span>
          <h2>Модули для {role.genitive}</h2>
        </div>
        <div style={{ display: 'grid', gap: 12 }}>
          {role.modules.map((mod) => (
            <div
              key={mod.name}
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 240px) minmax(0, 1fr) auto',
                gap: 20,
                alignItems: 'center',
                padding: '18px 22px',
                background: 'var(--panel)',
                border: '1px solid var(--line2)',
                borderRadius: 12,
              }}
              className="role-module-row"
            >
              <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--t1)' }}>{mod.name}</div>
              <div style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--t3)' }}>{mod.text}</div>
              <span
                style={{
                  flex: 'none',
                  padding: '5px 11px',
                  borderRadius: 6,
                  background: 'var(--inset)',
                  border: '1px solid var(--line2)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10.5,
                  letterSpacing: '0.06em',
                  color: 'var(--t4)',
                  whiteSpace: 'nowrap',
                }}
              >
                {mod.tier}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Таблица «как сейчас» против «как в системе». */
export function RoleCompare({ role }: { role: RoleSolution }) {
  return (
    <section className="section">
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow-ref">Сейчас и в системе</span>
          <h2>Что меняется в работе</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
            <thead>
              <tr>
                <th style={headCell}>Что</th>
                <th style={headCell}>Сейчас</th>
                <th style={{ ...headCell, color: 'var(--acc)' }}>В «Комплид»</th>
              </tr>
            </thead>
            <tbody>
              {role.compare.map((row) => (
                <tr key={row.what}>
                  <td style={{ ...bodyCell, fontWeight: 500, color: 'var(--t1)' }}>{row.what}</td>
                  <td style={{ ...bodyCell, color: 'var(--t4)' }}>{row.now}</td>
                  <td style={{ ...bodyCell, color: 'var(--t2)' }}>{row.next}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
  padding: '16px',
  borderBottom: '1px solid var(--lineSoft)',
  fontSize: 13.5,
  lineHeight: 1.5,
  verticalAlign: 'top',
};
