import Link from 'next/link';

interface PricingFeature {
  text: string;
  included: boolean;
}

export interface PricingTier {
  name: string;
  subtitle: string;
  price: string;
  priceUnit: string;
  priceNote?: string;
  features: PricingFeature[];
  cta: { label: string; href: string };
  featured?: boolean;
  tag?: string;
}

interface PricingProps {
  title: string;
  description?: string;
  eyebrow?: string;
  tiers: PricingTier[];
}

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
    <path d="M5 12l5 5L20 7" />
  </svg>
);

const CrossIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
    <path d="M6 6l12 12M6 18L18 6" />
  </svg>
);

function isExternal(href: string) { return href.startsWith('http'); }

export function Pricing({ title, description, eyebrow, tiers }: PricingProps) {
  return (
    <section className="section" id="pricing" style={{ background: 'var(--bg-inset)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
      <div className="wrap">
        <div className="section-head" style={{ textAlign: 'center', margin: '0 auto 48px' }}>
          {eyebrow && <span className="eyebrow" style={{ justifyContent: 'center' }}>{eyebrow}</span>}
          <h2 style={{ marginLeft: 'auto', marginRight: 'auto' }}>{title}</h2>
          {description && <p style={{ marginLeft: 'auto', marginRight: 'auto' }}>{description}</p>}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 16,
          }}
        >
          {tiers.map((tier) => (
            <div
              key={tier.name}
              style={{
                background: 'var(--bg-elev)',
                border: `1px solid ${tier.featured ? 'var(--ink)' : 'var(--border)'}`,
                borderRadius: 12,
                padding: '28px 26px 26px',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                boxShadow: tier.featured ? 'var(--shadow-2)' : 'none',
              }}
            >
              {tier.tag && (
                <span
                  style={{
                    position: 'absolute',
                    top: -10,
                    right: 20,
                    background: 'var(--accent)',
                    color: 'var(--accent-ink)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    padding: '4px 9px',
                    borderRadius: 999,
                    fontWeight: 600,
                  }}
                >
                  {tier.tag}
                </span>
              )}

              <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 600 }}>{tier.name}</h3>
              <p style={{ margin: '0 0 22px', fontSize: 13, color: 'var(--ink-mute)', minHeight: 38 }}>{tier.subtitle}</p>

              <div style={{ fontSize: 40, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1, display: 'flex', alignItems: 'baseline', gap: 6 }}>
                {tier.price}
                {tier.priceUnit && <small style={{ fontSize: 13, fontWeight: 400, color: 'var(--ink-mute)', letterSpacing: 0 }}>{tier.priceUnit}</small>}
              </div>
              {tier.priceNote && <div style={{ fontSize: 12, color: 'var(--ink-mute)', marginTop: 4 }}>{tier.priceNote}</div>}

              <ul style={{ listStyle: 'none', padding: 0, margin: '22px 0', fontSize: 13 }}>
                {tier.features.map((f) => (
                  <li
                    key={f.text}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '18px 1fr',
                      gap: 8,
                      alignItems: 'start',
                      padding: '7px 0',
                      color: f.included ? 'var(--ink-soft)' : 'var(--ink-mute)',
                    }}
                  >
                    <span style={{ color: f.included ? 'var(--accent-strong)' : 'var(--ink-mute)', opacity: f.included ? 1 : 0.5, marginTop: 4 }}>
                      {f.included ? <CheckIcon /> : <CrossIcon />}
                    </span>
                    {f.text}
                  </li>
                ))}
              </ul>

              {isExternal(tier.cta.href) ? (
                <a href={tier.cta.href} className={tier.featured ? 'btn-accent' : 'btn-outline'} style={{ marginTop: 'auto', textAlign: 'center' }}>
                  {tier.cta.label}
                </a>
              ) : (
                <Link href={tier.cta.href} className={tier.featured ? 'btn-accent' : 'btn-outline'} style={{ marginTop: 'auto', textAlign: 'center' }}>
                  {tier.cta.label}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          #pricing > div > div:last-child { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
