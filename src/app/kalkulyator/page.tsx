import type { Metadata } from 'next';
import type { ComponentType } from 'react';
import Link from 'next/link';
import {
  Receipt,
  FileText,
  CalendarDays,
  Scale,
  Clock4,
  Banknote,
  Users,
  Snowflake,
  Box,
  Ruler,
  BrickWall,
  Layers,
  LayoutGrid,
  Rows3,
  Wallpaper,
  PaintRoller,
  Shovel,
  Home,
  CloudSnow,
  Wind,
  Accessibility,
  ArrowUpDown,
} from 'lucide-react';
import {
  CALCULATORS,
  CATEGORY_LABELS,
  type CalcCategory,
  type CalcSlug,
  type CalculatorMeta,
} from '@/lib/calculators-data';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';
import { ItemListSchema } from '@/components/seo/ItemListSchema';

// Форма слова «калькулятор» под числительным (для title и H1 хаба).
function pluralCalc(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'калькулятор';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'калькулятора';
  return 'калькуляторов';
}

const COUNT = CALCULATORS.length;

export const metadata: Metadata = {
  // Суффикс «| Komplid» добавляет title.template корневого layout — не дублируем
  title: `${COUNT} бесплатных ${pluralCalc(COUNT)} для строительства 2026`,
  description:
    'Онлайн-калькуляторы для стройки: деньги и договоры (аванс, КС-2, неустойка), материалы (бетон, кирпич, плитка), инженерные расчёты по СП. Бесплатно, без регистрации.',
  keywords: [
    'калькулятор для строительства',
    'расчёт аванса подрядчику',
    'калькулятор бетона и кирпича',
    'снеговая нагрузка по СП 20',
    'калькулятор строительство онлайн',
  ],
  alternates: { canonical: 'https://komplid.ru/kalkulyator' },
  openGraph: {
    type: 'website',
    title: `${COUNT} бесплатных ${pluralCalc(COUNT)} для строительства 2026`,
    description:
      'Деньги и договоры, материалы и объёмы, инженерные расчёты по СП — онлайн, бесплатно, без регистрации.',
  },
};

const ICONS: Record<CalcSlug, ComponentType<{ size?: number; color?: string }>> = {
  'smeta-avans': Receipt,
  'ks2-ndsfree': FileText,
  'rabochie-dni': CalendarDays,
  'neustoyka-podryad': Scale,
  'prosrochka-sdachi': Clock4,
  'garantiynoe-uderzhanie': Banknote,
  'trudozatraty': Users,
  'zimnee-udorozhanie': Snowflake,
  'obem-betona': Box,
  'armatura': Ruler,
  'kirpich-na-stenu': BrickWall,
  'rashod-shtukaturki': Layers,
  'plitka': LayoutGrid,
  'laminat': Rows3,
  'oboi': Wallpaper,
  'kraska': PaintRoller,
  'kotlovan': Shovel,
  'krovlya': Home,
  'snegovaya-nagruzka': CloudSnow,
  'vetrovaya-nagruzka': Wind,
  'pandus': Accessibility,
  'lestnitsa': ArrowUpDown,
};

// Порядок категорий на хабе (план 02 §5).
const CATEGORY_ORDER: CalcCategory[] = ['money', 'materials', 'engineering'];

export default function KalkulyatorPage() {
  const grouped = CATEGORY_ORDER.map(category => ({
    category,
    calcs: CALCULATORS.filter(c => c.category === category),
  })).filter(g => g.calcs.length > 0);

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Главная', url: 'https://komplid.ru' },
          { name: 'Калькуляторы', url: 'https://komplid.ru/kalkulyator' },
        ]}
      />
      <ItemListSchema
        name="Бесплатные калькуляторы для строительства — Komplid"
        items={CALCULATORS.map(c => ({
          name: c.titleShort,
          url: `https://komplid.ru/kalkulyator/${c.slug}`,
        }))}
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
            {COUNT} бесплатных {pluralCalc(COUNT)} для строительства
          </h1>
          <p style={{ maxWidth: 620, fontSize: 16, color: 'var(--ink-soft)', margin: 0 }}>
            Три раздела: деньги и договоры (аванс, КС-2, неустойка), материалы и объёмы (бетон,
            кирпич, плитка), инженерные расчёты по СП (снеговая и ветровая нагрузка, пандус) —
            онлайн, без регистрации, с формулами и нормативным обоснованием.
          </p>
        </div>
      </div>

      <div className="section wrap">
        {grouped.map(({ category, calcs }) => (
          <section key={category} style={{ marginBottom: 56 }}>
            <h2
              style={{
                margin: '0 0 8px',
                fontSize: 24,
                fontWeight: 600,
                letterSpacing: '-0.015em',
                color: 'var(--ink)',
              }}
            >
              {CATEGORY_LABELS[category].title}
            </h2>
            <p style={{ margin: '0 0 24px', maxWidth: 640, fontSize: 14, color: 'var(--ink-soft)' }}>
              {CATEGORY_LABELS[category].description}
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: 20,
              }}
            >
              {calcs.map(calc => (
                <CalcCard key={calc.slug} calc={calc} />
              ))}
            </div>
          </section>
        ))}

        <div
          style={{
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
      className="border border-[var(--border)] transition-[border-color,transform,translate] duration-150 hover:-translate-y-0.5 hover:border-[var(--accent)]"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        padding: 24,
        background: 'var(--bg-elev)',
        borderRadius: 12,
        textDecoration: 'none',
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
