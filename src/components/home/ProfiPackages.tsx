'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PROFI_ROLES, PROFI_NOTE } from '@/lib/audience-data';
import { primaryCtaHref } from '@/lib/waitlist';
import { CheckItem } from './CheckItem';

/**
 * Профи-пакеты: боль → что даёт пакет → цена. Три роли переключаются вкладками.
 * Ссылка «Подробнее» ведёт на посадочную роли — это основная перелинковка
 * главной с /smetchik, /pto и /prorab.
 */
export function ProfiPackages() {
  const [active, setActive] = useState(1); // ПТО — самая массовая роль
  const role = PROFI_ROLES[active]!;

  return (
    <div
      style={{
        border: '1px solid var(--line2)',
        borderRadius: 14,
        background: 'var(--panel2)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
          padding: '18px 24px',
          borderBottom: '1px solid var(--line)',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--t4)',
          }}
        >
          Тариф «Себе» · платит специалист, не компания
        </span>
        <div className="pill-group" role="tablist" aria-label="Профи-пакеты" style={{ marginLeft: 'auto' }}>
          {PROFI_ROLES.map((r, i) => (
            <button
              key={r.id}
              type="button"
              role="tab"
              aria-selected={i === active}
              className="pill"
              style={{ fontSize: 12.5, padding: '7px 14px' }}
              onClick={() => setActive(i)}
            >
              {r.tab}
            </button>
          ))}
        </div>
      </div>

      <div className="profi-body">
        <div style={{ padding: '26px 28px' }}>
          <div className="counter-label" style={{ marginTop: 0 }}>
            Боль
          </div>
          <p style={{ margin: '12px 0 0', fontSize: 17, lineHeight: 1.5, color: 'var(--t1)' }}>
            {role.pain}
          </p>
        </div>

        <div style={{ padding: '26px 28px' }}>
          <div className="counter-label" style={{ marginTop: 0, color: 'var(--acc)' }}>
            Что даёт пакет
          </div>
          <div
            style={{
              marginTop: 14,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '12px 20px',
            }}
          >
            {role.items.map((item) => (
              <CheckItem key={item} text={item} />
            ))}
          </div>
        </div>

        <div style={{ padding: '26px 28px', background: 'var(--inset)', display: 'flex', flexDirection: 'column' }}>
          <div className="counter-label" style={{ marginTop: 0, color: 'var(--acc)' }}>
            {role.pack}
          </div>
          <div style={{ marginTop: 14, display: 'flex', alignItems: 'baseline', gap: 7 }}>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 38,
                fontWeight: 500,
                lineHeight: 1,
                letterSpacing: '-0.035em',
              }}
            >
              {role.price}
            </span>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--t4)' }}>₽ / мес</span>
          </div>
          <p style={{ margin: '11px 0 0', fontSize: 12.5, lineHeight: 1.5, color: 'var(--t4)' }}>
            {PROFI_NOTE}
          </p>
          <div style={{ marginTop: 'auto', paddingTop: 18, display: 'grid', gap: 8 }}>
            <a href={primaryCtaHref('https://app.komplid.ru/signup')} className="btn-accent">
              Занять место в бете
            </a>
            <Link href={role.href} className="btn-outline">
              Подробнее о пакете
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
