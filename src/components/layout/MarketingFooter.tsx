import Link from 'next/link';
import { company } from '@/lib/company';
import { BrandLogo } from './BrandLogo';

export function MarketingFooter() {
  return (
    <footer className="footer-root">
      <div className="wrap">
        <div className="foot-grid">
          {/* Бренд */}
          <div className="foot-col">
            <Link href="/" className="brand-link" style={{ marginBottom: 14 }}>
              <BrandLogo withTagline />
            </Link>
            <p>
              Система управления строительными проектами: смета, журналы, исполнительная
              документация и КС-2 в одном контуре.
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
              © 2026 Комплид · {company.name} · ОГРНИП {company.ogrnip}
            </p>
          </div>

          {/* Продукт */}
          <div className="foot-col">
            <h5>Продукт</h5>
            <Link href="/#stages">Контур объекта</Link>
            <Link href="/#modules">Модули</Link>
            <Link href="/#price">Тарифы</Link>
            <Link href="/blog">Блог</Link>
            <Link href="/shablony">Шаблоны документов</Link>
            <Link href="/normativ">База СП (нормативы)</Link>
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
