import type { RoleSolution } from '@/lib/solutions-data';

/** Цвет метки в демонстрационной ленте. */
const TONE: Record<string, { color: string; bg: string }> = {
  ok: { color: 'var(--ok)', bg: 'var(--okSoft)' },
  warn: { color: 'var(--acc)', bg: 'var(--accSoft)' },
  bad: { color: 'var(--err)', bg: 'oklch(0.62 0.18 27 / 0.12)' },
};

/**
 * Демонстрационная лента справа от заголовка. Это иллюстрация того, как
 * выглядит рабочий экран роли, а не снимок интерфейса и не метрика клиента.
 */
export function RoleScreen({ role }: { role: RoleSolution }) {
  return (
    <div
      aria-hidden="true"
      style={{
        background: 'var(--panel)',
        border: '1px solid var(--line3)',
        borderRadius: 14,
        boxShadow: '0 24px 60px var(--shadow)',
        overflow: 'hidden',
      }}
    >
      <div
        className="counter-label"
        style={{ margin: 0, padding: '14px 20px', borderBottom: '1px solid var(--line2)' }}
      >
        {role.screenTitle}
      </div>
      {role.screenRows.map((row) => {
        const tone = TONE[row.tone] ?? TONE.warn!;
        return (
          <div
            key={row.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '15px 20px',
              borderBottom: '1px solid var(--lineSoft)',
            }}
          >
            <span
              style={{ flex: 'none', width: 6, height: 6, borderRadius: '50%', background: tone.color }}
            />
            <span style={{ fontSize: 13.5, color: 'var(--t2)' }}>{row.label}</span>
            <span
              style={{
                marginLeft: 'auto',
                flex: 'none',
                padding: '4px 9px',
                borderRadius: 5,
                background: tone.bg,
                color: tone.color,
                fontFamily: 'var(--font-mono)',
                fontSize: 10.5,
                fontWeight: 600,
              }}
            >
              {row.meta}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/** Три боли роли — пронумерованные карточки. */
export function RolePains({ role }: { role: RoleSolution }) {
  return (
    <section className="section" style={{ background: 'var(--bg3)' }}>
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow-ref">Что болит</span>
          <h2>{role.painTitle}</h2>
          <p>{role.painLead}</p>
        </div>
        <div className="mod-grid mod-grid--3">
          {role.pains.map((pain) => (
            <div className="mod-featured" key={pain.n}>
              <div className="counter-label" style={{ marginTop: 0, color: 'var(--acc)' }}>
                {pain.n}
              </div>
              <h3 style={{ margin: '10px 0 0', fontSize: 17, fontWeight: 500, letterSpacing: 0 }}>
                {pain.title}
              </h3>
              <p style={{ margin: '10px 0 0', fontSize: 13, lineHeight: 1.55, color: 'var(--t3)' }}>
                {pain.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Рабочий день роли по шагам. */
export function RoleDay({ role }: { role: RoleSolution }) {
  return (
    <section className="section">
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow-ref">Как это работает</span>
          <h2>{role.dayTitle}</h2>
          <p>{role.dayLead}</p>
        </div>
        <div className="mod-grid mod-grid--4">
          {role.day.map((step) => (
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
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
