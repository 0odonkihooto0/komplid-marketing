import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface CtaProps {
  title: string;
  description: string;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
  eyebrow?: string;
  benefits?: string[];
}

function isExternal(href: string) { return href.startsWith('http'); }

const DEFAULT_BENEFITS = [
  '14 дней полного доступа без карты',
  'Все 18 модулей включены',
  'Настройка за 1 день',
  'Поддержка 10:00–19:00 МСК',
];

export function Cta({ title, description, primary, secondary, eyebrow, benefits = DEFAULT_BENEFITS }: CtaProps) {
  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div
          style={{
            background: 'var(--bg-invert)',
            color: 'var(--ink-invert)',
            borderRadius: 16,
            padding: '56px',
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            gap: 48,
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Accent gradient overlay */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(700px 300px at 100% 0%, color-mix(in oklch, var(--accent) 25%, transparent), transparent 60%)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ position: 'relative' }}>
            {eyebrow && (
              <span
                className="eyebrow"
                style={{ color: 'var(--accent)', marginBottom: 12, display: 'block' }}
              >
                {eyebrow}
              </span>
            )}
            <h2
              style={{
                fontSize: 'clamp(26px, 3vw, 36px)',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                fontWeight: 500,
                margin: '12px 0 14px',
                color: 'var(--ink-invert)',
              }}
            >
              {title}
            </h2>
            <p style={{ margin: '0 0 24px', color: 'var(--ink-invert-mute)', fontSize: 15, lineHeight: 1.55 }}>
              {description}
            </p>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
              {isExternal(primary.href) ? (
                <a href={primary.href} className="btn-accent">
                  {primary.label} <ArrowRight size={14} />
                </a>
              ) : (
                <Link href={primary.href} className="btn-accent">
                  {primary.label} <ArrowRight size={14} />
                </Link>
              )}
              {secondary && (
                isExternal(secondary.href) ? (
                  <a href={secondary.href} style={{ color: 'var(--ink-invert)', fontWeight: 500, fontSize: 14, textDecoration: 'underline', textUnderlineOffset: 3 }}>
                    {secondary.label}
                  </a>
                ) : (
                  <Link href={secondary.href} style={{ color: 'var(--ink-invert)', fontWeight: 500, fontSize: 14, textDecoration: 'underline', textUnderlineOffset: 3 }}>
                    {secondary.label}
                  </Link>
                )
              )}
            </div>
          </div>

          <div
            style={{
              position: 'relative',
              background: 'var(--bg-elev)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: '22px 24px',
              color: 'var(--ink)',
              boxShadow: 'var(--shadow-2)',
            }}
          >
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {benefits.map((b) => (
                <li key={b} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                  <span style={{ color: 'var(--ok)', flexShrink: 0, fontSize: 16 }}>✓</span>
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .cta-inner { grid-template-columns: 1fr !important; padding: 36px 28px !important; }
        }
      `}</style>
    </section>
  );
}
