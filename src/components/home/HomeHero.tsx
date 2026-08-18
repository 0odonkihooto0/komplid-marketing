import Link from 'next/link';
import { DocumentChain } from './DocumentChain';
import { SeatsCounter } from './SeatsCounter';
import { SiteCounters } from './SiteCounters';
import { primaryCtaHref, primaryCtaLabel } from '@/lib/waitlist';

/** Что заявляем под кнопками — всё проверяется прямо сейчас. */
const TRUST_LINE = ['Данные в РФ · ФЗ-152', 'Работает без связи на объекте', 'Без карты'];

export function HomeHero() {
  return (
    <div className="grid-bg">
      <div className="wrap" style={{ paddingTop: 66, paddingBottom: 60 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.04fr) minmax(0, 1fr)',
            gap: 36,
            alignItems: 'center',
          }}
          className="hero-grid"
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span className="eyebrow-ref">Управление стройкой в одном контуре</span>
              <SeatsCounter />
            </div>

            {/* Прямой ответ «что это» — первым же экраном, для AEO */}
            <h1
              style={{
                margin: '22px 0 20px',
                fontSize: 'clamp(32px, 4.6vw, 50px)',
                lineHeight: 1.04,
                fontWeight: 500,
              }}
            >
              <span className="line">Каждый акт — по СП.</span>
              <span className="line">Каждая подпись —</span>
              <span className="line">с координатами.</span>
            </h1>

            <p
              style={{
                margin: '0 0 30px',
                maxWidth: 560,
                fontSize: 16.5,
                lineHeight: 1.55,
                color: 'var(--t3)',
              }}
            >
              «Комплид» ведёт объект от сметы до ввода в эксплуатацию: журнал смены с телефона
              превращается в АОСР, АОСР — в КС-2. Поля, подписи и связи между документами — как
              требует приказ Минстроя 344/пр.
            </p>

            <div style={{ display: 'flex', gap: 11, alignItems: 'center', flexWrap: 'wrap' }}>
              <a
                href={primaryCtaHref('https://app.komplid.ru/signup')}
                className="btn-accent"
                style={{ height: 50, padding: '0 24px', fontSize: 15, fontWeight: 600 }}
              >
                {primaryCtaLabel('Попробовать бесплатно')}
                <span style={{ fontFamily: 'var(--font-mono)' }}>→</span>
              </a>
              <Link
                href="/normativ"
                className="btn-outline"
                style={{ height: 50, padding: '0 22px', fontSize: 15 }}
              >
                Открыть базу СП и ГОСТ
              </Link>
            </div>

            <div
              style={{
                marginTop: 30,
                paddingTop: 20,
                borderTop: '1px solid var(--line)',
                display: 'flex',
                gap: 28,
                flexWrap: 'wrap',
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--t4)',
              }}
            >
              {TRUST_LINE.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
          </div>

          <DocumentChain />
        </div>
      </div>

      {/* Отбивка «стройплощадка» между героем и счётчиками — как в эталоне */}
      <div className="hatch-rule" />

      <SiteCounters />
    </div>
  );
}
