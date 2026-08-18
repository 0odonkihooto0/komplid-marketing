'use client';

import { useState } from 'react';
import { AUDIENCES } from '@/lib/audience-data';
import { AudienceAside } from './AudienceAside';
import { CheckItem } from './CheckItem';
import { ProfiPackages } from './ProfiPackages';
import { TariffCards } from './TariffCards';

/**
 * Две точки входа: специалист платит за себя, компания — за команду.
 * Под каждой аудиторией своя тарифная сетка, поэтому якорь #price лежит
 * внутри — ссылки из шапки и подвала ведут туда, где цены реально есть.
 */
export function AudienceSwitcher() {
  const [active, setActive] = useState(0);
  const audience = AUDIENCES[active]!;
  const isSpecialist = audience.id === 'specialist';

  return (
    <section
      className="section"
      id="who"
      style={{ scrollMarginTop: 72, background: 'var(--bg3)', borderTop: '1px solid var(--lineSoft)' }}
    >
      <div className="wrap">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 24,
            flexWrap: 'wrap',
          }}
        >
          <span className="eyebrow-ref">Две точки входа</span>
          <div className="pill-group" role="tablist" aria-label="Кому это нужно">
            {AUDIENCES.map((a, i) => (
              <button
                key={a.id}
                type="button"
                role="tab"
                aria-selected={i === active}
                className="pill"
                onClick={() => setActive(i)}
              >
                {a.tab}
              </button>
            ))}
          </div>
        </div>

        <div className="audience-grid" style={{ marginTop: 22, marginBottom: 40 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 'clamp(26px, 3.4vw, 40px)', fontWeight: 500 }}>
              {audience.title}
            </h2>
            <p
              style={{
                margin: '14px 0 26px',
                fontSize: 16.5,
                lineHeight: 1.6,
                color: 'var(--t3)',
              }}
            >
              {audience.subtitle}
            </p>
            <div style={{ display: 'grid', gap: 12 }}>
              {audience.items.map((item) => (
                <CheckItem key={item} text={item} />
              ))}
            </div>
          </div>

          {/* Справа — что человек получает: профиль и заказы либо состав команды */}
          <div>
            <AudienceAside specialist={isSpecialist} />
          </div>
        </div>

        <div id="price" style={{ scrollMarginTop: 84 }}>
          {isSpecialist ? <ProfiPackages /> : <TariffCards />}
        </div>
      </div>
    </section>
  );
}
