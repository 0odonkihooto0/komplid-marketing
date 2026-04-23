import type { Metadata } from 'next';
import type { ComponentType, MouseEvent } from 'react';
import Link from 'next/link';
import { Receipt, FileText, CalendarDays } from 'lucide-react';
import { CALCULATORS, type CalculatorMeta } from '@/lib/calculators-data';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';

export const metadata: Metadata = {
  title: 'Бесплатные калькуляторы для строительства 2026 | Komplid',
  description:
    'Онлайн-калькуляторы для подрядчиков и ПТО: аванс по контракту, КС-2 с НДС и без, рабочие дни по производственному календарю. Бесплатно, без регистрации.',
  keywords: [
    'калькулятор для строительства',
    'расчёт аванса подрядчику',
    'КС-2 НДС онлайн',
    'рабочие дни 2026',
    'калькулятор строительство онлайн',
  ],
  alternates: { canonical: 'https://komplid.ru/kalkulyator' },
  openGraph: {
    type: 'website',
    title: 'Бесплатные калькуляторы для строительства 2026',
    description: 'Аванс подрядчику, КС-2 с НДС, рабочие дни — онлайн, бесплатно, без регистрации.',
  },
};

const ICONS: Record<CalculatorMeta['slug'], ComponentType<{ size?: number; color?: string }>> = {
  'smeta-avans': Receipt,
  'ks2-ndsfree': FileText,
  'rabochie-dni': CalendarDays,
};

export default function KalkulyatorPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Главная', url: 'https://komplid.ru' },
          { name: 'Калькуляторы', url: 'https://komplid.ru/kalkulyator' },
        ]}
      />

      <div className="section" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="wrap">
          <span className="eyebrow">Komplid · Калькуляторы</span>
          <h1
            style={{
              marginTop: 12,
              marginBottom: 16,
              fontSize: 'clamp(28px, 4vw, 44px)',
              fontWeight: 500,
              letterSpacing: '-0.025em',
              color: 'var(--ink)',
            }}
          >
            Бесплатные калькуляторы для строительства
          </h1>
          <p style={{ maxWidth: 560, fontSize: 16, color: 'var(--ink-soft)', margin: 0 }}>
            Рассчитайте аванс подрядчику, проверьте КС-2 с НДС или посчитайте рабочие дни по
            производственному календарю 2026 — онлайн, без регистрации.
          </p>
        </div>
      </div>

      <div className="section wrap">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 20,
          }}
        >
          {CALCULATORS.map(calc => (
            <CalcCard key={calc.slug} calc={calc} />
          ))}
        </div>

        <div
          style={{
            marginTop: 48,
            padding: '20px 24px',
            background: 'var(--bg-inset)',
            borderRadius: 10,
            border: '1px solid var(--border)',
            fontSize: 14,
            color: 'var(--ink-soft)',
          }}
        >
          Нужно автоматизировать расчёт аванса, КС-2 и сроков прямо в рамках строительного
          проекта?{' '}
          <Link href="/pto" style={{ color: 'var(--accent-strong)', textDecoration: 'underline' }}>
            Попробуйте ИД-Мастер
          </Link>{' '}
          — все расчёты выполняются автоматически при формировании актов.
        </div>
      </div>
    </>
  );
}

function CalcCard({ calc }: { calc: CalculatorMeta }) {
  const Icon = ICONS[calc.slug];

  return (
    <Link
      href={`/kalkulyator/${calc.slug}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        padding: 24,
        background: 'var(--bg-elev)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        transition: 'border-color 0.15s, transform 0.15s',
        textDecoration: 'none',
      }}
      onMouseOver={(e: MouseEvent<HTMLAnchorElement>) => {
        e.currentTarget.style.borderColor = 'var(--accent)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseOut={(e: MouseEvent<HTMLAnchorElement>) => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.transform = 'none';
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 8,
          background: 'var(--bg-inset)',
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--ink-soft)',
        }}
      >
        <Icon size={18} />
      </div>

      <div>
        <p
          style={{
            margin: '0 0 6px',
            fontWeight: 600,
            fontSize: 16,
            color: 'var(--ink)',
            letterSpacing: '-0.005em',
          }}
        >
          {calc.titleShort}
        </p>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
          {calc.description.slice(0, 100)}…
        </p>
      </div>

      <span
        style={{
          marginTop: 'auto',
          fontSize: 13,
          fontWeight: 500,
          color: 'var(--accent-strong)',
        }}
      >
        Открыть калькулятор →
      </span>
    </Link>
  );
}
