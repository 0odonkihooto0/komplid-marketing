interface QuoteStat {
  label: string;
  value: string;
}

interface QuoteAuthor {
  name: string;
  role: string;
  initials: string;
}

interface QuoteProps {
  eyebrow?: string;
  text: string;
  author: QuoteAuthor;
  stats: QuoteStat[];
}

export function Quote({ eyebrow, text, author, stats }: QuoteProps) {
  return (
    <section className="section">
      <div className="wrap">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.3fr 1fr',
            gap: 40,
            alignItems: 'center',
          }}
        >
          <div>
            {eyebrow && <span className="eyebrow">{eyebrow}</span>}

            <blockquote
              style={{
                fontSize: 'clamp(22px, 2.4vw, 30px)',
                lineHeight: 1.3,
                letterSpacing: '-0.015em',
                fontWeight: 400,
                color: 'var(--ink)',
                margin: '18px 0 24px',
                padding: 0,
                border: 'none',
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 60,
                  lineHeight: 0.6,
                  color: 'var(--accent)',
                  marginBottom: 14,
                }}
              >
                &ldquo;
              </span>
              {text}
            </blockquote>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: 'var(--bg-inset)',
                  border: '1px solid var(--border)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--ink-soft)',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                }}
              >
                {author.initials}
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: 14 }}>{author.name}</strong>
                <span style={{ fontSize: 12.5, color: 'var(--ink-mute)' }}>{author.role}</span>
              </div>
            </div>
          </div>

          <div
            style={{
              background: 'var(--bg-elev)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: '28px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
            }}
          >
            {stats.map((s, i) => (
              <div
                key={s.label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  paddingBottom: i < stats.length - 1 ? 14 : 0,
                  borderBottom: i < stats.length - 1 ? '1px solid var(--border)' : 'none',
                  fontSize: 13,
                }}
              >
                <span style={{ color: 'var(--ink-soft)' }}>{s.label}</span>
                <strong
                  style={{
                    fontSize: 22,
                    fontWeight: 500,
                    fontFamily: 'var(--font-mono)',
                    fontVariantNumeric: 'tabular-nums',
                    color: 'var(--accent-strong)',
                  }}
                >
                  {s.value}
                </strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .section > .wrap > div[style*="1.3fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
