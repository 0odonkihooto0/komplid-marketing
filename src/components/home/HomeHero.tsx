import Link from 'next/link';
import { HeroShowcase } from './HeroShowcase';
import { SeatsCounter } from './SeatsCounter';
import { SiteCounters } from './SiteCounters';
import { HERO_BULLETS } from '@/lib/home-data';
import { primaryCtaHref, primaryCtaLabel } from '@/lib/waitlist';

export function HomeHero() {
  return (
    <div className="grid-bg">
      {/* Правый отступ нулевой: снимок интерфейса должен уходить за край окна */}
      <div className="hero-bleed">
        <div className="hero-grid">
          <div className="hero-copy">
            <div className="eyebrow-ref">
              Закрытая бета
              <SeatsCounter />
            </div>

            {/* Прямой ответ «что это» — сразу под заголовком, для AEO */}
            <h1 className="hero-title">Вся стройка на одном столе.</h1>

            <p
              style={{
                margin: '0 0 28px',
                fontSize: 16.5,
                lineHeight: 1.55,
                color: 'var(--t3)',
                textWrap: 'pretty',
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

            <ul className="hero-bullets">
              {HERO_BULLETS.map((bullet) => (
                <li key={bullet.text}>
                  <span
                    className="hero-bullets__dot"
                    style={{ background: bullet.tone === 'acc' ? 'var(--acc)' : 'var(--ok)' }}
                  />
                  {bullet.text}
                </li>
              ))}
            </ul>
          </div>

          <HeroShowcase />
        </div>
      </div>

      {/* Отбивка «стройплощадка» между героем и счётчиками — как в эталоне */}
      <div className="hatch-rule" />

      <SiteCounters />
    </div>
  );
}
