import type { Metadata } from 'next';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';
import {
  LegalContents,
  LegalSection,
  formatLegalVersion,
  isFilledRequisite,
} from '@/components/legal/LegalDocument';
import { company } from '@/lib/company';
import { TERMS_SECTIONS, TERMS_VERSION } from '@/lib/legal/terms';

export const metadata: Metadata = {
  title: 'Пользовательское соглашение — правила использования сайта',
  description:
    'Правила использования сайта komplid.ru: условия применения бесплатных шаблонов документов, статус текстов сводов правил, цитирование материалов и ограничение ответственности.',
  alternates: { canonical: 'https://komplid.ru/legal/terms' },
};

export default function TermsPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Главная', url: 'https://komplid.ru' },
          { name: 'Пользовательское соглашение', url: 'https://komplid.ru/legal/terms' },
        ]}
      />

      <div className="section" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="wrap">
          <span className="eyebrow">Комплид · Документы</span>
          <h1
            className="mb-4 mt-3 text-4xl font-medium tracking-tight"
            style={{ letterSpacing: '-0.025em', color: 'var(--ink)' }}
          >
            Пользовательское соглашение
          </h1>
          <p className="max-w-2xl text-lg" style={{ color: 'var(--ink-soft)' }}>
            Документ определяет правила использования материалов сайта: бесплатных бланков,
            калькуляторов, статей и текстов нормативных документов. Условия платного доступа
            к сервису изложены отдельно — в{' '}
            <a href="/legal/oferta" style={{ color: 'var(--accent-strong)' }}>
              публичной оферте
            </a>
            .
          </p>

          <dl
            className="mt-8 grid max-w-2xl gap-x-8 gap-y-3 text-sm sm:grid-cols-2"
            style={{ color: 'var(--ink-soft)' }}
          >
            <div>
              <dt
                className="font-mono text-[10px] uppercase tracking-widest"
                style={{ color: 'var(--ink-mute)' }}
              >
                Правообладатель
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
                от {formatLegalVersion(TERMS_VERSION)}
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
                Обращения
              </dt>
              <dd className="mt-1">
                <a href={`mailto:${company.email}`} style={{ color: 'var(--accent-strong)' }}>
                  {company.email}
                </a>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="section wrap" style={{ maxWidth: 860 }}>
        <LegalContents sections={TERMS_SECTIONS} label="Содержание соглашения" />
        {TERMS_SECTIONS.map((section) => (
          <LegalSection key={section.id} section={section} />
        ))}
      </div>
    </>
  );
}
