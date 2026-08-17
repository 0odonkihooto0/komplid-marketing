'use client';

import { useState } from 'react';
import { ROLE_VIEWS } from '@/lib/home-data';

/**
 * Роли в двух разрезах: кто что видит в пространстве компании и кто какой
 * пункт акта подписывает по приказу 344/пр. Второе — сильный AEO-сигнал:
 * «кто подписывает АОСР» спрашивают и у поисковиков, и у ассистентов.
 */
export function RolesMatrix() {
  const [view, setView] = useState(0);
  const current = ROLE_VIEWS[view]!;

  return (
    <section
      className="section"
      id="roles"
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
          <span className="eyebrow-ref">Роли и право подписи</span>
          <div className="pill-group" role="tablist" aria-label="Разрез ролей">
            {ROLE_VIEWS.map((v, i) => (
              <button
                key={v.tab}
                type="button"
                role="tab"
                aria-selected={i === view}
                className="pill"
                onClick={() => setView(i)}
              >
                {v.tab}
              </button>
            ))}
          </div>
        </div>

        <div className="split-2" style={{ marginTop: 22 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 'clamp(26px, 3.4vw, 40px)', fontWeight: 500 }}>
              {current.title}
            </h2>
            <p style={{ margin: '14px 0 0', fontSize: 16.5, lineHeight: 1.6, color: 'var(--t3)' }}>
              {current.subtitle}
            </p>
          </div>
          <div
            style={{
              padding: 20,
              borderRadius: 12,
              background: 'var(--panel)',
              border: '1px solid var(--line2)',
            }}
          >
            <div className="counter-label" style={{ marginTop: 0, color: 'var(--acc)' }}>
              Что это меняет
            </div>
            <p style={{ margin: '10px 0 0', fontSize: 13.5, lineHeight: 1.6, color: 'var(--t3)' }}>
              {current.note}
            </p>
          </div>
        </div>

        <div className="roles-grid" style={{ marginTop: 24 }}>
          {current.roles.map((role) => (
            <div className="role-card" key={role.name}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                <span style={{ fontSize: 14.5, fontWeight: 500, lineHeight: 1.3, color: 'var(--t1)' }}>
                  {role.name}
                </span>
                <span
                  title={role.free ? 'Не занимает место в тарифе' : undefined}
                  style={{
                    flex: 'none',
                    marginTop: 5,
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: role.free ? 'var(--ok)' : 'var(--acc)',
                  }}
                />
              </div>
              <div
                style={{
                  marginTop: 9,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10.5,
                  letterSpacing: '0.08em',
                  color: 'var(--acc)',
                }}
              >
                {role.meta}
              </div>
              <div style={{ marginTop: 9, fontSize: 12, lineHeight: 1.45, color: 'var(--t4)' }}>
                {role.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
