import Link from 'next/link';
import type { RoleSolution } from '@/lib/solutions-data';
import { RoleScreen, RolePains, RoleDay } from './RoleSections';
import { RoleModules, RoleCompare } from './RoleModules';
import { Faq } from '@/components/blocks/Faq';
import { WaitlistSection } from '@/components/blocks/WaitlistSection';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';
import { primaryCtaHref, primaryCtaLabel } from '@/lib/waitlist';

/**
 * Общий шаблон четырёх ролевых страниц. Отличаются они только данными
 * из src/lib/solutions-data.ts — отдельной вёрстки под каждую роль нет,
 * иначе четыре почти одинаковых файла разъедутся при первой же правке.
 */
export function RoleSolutionPage({ role }: { role: RoleSolution }) {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Главная', url: 'https://komplid.ru' },
          { name: `Решение для ${role.genitive}`, url: `https://komplid.ru${role.url}` },
        ]}
      />

      <div className="grid-bg">
        <div className="wrap" style={{ paddingTop: 60, paddingBottom: 56 }}>
          <div
            className="hero-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.05fr) minmax(0, 1fr)',
              gap: 36,
              alignItems: 'center',
            }}
          >
            <div>
              <span className="eyebrow-ref">{role.eyebrow}</span>
              <h1
                style={{
                  margin: '20px 0 18px',
                  fontSize: 'clamp(28px, 4vw, 44px)',
                  lineHeight: 1.06,
                  fontWeight: 500,
                }}
              >
                {role.h1}
              </h1>
              <p
                style={{
                  margin: '0 0 28px',
                  maxWidth: 560,
                  fontSize: 16.5,
                  lineHeight: 1.6,
                  color: 'var(--t3)',
                }}
              >
                {role.sub}
              </p>
              <div style={{ display: 'flex', gap: 11, flexWrap: 'wrap' }}>
                <a
                  href={primaryCtaHref('https://app.komplid.ru/signup')}
                  className="btn-accent"
                  style={{ height: 48, padding: '0 22px', fontSize: 15, fontWeight: 600 }}
                >
                  {primaryCtaLabel('Попробовать бесплатно')}
                </a>
                <Link
                  href={role.secondaryHref}
                  className="btn-outline"
                  style={{ height: 48, padding: '0 20px', fontSize: 15 }}
                >
                  {role.secondaryCta}
                </Link>
              </div>
            </div>

            <RoleScreen role={role} />
          </div>
        </div>
      </div>

      <RolePains role={role} />
      <RoleDay role={role} />
      <RoleModules role={role} />
      <RoleCompare role={role} />

      <Faq
        eyebrow="Часто спрашивают"
        title={`Вопросы ${role.genitive}`}
        description={role.faqLead}
        items={role.faq.map((f) => ({ question: f.q, answer: f.a }))}
      />

      <section className="section" style={{ background: 'var(--bg3)', paddingBottom: 0 }}>
        <div className="wrap">
          <h2
            style={{
              margin: 0,
              maxWidth: 760,
              fontSize: 'clamp(24px, 3.2vw, 38px)',
              fontWeight: 500,
            }}
          >
            {role.ctaTitle}
          </h2>
        </div>
      </section>

      <WaitlistSection source={`solutions-${role.id}`} />
    </>
  );
}
