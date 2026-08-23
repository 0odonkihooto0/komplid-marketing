import type { Metadata } from 'next';
import Link from 'next/link';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';
import { WaitlistSection } from '@/components/blocks/WaitlistSection';

export const metadata: Metadata = {
  title: 'О компании Комплид — ERP для строительных проектов',
  description:
    'Комплид — российская ERP-платформа для управления строительством: исполнительная документация, сметы, журналы, стройконтроль и ТИМ в одной системе. Данные в РФ, соответствие 152-ФЗ.',
  alternates: { canonical: 'https://komplid.ru/company/about' },
};

export default function AboutPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Главная', url: 'https://komplid.ru' },
          { name: 'О компании', url: 'https://komplid.ru/company/about' },
        ]}
      />

      <div className="section" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="wrap">
          <span className="eyebrow">Комплид · О компании</span>
          <h1
            className="mb-4 mt-3 text-4xl font-medium tracking-tight"
            style={{ letterSpacing: '-0.025em', color: 'var(--ink)' }}
          >
            ERP для строительства, сделанная под российские реалии
          </h1>
          <p className="max-w-2xl text-lg" style={{ color: 'var(--ink-soft)' }}>
            Комплид объединяет исполнительную документацию, сметы, журналы работ, стройконтроль и
            ТИМ в одной системе. Мы делаем инструмент, который уже знает про АОСР, КС-2/КС-3,
            приказ №344/пр и маршруты согласования — а не абстрактный «таск-трекер».
          </p>
        </div>
      </div>

      <div className="section wrap" style={{ maxWidth: 760 }}>
        <h2 className="mb-3 text-2xl font-semibold" style={{ color: 'var(--ink)' }}>
          Зачем мы это делаем
        </h2>
        <p className="mb-6 leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
          На стройке всё ещё много ручной работы: документы собираются по папкам, версии смет
          сверяются неделями, журналы дублируются на бумаге. Комплид связывает документы, сроки и
          деньги между собой — меняется одно, пересчитывается всё. Это сокращает время на выпуск
          КС-2 и снижает возвраты исполнительной документации от инспекторов.
        </p>

        <h2 className="mb-3 text-2xl font-semibold" style={{ color: 'var(--ink)' }}>
          Для кого
        </h2>
        <p className="mb-6 leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
          Для генподрядчиков, заказчиков, технадзора и проектировщиков — командные тарифы со всеми
          модулями. И для одиночных специалистов — Профи-пакеты{' '}
          <Link href="/smetchik" style={{ color: 'var(--accent-strong)' }}>
            Сметчик-Студио
          </Link>
          ,{' '}
          <Link href="/pto" style={{ color: 'var(--accent-strong)' }}>
            ИД-Мастер
          </Link>{' '}
          и{' '}
          <Link href="/prorab" style={{ color: 'var(--accent-strong)' }}>
            Прораб-Журнал
          </Link>{' '}
          от 1 900 ₽/мес.
        </p>

        <h2 className="mb-3 text-2xl font-semibold" style={{ color: 'var(--ink)' }}>
          Данные и безопасность
        </h2>
        <p className="mb-6 leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
          Вся инфраструктура размещена в российских дата-центрах. Платформа соответствует
          требованиям 152-ФЗ о персональных данных.
        </p>

        <p style={{ color: 'var(--ink-soft)' }}>
          Вопросы и предложения —{' '}
          <Link href="/company/contact" style={{ color: 'var(--accent-strong)' }}>
            свяжитесь с нами
          </Link>
          .
        </p>
      </div>

      <WaitlistSection source="about" />
    </>
  );
}
