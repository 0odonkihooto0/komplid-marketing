import type { Metadata } from 'next';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';
import { company } from '@/lib/company';
import { PRIVACY_POLICY_VERSION } from '@/lib/legal/privacy-consent';
import {
  PRIVACY_POLICY_SECTIONS,
  type PolicyBlock,
  type PolicySection,
} from '@/lib/legal/privacy-policy';

export const metadata: Metadata = {
  title: 'Политика конфиденциальности — обработка персональных данных',
  description:
    'Политика обработки персональных данных сайта komplid.ru по 152-ФЗ: какие данные собираются, на каком основании, сколько хранятся и как отозвать согласие.',
  alternates: { canonical: 'https://komplid.ru/legal/privacy' },
};

/**
 * Реквизит задан, а не остался плейсхолдером из company.ts.
 *
 * ОГРНИП и ИНН приходят из env, и если на сервере они не заданы, дефолт —
 * строка нулей. Показать «ОГРНИП 000000000000000» на юридической странице
 * хуже, чем не показать реквизит вовсе: это выглядит как поддельные данные.
 */
function isFilled(value: string): boolean {
  return !/^0+$/.test(value);
}

/** Дата редакции по-русски: в шапке она читается людьми, а не машинами. */
function formatVersion(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function Block({ block }: { block: PolicyBlock }) {
  if (block.type === 'p') {
    return (
      <p className="mb-4 leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
        {block.text}
      </p>
    );
  }

  if (block.type === 'list') {
    return (
      <ul className="mb-4 grid gap-2 pl-5" style={{ color: 'var(--ink-soft)', listStyle: 'disc' }}>
        {block.items.map((item) => (
          <li key={item} className="leading-relaxed">
            {item}
          </li>
        ))}
      </ul>
    );
  }

  // Раздел 6 — таблица «цель / данные / основания / виды обработки».
  // Стили классом, а не инлайном: на узком экране строки должны распадаться
  // на блоки медиазапросом, а инлайновый style его перебивает (см. globals.css).
  return (
    <div className="mb-4" style={{ overflowX: 'auto' }}>
      <table className="policy-table">
        <tbody>
          {block.rows.map((row) => (
            <tr key={row.label}>
              <th scope="row">{row.label}</th>
              <td>
                {row.items.length === 1 ? (
                  row.items[0]
                ) : (
                  <ul>
                    {row.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Section({ section }: { section: PolicySection }) {
  return (
    <section id={section.id} style={{ scrollMarginTop: 90 }} className="mb-10">
      <h2 className="mb-4 text-2xl font-semibold" style={{ color: 'var(--ink)' }}>
        {section.no}. {section.title}
      </h2>
      {section.blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </section>
  );
}

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
                от {formatVersion(PRIVACY_POLICY_VERSION)}
              </dd>
            </div>
            {(isFilled(company.ogrnip) || isFilled(company.inn)) && (
              <div>
                <dt
                  className="font-mono text-[10px] uppercase tracking-widest"
                  style={{ color: 'var(--ink-mute)' }}
                >
                  {isFilled(company.ogrnip) && isFilled(company.inn)
                    ? 'ОГРНИП · ИНН'
                    : isFilled(company.ogrnip)
                      ? 'ОГРНИП'
                      : 'ИНН'}
                </dt>
                <dd className="mt-1" style={{ color: 'var(--ink)' }}>
                  {[company.ogrnip, company.inn].filter(isFilled).join(' · ')}
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
        {/* Оглавление: документ длинный, без него до нужного пункта не добраться */}
        <nav
          aria-label="Содержание политики"
          className="mb-12 rounded-xl p-6"
          style={{ background: 'var(--bg-inset)', border: '1px solid var(--border)' }}
        >
          <h2
            className="mb-4 font-mono text-[10px] uppercase tracking-widest"
            style={{ color: 'var(--ink-mute)' }}
          >
            Содержание
          </h2>
          <ol className="grid gap-2 sm:grid-cols-2">
            {PRIVACY_POLICY_SECTIONS.map((section) => (
              <li key={section.id} className="text-sm">
                <a href={`#${section.id}`} style={{ color: 'var(--ink-soft)' }}>
                  <span style={{ color: 'var(--ink-mute)' }}>{section.no}.</span> {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {PRIVACY_POLICY_SECTIONS.map((section) => (
          <Section key={section.id} section={section} />
        ))}
      </div>
    </>
  );
}
