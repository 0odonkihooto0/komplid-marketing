import type { Metadata } from 'next';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';
import {
  LegalContents,
  LegalSection,
  formatLegalVersion,
  isFilledRequisite,
} from '@/components/legal/LegalDocument';
import { company } from '@/lib/company';
import { OFFER_SECTIONS, OFFER_VERSION } from '@/lib/legal/offer';
import { WAITLIST_MODE } from '@/lib/waitlist';

export const metadata: Metadata = {
  title: 'Публичная оферта — условия доступа к сервису Комплид',
  description:
    'Публичная оферта на предоставление доступа к сервису «Комплид»: предмет договора, порядок акцепта, оплата, возврат средств, ответственность сторон и реквизиты исполнителя.',
  alternates: { canonical: 'https://komplid.ru/legal/oferta' },
};

export default function OfferPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Главная', url: 'https://komplid.ru' },
          { name: 'Публичная оферта', url: 'https://komplid.ru/legal/oferta' },
        ]}
      />

      <div className="section" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="wrap">
          <span className="eyebrow">Комплид · Документы</span>
          <h1
            className="mb-4 mt-3 text-4xl font-medium tracking-tight"
            style={{ letterSpacing: '-0.025em', color: 'var(--ink)' }}
          >
            Публичная оферта
          </h1>
          <p className="max-w-2xl text-lg" style={{ color: 'var(--ink-soft)' }}>
            Документ содержит все существенные условия договора о предоставлении доступа
            к сервису «Комплид». Оплата доступа означает согласие с этими условиями
            и заключение договора.
          </p>

          {/* До открытия продаж это документ на будущее: акцептовать нечего,
              и честнее сказать об этом прямо, чем оставлять читателя гадать. */}
          {WAITLIST_MODE && (
            <p
              className="mt-6 max-w-2xl rounded-xl p-4 text-sm"
              style={{
                background: 'var(--bg-inset)',
                border: '1px solid var(--border)',
                color: 'var(--ink-soft)',
              }}
            >
              Приём оплаты ещё не открыт: сервис готовится к запуску. Оферта опубликована
              заранее, чтобы условия можно было изучить до начала работы.
            </p>
          )}

          <dl
            className="mt-8 grid max-w-2xl gap-x-8 gap-y-3 text-sm sm:grid-cols-2"
            style={{ color: 'var(--ink-soft)' }}
          >
            <div>
              <dt
                className="font-mono text-[10px] uppercase tracking-widest"
                style={{ color: 'var(--ink-mute)' }}
              >
                Исполнитель
              </dt>
              <dd className="mt-1" style={{ color: 'var(--ink)' }}>
                {company.name}
              </dd>
            </div>
            <div>
              <dt
                className="font-mono text-[10px] uppercase tracking-widest"
                style={{ color: 'var(--ink-mute)' }}
              >
                Редакция
              </dt>
              <dd className="mt-1" style={{ color: 'var(--ink)' }}>
                от {formatLegalVersion(OFFER_VERSION)}
              </dd>
            </div>
            {(isFilledRequisite(company.ogrnip) || isFilledRequisite(company.inn)) && (
              <div>
                <dt
                  className="font-mono text-[10px] uppercase tracking-widest"
                  style={{ color: 'var(--ink-mute)' }}
                >
                  ОГРНИП · ИНН
                </dt>
                <dd className="mt-1" style={{ color: 'var(--ink)' }}>
                  {[company.ogrnip, company.inn].filter(isFilledRequisite).join(' · ')}
                </dd>
              </div>
            )}
            <div>
              <dt
                className="font-mono text-[10px] uppercase tracking-widest"
                style={{ color: 'var(--ink-mute)' }}
              >
                Налогообложение
              </dt>
              <dd className="mt-1" style={{ color: 'var(--ink)' }}>
                УСН · НДС не облагается
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="section wrap" style={{ maxWidth: 860 }}>
        <LegalContents sections={OFFER_SECTIONS} label="Содержание оферты" />
        {OFFER_SECTIONS.map((section) => (
          <LegalSection key={section.id} section={section} />
        ))}
      </div>
    </>
  );
}
