import { BetaAccessForm } from '@/components/forms/BetaAccessForm';
import { SeatsCounter } from './SeatsCounter';

/**
 * Финальный экран главной. Заменяет общий WaitlistSection именно здесь:
 * на остальных страницах он остаётся, а главной нужен блок из эталона —
 * с выбором канала связи и размером команды.
 *
 * Счётчик мест — реальный (`/api/waitlist-seats`), в прототипе на его месте
 * стояла захардкоженная цифра. Выдуманный дефицит — ст. 5 ФЗ «О рекламе».
 */
export function BetaCtaSection() {
  return (
    <section className="section beta-cta" id="ranniy-dostup-section">
      <div className="wrap">
        <div className="beta-cta__grid">
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                flexWrap: 'wrap',
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--acc)',
              }}
            >
              <SeatsCounter />
            </div>

            <h2
              style={{
                margin: '20px 0 16px',
                fontSize: 'clamp(30px, 4.2vw, 46px)',
                lineHeight: 1.04,
                letterSpacing: '-0.035em',
                fontWeight: 500,
                textWrap: 'balance',
              }}
            >
              Заведите первый объект на следующей неделе.
            </h2>

            <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: 'var(--t3)' }}>
              Участники беты получают 20% скидки на первый год, перенос текущих объектов силами
              команды и прямую линию с продуктом. Карта не нужна.
            </p>
          </div>

          <BetaAccessForm />
        </div>
      </div>
    </section>
  );
}
