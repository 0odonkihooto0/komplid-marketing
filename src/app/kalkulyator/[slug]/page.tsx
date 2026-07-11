import type { Metadata } from 'next';
import type { ComponentType } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CALCULATORS, getCalcBySlug, type CalcSlug } from '@/lib/calculators-data';
import { SoftwareAppSchema } from '@/components/seo/SoftwareAppSchema';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';
import { HowToSchema } from '@/components/seo/HowToSchema';
import { Faq } from '@/components/blocks/Faq';
import { Cta } from '@/components/blocks/Cta';
import { CalcContentSections } from '@/components/calculators/CalcContentSections';
import { AvansCalculator } from '@/components/calculators/AvansCalculator';
import { Ks2Calculator } from '@/components/calculators/Ks2Calculator';
import { RabochnieDniCalculator } from '@/components/calculators/RabochnieDniCalculator';
import { NeustoykaCalculator } from '@/components/calculators/NeustoykaCalculator';
import { ProsrochkaCalculator } from '@/components/calculators/ProsrochkaCalculator';
import { UderzhanieCalculator } from '@/components/calculators/UderzhanieCalculator';
import { TrudozatratyCalculator } from '@/components/calculators/TrudozatratyCalculator';

type Props = { params: Promise<{ slug: string }> };

// Реестр виджетов: tsc требует запись для каждого слага из CalcSlug —
// новый калькулятор нельзя зарегистрировать в данных, забыв виджет.
const WIDGETS: Record<CalcSlug, ComponentType> = {
  'smeta-avans': AvansCalculator,
  'ks2-ndsfree': Ks2Calculator,
  'rabochie-dni': RabochnieDniCalculator,
  'neustoyka-podryad': NeustoykaCalculator,
  'prosrochka-sdachi': ProsrochkaCalculator,
  'garantiynoe-uderzhanie': UderzhanieCalculator,
  'trudozatraty': TrudozatratyCalculator,
};

export async function generateStaticParams() {
  return CALCULATORS.map(c => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const calc = getCalcBySlug(slug);
  if (!calc) return {};
  const url = `https://komplid.ru/kalkulyator/${slug}`;
  return {
    title: `${calc.title} | Komplid`,
    description: calc.description,
    keywords: calc.keywords,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      title: calc.title,
      description: calc.description,
      url,
    },
  };
}

export default async function CalcPage({ params }: Props) {
  const { slug } = await params;
  const calc = getCalcBySlug(slug) ?? notFound();
  const Widget = WIDGETS[calc.slug];

  const url = `https://komplid.ru/kalkulyator/${slug}`;

  return (
    <>
      <SoftwareAppSchema
        name={calc.schemaName}
        description={calc.schemaDescription}
        url={url}
      />
      <HowToSchema
        name={`Как рассчитать: ${calc.titleShort}`}
        description={calc.schemaDescription}
        steps={calc.howToUse}
      />
      <BreadcrumbSchema
        items={[
          { name: 'Главная', url: 'https://komplid.ru' },
          { name: 'Калькуляторы', url: 'https://komplid.ru/kalkulyator' },
          { name: calc.titleShort, url },
        ]}
      />

      <article className="section">
        <div className="wrap" style={{ maxWidth: 900 }}>
          <span className="eyebrow">Komplid · Калькуляторы</span>
          <h1
            style={{
              marginTop: 12,
              marginBottom: 12,
              fontSize: 'clamp(26px, 3.5vw, 40px)',
              fontWeight: 500,
              letterSpacing: '-0.025em',
              color: 'var(--ink)',
            }}
          >
            {calc.title}
          </h1>
          <p style={{ fontSize: 16, color: 'var(--ink-soft)', margin: 0, maxWidth: 600 }}>
            {calc.description}
          </p>

          {/* Виджет калькулятора — выше сгиба */}
          <Widget />

          {/* Контент-стандарт §4: формула, пример, инструкция, нормативка, related */}
          <CalcContentSections calc={calc} />

          {/* Внутренние перелинковки на посадочные */}
          <div
            style={{
              marginTop: 40,
              padding: '16px 20px',
              background: 'var(--bg-inset)',
              borderRadius: 8,
              border: '1px solid var(--border)',
              fontSize: 13,
              color: 'var(--ink-soft)',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 16,
              alignItems: 'center',
            }}
          >
            <span>Автоматизируйте расчёты в рамках проекта:</span>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/pto" style={{ color: 'var(--accent-strong)', textDecoration: 'underline' }}>
                ИД-Мастер для ПТО
              </Link>
              <Link href="/smetchik" style={{ color: 'var(--accent-strong)', textDecoration: 'underline' }}>
                Сметчик-Студио
              </Link>
              <Link href="/kalkulyator" style={{ color: 'var(--accent-strong)', textDecoration: 'underline' }}>
                Все калькуляторы
              </Link>
            </div>
          </div>
        </div>
      </article>

      <Faq
        eyebrow="Вопросы о калькуляторе"
        title="Частые вопросы"
        items={calc.faq}
      />

      <Cta
        eyebrow="Komplid · Бесплатный триал"
        title="Упростите работу — попробуйте Komplid"
        description="Автоматические КС-2, КС-3, расчёт аванса и сроков прямо в системе управления проектом. Триал 14 дней без карты."
        primary={{
          label: 'Попробовать бесплатно',
          href: 'https://app.komplid.ru/signup?utm_source=landing&utm_medium=organic&utm_campaign=calculator',
        }}
        secondary={{ label: 'Изучить ИД-Мастер', href: '/pto' }}
      />
    </>
  );
}
