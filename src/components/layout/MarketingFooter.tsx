import Link from 'next/link';

const companyName = process.env.COMPANY_NAME ?? 'ИП Фамилия И.О.';
const companyOgrnip = process.env.COMPANY_OGRNIP ?? '000000000000000';

export function MarketingFooter() {
  return (
    <footer className="footer-root">
      <div className="wrap">
        <div className="foot-grid">
          {/* Бренд */}
          <div className="foot-col">
            <Link
              href="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontWeight: 600,
                fontSize: 15,
                color: 'var(--ink)',
                marginBottom: 12,
              }}
            >
              <span
                style={{
                  position: 'relative',
                  width: 24,
                  height: 24,
                  borderRadius: 5,
                  background: 'var(--bg-invert)',
                  color: 'var(--ink-invert)',
                  display: 'grid',
                  placeItems: 'center',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                K
                <span
                  style={{
                    position: 'absolute',
                    right: -2,
                    top: -2,
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: 'var(--accent)',
                  }}
                />
              </span>
              Komplid
            </Link>
            <p>
              ERP для строительных проектов. Исполнительная документация, сметы, журналы,
              стройконтроль и ТИМ — в одной системе.
            </p>
            <p
              style={{
                marginTop: 14,
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontSize: 10.5,
              }}
            >
              © 2026 Komplid · {companyName} · ОГРНИП {companyOgrnip}
            </p>
          </div>

          {/* Продукт */}
          <div className="foot-col">
            <h5>Продукт</h5>
            <Link href="/#modules">Модули</Link>
            <Link href="/#features">Возможности</Link>
            <Link href="/#pricing">Тарифы</Link>
            <Link href="/blog">Блог</Link>
            <Link href="/shablony">Шаблоны документов</Link>
          </div>

          {/* Для специалистов */}
          <div className="foot-col">
            <h5>Для специалистов</h5>
            <Link href="/smetchik">Сметчик-Студио</Link>
            <Link href="/pto">ИД-Мастер</Link>
            <Link href="/prorab">Прораб-Журнал</Link>
            <Link href="/kalkulyator">Калькуляторы</Link>
          </div>

          {/* Для компаний */}
          <div className="foot-col">
            <h5>Для компаний</h5>
            <Link href="/solutions/general-contractor">Генподрядчику</Link>
            <Link href="/solutions/customer">Заказчику</Link>
            <Link href="/solutions/designer">Проектировщику</Link>
            <Link href="/solutions/technical-supervisor">Технадзору</Link>
            <Link href="/sravnenie">Сравнение с ЦУС, Exon</Link>
          </div>

          {/* Контакты */}
          <div className="foot-col">
            <h5>Контакты</h5>
            <a href="mailto:hello@komplid.ru">hello@komplid.ru</a>
            <a href="https://t.me/komplid" target="_blank" rel="noopener noreferrer">
              Telegram · @komplid
            </a>
            <p>Работаем онлайн по всей России&nbsp;· поддержка 10:00–19:00 МСК</p>
          </div>
        </div>

        {/* Нижняя полоса */}
        <div className="foot-bottom">
          <span>Соответствие 152-ФЗ · данные в РФ</span>
          <span style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Link href="/legal/privacy">Политика конфиденциальности</Link>
            <Link href="/legal/oferta">Публичная оферта</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
