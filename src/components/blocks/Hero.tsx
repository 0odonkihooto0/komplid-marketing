import Link from 'next/link';
import { ArrowRight, Play } from 'lucide-react';

interface CtaLink {
  label: string;
  href: string;
}

interface HeroProps {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle: string;
  primaryCta: CtaLink;
  secondaryCta?: CtaLink;
  variant?: 'default' | 'compact';
}

export function Hero({ eyebrow, title, subtitle, primaryCta, secondaryCta, variant = 'default' }: HeroProps) {
  const isExternal = (href: string) => href.startsWith('http');
  const paddingY = variant === 'compact' ? '48px 0' : '80px 0 72px';

  return (
    <section
      style={{
        padding: paddingY,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Radial gradient background из design/landing-reference.html секция .hero::before */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(1000px 500px at 82% -10%, color-mix(in oklch, var(--accent) 18%, transparent), transparent 60%),
            radial-gradient(600px 300px at -5% 40%, color-mix(in oklch, var(--info) 12%, transparent), transparent 70%)
          `,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div className="wrap" style={{ position: 'relative', zIndex: 1 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: variant === 'compact' ? '1fr' : 'clamp(320px, 55%, 680px) 1fr',
            gap: 48,
            alignItems: 'center',
          }}
        >
          <div>
            {eyebrow && <span className="eyebrow">{eyebrow}</span>}

            <h1
              style={{
                margin: '18px 0 20px',
                fontSize: 'clamp(36px, 5.2vw, 64px)',
                lineHeight: 1.03,
                letterSpacing: '-0.03em',
                fontWeight: 500,
              }}
            >
              {title}
            </h1>

            <p
              style={{
                maxWidth: 520,
                fontSize: 16.5,
                color: 'var(--ink-soft)',
                lineHeight: 1.55,
                margin: '0 0 32px',
              }}
            >
              {subtitle}
            </p>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {isExternal(primaryCta.href) ? (
                <a href={primaryCta.href} className="btn-accent">
                  {primaryCta.label}
                  <ArrowRight size={14} />
                </a>
              ) : (
                <Link href={primaryCta.href} className="btn-accent">
                  {primaryCta.label}
                  <ArrowRight size={14} />
                </Link>
              )}

              {secondaryCta && (
                isExternal(secondaryCta.href) ? (
                  <a href={secondaryCta.href} className="btn-outline">
                    <Play size={13} />
                    {secondaryCta.label}
                  </a>
                ) : (
                  <Link href={secondaryCta.href} className="btn-outline">
                    <Play size={13} />
                    {secondaryCta.label}
                  </Link>
                )
              )}
            </div>

            <div
              style={{
                marginTop: 32,
                paddingTop: 20,
                borderTop: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                fontSize: 12,
                color: 'var(--ink-mute)',
              }}
            >
              <span style={{ color: 'var(--accent-strong)' }}>★★★★★</span>
              <span>
                <strong style={{ color: 'var(--ink-soft)', fontWeight: 600 }}>4.8/5</strong>
                {' · '}14 дней без карты{' · '}данные в РФ
              </span>
            </div>
          </div>

          {variant !== 'compact' && (
            <div
              aria-hidden="true"
              style={{
                background: 'var(--bg-elev)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                boxShadow: 'var(--shadow-3)',
                overflow: 'hidden',
                transform: 'perspective(1800px) rotateY(-4deg) rotateX(2deg)',
                minHeight: 340,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--ink-mute)',
                }}
              >
                Dashboard Preview
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
