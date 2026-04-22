import Link from 'next/link';

interface ProfiPackage {
  slug: 'smetchik' | 'pto' | 'prorab';
  eyebrow: string;
  title: string;
  description: string;
  priceFrom: number;
}

const PACKAGES: ProfiPackage[] = [
  {
    slug: 'smetchik',
    eyebrow: 'Сметчик-Студио',
    title: 'Для сметчика',
    description: 'Импорт из Гранд-Сметы, сравнение версий, публичные ссылки для заказчика, ФГИС ЦС',
    priceFrom: 1900,
  },
  {
    slug: 'pto',
    eyebrow: 'ИД-Мастер',
    title: 'Для ПТО-инженера',
    description: 'АОСР, ОЖР, КС-2/КС-3 по приказу №344/пр, маршруты согласования, ЭЦП',
    priceFrom: 1900,
  },
  {
    slug: 'prorab',
    eyebrow: 'Прораб-Журнал',
    title: 'Для прораба',
    description: 'Мобильный ОЖР, фото с GPS, дефекты, голосовой ввод, работает офлайн',
    priceFrom: 1900,
  },
];

export function ProfiPackagesTeaser() {
  return (
    <section className="section" style={{ paddingBottom: 0 }}>
      <div className="wrap">
        <div
          style={{
            maxWidth: 1000,
            margin: '0 auto',
            padding: 32,
            background: 'var(--bg-elev)',
            border: '1px solid var(--border)',
            borderRadius: 12,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 24,
              flexWrap: 'wrap',
              marginBottom: 24,
            }}
          >
            <div>
              <span className="eyebrow">Для одиночных специалистов</span>
              <h3 style={{ margin: '8px 0 4px', fontSize: 22, fontWeight: 600 }}>
                Профи-пакеты от 1 900 ₽&nbsp;/ мес
              </h3>
              <p style={{ margin: 0, color: 'var(--ink-soft)', fontSize: 14 }}>
                Нужен только свой модуль? Возьмите его отдельно. Годовая подписка — скидка 20%.
              </p>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 16,
            }}
          >
            {PACKAGES.map((pkg) => (
              <Link key={pkg.slug} href={`/${pkg.slug}`} className="profi-card">
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10.5,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: 'var(--ink-mute)',
                    marginBottom: 8,
                  }}
                >
                  {pkg.eyebrow}
                </div>
                <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>{pkg.title}</div>
                <p
                  style={{
                    margin: '0 0 12px',
                    fontSize: 13,
                    color: 'var(--ink-soft)',
                    lineHeight: 1.45,
                  }}
                >
                  {pkg.description}
                </p>
                <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--accent-strong)' }}>
                  от {pkg.priceFrom.toLocaleString('ru-RU')} ₽
                  <span style={{ fontSize: 13, color: 'var(--ink-mute)', fontWeight: 400 }}>&nbsp;/ мес</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 700px) {
          .profi-card + .profi-card { margin-top: 0; }
        }
        @media (max-width: 700px) {
          .section > .wrap > div > div:last-child { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
