import { TARIFFS, TARIFF_NOTES } from '@/lib/audience-data';
import { primaryCtaHref } from '@/lib/waitlist';
import { CheckItem } from './CheckItem';

/**
 * Командные тарифы. Ссылки ведут на форму раннего доступа, пока регистрация
 * закрыта, — за это отвечает primaryCtaHref, а не хардкод в каждой карточке.
 */
export function TariffCards() {
  return (
    <div>
      <div className="tariff-grid">
        {TARIFFS.map((t) => (
          <div
            key={t.name}
            className={`tariff-card${t.featured ? ' tariff-card--featured' : ''}`}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 14 }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  fontWeight: 500,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: t.featured ? 'var(--acc)' : 'var(--t4)',
                }}
              >
                {t.name}
              </span>
              <span
                style={{
                  flex: 'none',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--t5)',
                }}
              >
                {t.tag}
              </span>
            </div>

            <div style={{ marginTop: 16, display: 'flex', alignItems: 'baseline', gap: 7 }}>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 34,
                  fontWeight: 500,
                  lineHeight: 1,
                  letterSpacing: '-0.035em',
                }}
              >
                {t.price}
              </span>
              <span style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--t4)' }}>{t.unit}</span>
            </div>

            <p style={{ margin: '12px 0 0', fontSize: 13.5, lineHeight: 1.55, color: 'var(--t3)' }}>
              {t.description}
            </p>

            <div
              style={{
                marginTop: 18,
                paddingTop: 16,
                borderTop: '1px solid var(--line2)',
                display: 'grid',
                gap: 10,
              }}
            >
              {t.items.map((item) => (
                <CheckItem key={item} text={item} size="sm" />
              ))}
            </div>

            <a
              href={primaryCtaHref('https://app.komplid.ru/signup')}
              className={t.featured ? 'btn-accent' : 'btn-outline'}
              style={{ marginTop: 22 }}
            >
              {t.cta}
            </a>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 14,
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px 22px',
          fontSize: 12.5,
          color: 'var(--t4)',
        }}
      >
        {TARIFF_NOTES.map((n) => (
          <span key={n}>{n}</span>
        ))}
      </div>
    </div>
  );
}
