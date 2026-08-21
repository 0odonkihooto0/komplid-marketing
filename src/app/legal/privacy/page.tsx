import type { Metadata } from 'next';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';
import {
  LegalContents,
  LegalSection,
  formatLegalVersion,
  isFilledRequisite,
} from '@/components/legal/LegalDocument';
import { company } from '@/lib/company';
import { PRIVACY_POLICY_VERSION } from '@/lib/legal/privacy-consent';
import { PRIVACY_POLICY_SECTIONS } from '@/lib/legal/privacy-policy';

export const metadata: Metadata = {
  title: 'Политика конфиденциальности — обработка персональных данных',
  description:
    'Политика обработки персональных данных сайта komplid.ru по 152-ФЗ: какие данные собираются, на каком основании, сколько хранятся и как отозвать согласие.',
  alternates: { canonical: 'https://komplid.ru/legal/privacy' },
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Главная', url: 'https://komplid.ru' },
          { name: 'Политика конфиденциальности', url: 'https://komplid.ru/legal/privacy' },
        ]}
      />

      <div className="section" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="wrap">
          <span className="eyebrow">Комплид · Документы</span>
          <h1
            className="mb-4 mt-3 text-4xl font-medium tracking-tight"
            style={{ letterSpacing: '-0.025em', color: 'var(--ink)' }}
          >
            Политика в отношении обработки персональных данных
          </h1>
          <p className="max-w-2xl text-lg" style={{ color: 'var(--ink-soft)' }}>
            Документ определяет, какие персональные данные обрабатывает оператор сайта komplid.ru,
            на каком основании и как их удалить. Составлен по требованиям Федерального закона
            от 27.07.2006 № 152-ФЗ «О персональных данных».
          </p>

          {/* Реквизиты оператора вынесены в шапку: кто оператор и куда писать —
              главные вопросы читателя, разворачивать ради них раздел 1 не нужно. */}
          <dl
            className="mt-8 grid max-w-2xl gap-x-8 gap-y-3 text-sm sm:grid-cols-2"
            style={{ color: 'var(--ink-soft)' }}
          >
            <div>
              <dt
                className="font-mono text-[10px] uppercase tracking-widest"
                style={{ color: 'var(--ink-mute)' }}
              >
                Оператор
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
                от {formatLegalVersion(PRIVACY_POLICY_VERSION)}
              </dd>
            </div>
            {(isFilledRequisite(company.ogrnip) || isFilledRequisite(company.inn)) && (
              <div>
                <dt
                  className="font-mono text-[10px] uppercase tracking-widest"
                  style={{ color: 'var(--ink-mute)' }}
                >
                  {isFilledRequisite(company.ogrnip) && isFilledRequisite(company.inn)
                    ? 'ОГРНИП · ИНН'
                    : isFilledRequisite(company.ogrnip)
                      ? 'ОГРНИП'
                      : 'ИНН'}
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
                Обращения по данным
              </dt>
              <dd className="mt-1">
                <a href={`mailto:${company.email}`} style={{ color: 'var(--accent-strong)' }}>
                  {company.email}
                </a>{' '}
                <span style={{ color: 'var(--ink-mute)' }}>
                  (
                  <a
                    href={`mailto:${company.privacyEmail}`}
                    style={{ color: 'var(--accent-strong)' }}
                  >
                    {company.privacyEmail}
                  </a>
                  )
                </span>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="section wrap" style={{ maxWidth: 860 }}>
        <LegalContents sections={PRIVACY_POLICY_SECTIONS} label="Содержание политики" />

        {PRIVACY_POLICY_SECTIONS.map((section) => (
          <LegalSection key={section.id} section={section} />
        ))}
      </div>
    </>
  );
}
