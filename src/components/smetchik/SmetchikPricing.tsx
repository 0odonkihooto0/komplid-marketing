'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface PricingTierDef {
  name: string;
  subtitle: string;
  monthlyPrice: number | null;
  priceNote: string;
  features: Array<{ text: string; included: boolean }>;
  ctaLabel: string;
  ctaHref: string;
  featured?: boolean;
  tag?: string;
}

const TIERS: PricingTierDef[] = [
  {
    name: 'Бесплатно',
    subtitle: 'Попробовать без рисков.',
    monthlyPrice: 0,
    priceNote: 'до 5 смет · только просмотр',
    features: [
      { text: 'До 5 смет в проекте', included: true },
      { text: 'Просмотр и экспорт PDF', included: true },
      { text: 'Импорт XML/Excel', included: false },
      { text: 'Сравнение версий', included: false },
      { text: 'Публичные ссылки', included: false },
    ],
    ctaLabel: 'Начать бесплатно',
    ctaHref: 'https://app.komplid.ru/signup?plan=free&role=smetchik&utm_source=landing&utm_medium=organic&utm_campaign=smetchik',
  },
  {
    name: 'Базовый',
    subtitle: 'Для активной работы со сметами.',
    monthlyPrice: 1900,
    priceNote: '1 специалист · до 50 смет',
    features: [
      { text: 'Импорт XML (Гранд-Смета, РИК)', included: true },
      { text: 'Импорт Excel', included: true },
      { text: 'Базовое сравнение версий', included: true },
      { text: 'Публичные ссылки для заказчика', included: false },
      { text: 'ФГИС ЦС и экспорт в Гранд-Смета', included: false },
    ],
    ctaLabel: 'Выбрать Базовый',
    ctaHref: 'https://app.komplid.ru/signup?plan=smetchik-base&role=smetchik&utm_source=landing&utm_medium=organic&utm_campaign=smetchik',
  },
  {
    name: 'Pro',
    subtitle: 'Полный арсенал сметчика.',
    monthlyPrice: 2900,
    priceNote: '1 специалист · безлимит',
    features: [
      { text: 'Всё из Базового', included: true },
      { text: 'Продвинутое сравнение версий (diff)', included: true },
      { text: 'Публичные ссылки для заказчика', included: true },
      { text: 'ФГИС ЦС в приложении', included: true },
      { text: 'Экспорт в Гранд-Смета XML', included: true },
    ],
    ctaLabel: 'Выбрать Pro',
    ctaHref: 'https://app.komplid.ru/signup?plan=smetchik-pro&role=smetchik&utm_source=landing&utm_medium=organic&utm_campaign=smetchik',
    featured: true,
    tag: 'Популярный',
  },
];

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
    <path d="M5 12l5 5L20 7" />
  </svg>
);

const CrossIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
    <path d="M6 6l12 12M6 18L18 6" />
  </svg>
);

function formatPrice(monthly: number | null, billing: 'monthly' | 'annual'): string {
  if (monthly === null || monthly === 0) return '0';
  const price = billing === 'annual' ? Math.round(monthly * 0.8) : monthly;
  return price.toLocaleString('ru-RU');
}

export function SmetchikPricing() {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');

  return (
    <section className="section" style={{ background: 'var(--bg-inset)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
      <div className="wrap">
        <div className="section-head" style={{ textAlign: 'center', margin: '0 auto 32px' }}>
          <span className="eyebrow" style={{ justifyContent: 'center' }}>Тарифы Сметчик-Студио</span>
          <h2 style={{ marginLeft: 'auto', marginRight: 'auto' }}>Начните бесплатно, растите по мере задач</h2>
          <p style={{ marginLeft: 'auto', marginRight: 'auto' }}>Все тарифы включают мобильное приложение. Без скрытых ограничений по числу проектов.</p>
        </div>

        {/* Billing toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
          <div
            style={{
              display: 'inline-flex',
              background: 'var(--bg-inset)',
              border: '1px solid var(--border)',
              borderRadius: 999,
              padding: 4,
              gap: 4,
            }}
          >
            {(['monthly', 'annual'] as const).map((b) => (
              <button
                key={b}
                onClick={() => setBilling(b)}
                style={{
                  padding: '7px 18px',
                  borderRadius: 999,
                  border: billing === b ? '1px solid var(--border)' : '1px solid transparent',
                  background: billing === b ? 'var(--bg-elev)' : 'transparent',
                  fontFamily: 'inherit',
                  fontSize: 13.5,
                  fontWeight: billing === b ? 500 : 400,
                  color: billing === b ? 'var(--ink)' : 'var(--ink-soft)',
                  cursor: 'pointer',
                  transition: 'all 0.12s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {b === 'monthly' ? 'Ежемесячно' : 'Ежегодно'}
                {b === 'annual' && (
                  <span
                    style={{
                      background: 'var(--ok)',
                      color: '#fff',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 9,
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                      padding: '2px 5px',
                      borderRadius: 4,
                    }}
                  >
                    −20%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Pricing cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              style={{
                background: 'var(--bg-elev)',
                border: `1px solid ${tier.featured ? 'var(--ink)' : 'var(--border)'}`,
                borderRadius: 12,
                padding: '28px 26px 26px',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                boxShadow: tier.featured ? 'var(--shadow-2)' : 'none',
              }}
            >
              {tier.tag && (
                <span
                  style={{
                    position: 'absolute',
                    top: -10,
                    right: 20,
                    background: 'var(--accent)',
                    color: 'var(--accent-ink)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    padding: '4px 9px',
                    borderRadius: 999,
                    fontWeight: 600,
                  }}
                >
                  {tier.tag}
                </span>
              )}

              <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 600 }}>{tier.name}</h3>
              <p style={{ margin: '0 0 22px', fontSize: 13, color: 'var(--ink-mute)', minHeight: 38 }}>{tier.subtitle}</p>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontSize: 40, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                  {formatPrice(tier.monthlyPrice, billing)}
                </span>
                <small style={{ fontSize: 13, fontWeight: 400, color: 'var(--ink-mute)' }}>
                  {tier.monthlyPrice === 0 ? '₽' : `₽/мес${billing === 'annual' ? ' · при оплате за год' : ''}`}
                </small>
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink-mute)', marginTop: 4 }}>{tier.priceNote}</div>

              <ul style={{ listStyle: 'none', padding: 0, margin: '22px 0', fontSize: 13 }}>
                {tier.features.map((f) => (
                  <li
                    key={f.text}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '18px 1fr',
                      gap: 8,
                      alignItems: 'start',
                      padding: '7px 0',
                      color: f.included ? 'var(--ink-soft)' : 'var(--ink-mute)',
                    }}
                  >
                    <span style={{ color: f.included ? 'var(--accent-strong)' : 'var(--ink-mute)', opacity: f.included ? 1 : 0.5, marginTop: 4 }}>
                      {f.included ? <CheckIcon /> : <CrossIcon />}
                    </span>
                    {f.text}
                  </li>
                ))}
              </ul>

              <a
                href={tier.ctaHref}
                className={tier.featured ? 'btn-accent' : 'btn-outline'}
                style={{ marginTop: 'auto', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              >
                {tier.ctaLabel}
                {tier.featured && <ArrowRight size={14} />}
              </a>
            </div>
          ))}
        </div>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'var(--ink-mute)' }}>
          Годовая подписка списывается единовременно. Смена тарифа — в любой момент.
        </p>
      </div>

      <style>{`
        @media (max-width: 900px) {
          #smetchik-pricing-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
