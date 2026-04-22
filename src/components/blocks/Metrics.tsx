interface MetricItem {
  number: string;
  label: string;
  description?: string;
}

interface MetricsProps {
  eyebrow?: string;
  title: string;
  description?: string;
  items: MetricItem[];
  variant?: 'default' | 'dark';
}

export function Metrics({ eyebrow, title, description, items, variant = 'dark' }: MetricsProps) {
  const isDark = variant === 'dark';

  return (
    <section
      className={isDark ? 'section section--invert' : 'section'}
      style={{ padding: 0 }}
    >
      <div className="wrap" style={{ paddingTop: 80, paddingBottom: 80 }}>
        <div className="section-head">
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${Math.min(items.length, 4)}, 1fr)`,
          borderTop: `1px solid ${isDark ? 'var(--border-invert)' : 'var(--border)'}`,
          borderBottom: `1px solid ${isDark ? 'var(--border-invert)' : 'var(--border)'}`,
        }}
      >
        {items.map((item, i) => (
          <div
            key={item.label}
            style={{
              padding: '40px 28px',
              borderRight: i < items.length - 1 ? `1px solid ${isDark ? 'var(--border-invert)' : 'var(--border)'}` : 'none',
            }}
          >
            <div
              style={{
                fontSize: 'clamp(40px, 5vw, 64px)',
                fontWeight: 500,
                letterSpacing: '-0.03em',
                lineHeight: 1,
                color: isDark ? 'var(--ink-invert)' : 'var(--ink)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              <span style={{ color: 'var(--accent)' }}>{item.number}</span>
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: isDark ? 'var(--ink-invert-mute)' : 'var(--ink-mute)',
                marginTop: 12,
              }}
            >
              {item.label}
            </div>
            {item.description && (
              <div
                style={{
                  fontSize: 13,
                  color: isDark ? 'var(--ink-invert-mute)' : 'var(--ink-soft)',
                  marginTop: 10,
                  lineHeight: 1.5,
                }}
              >
                {item.description}
              </div>
            )}
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 760px) {
          .section--invert > div:last-child,
          .section > div:last-child {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </section>
  );
}
