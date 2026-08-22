import type { Metadata } from 'next';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';
import { company } from '@/lib/company';

export const metadata: Metadata = {
  title: 'Контакты Комплид — связаться с нами',
  description:
    'Связаться с Комплид: почта hello@komplid.ru, Telegram @komplid. Команда в Санкт-Петербурге, работаем онлайн по всей России, поддержка 10:00–19:00 МСК. Реквизиты ИП.',
  alternates: { canonical: 'https://komplid.ru/company/contact' },
};

export default function ContactPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Главная', url: 'https://komplid.ru' },
          { name: 'Контакты', url: 'https://komplid.ru/company/contact' },
        ]}
      />

      <div className="section" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="wrap">
          <span className="eyebrow">Комплид · Контакты</span>
          <h1
            className="mb-4 mt-3 text-4xl font-medium tracking-tight"
            style={{ letterSpacing: '-0.025em', color: 'var(--ink)' }}
          >
            Связаться с нами
          </h1>
          <p className="max-w-xl text-lg" style={{ color: 'var(--ink-soft)' }}>
            Команда в Санкт-Петербурге, работаем онлайн по всей России. Поддержка 10:00–19:00 МСК
            — отвечаем в течение рабочего дня.
          </p>
        </div>
      </div>

      <div className="section wrap" style={{ maxWidth: 760 }}>
        <div className="grid gap-6 md:grid-cols-2">
          <div
            className="rounded-xl border p-6"
            style={{ borderColor: 'var(--border)', background: 'var(--bg-elev)' }}
          >
            <h2 className="mb-2 text-lg font-semibold" style={{ color: 'var(--ink)' }}>
              Почта
            </h2>
            <a
              href={`mailto:${company.email}`}
              style={{ color: 'var(--accent-strong)', fontSize: 16 }}
            >
              {company.email}
            </a>
            <p className="mt-2 text-sm" style={{ color: 'var(--ink-mute)' }}>
              Вопросы по продукту, тарифам и внедрению.
            </p>
          </div>

          <div
            className="rounded-xl border p-6"
            style={{ borderColor: 'var(--border)', background: 'var(--bg-elev)' }}
          >
            <h2 className="mb-2 text-lg font-semibold" style={{ color: 'var(--ink)' }}>
              Telegram
            </h2>
            <a
              href="https://t.me/komplid"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--accent-strong)', fontSize: 16 }}
            >
              @komplid
            </a>
            <p className="mt-2 text-sm" style={{ color: 'var(--ink-mute)' }}>
              Быстрые ответы и новости платформы.
            </p>
          </div>
        </div>

        <div
          className="mt-8 rounded-xl border p-6"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-inset)' }}
        >
          <h2 className="mb-3 text-lg font-semibold" style={{ color: 'var(--ink)' }}>
            Реквизиты
          </h2>
          <ul
            className="space-y-1 font-mono text-sm"
            style={{ color: 'var(--ink-soft)', listStyle: 'none', padding: 0, margin: 0 }}
          >
            <li>{company.name}</li>
            <li>Санкт-Петербург</li>
            <li>ИНН {company.inn}</li>
            <li>ОГРНИП {company.ogrnip}</li>
            <li>НДС не облагается (ИП на УСН)</li>
          </ul>
          <p className="mt-3 text-sm" style={{ color: 'var(--ink-mute)' }}>
            Соответствие 152-ФЗ · данные хранятся в РФ.
          </p>
        </div>
      </div>
    </>
  );
}
