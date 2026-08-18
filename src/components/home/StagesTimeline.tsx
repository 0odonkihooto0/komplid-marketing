'use client';

import { useState } from 'react';
import { STAGES } from '@/lib/home-data';

/**
 * Жизненный цикл объекта: пять этапов, для каждого — что делается и в каких
 * модулях лежат документы. Клиентский компонент только ради переключения
 * вкладок; сам текст приезжает статикой и виден поисковикам в первом этапе.
 */
export function StagesTimeline() {
  const [active, setActive] = useState(2); // «СМР» — самый показательный этап
  const stage = STAGES[active]!;

  return (
    <section className="section" id="stages" style={{ scrollMarginTop: 72, paddingBottom: 76 }}>
      <div className="wrap-bleed">
        <div className="stages-head">
          <div className="section-head" style={{ maxWidth: 700, marginBottom: 0 }}>
            <span className="eyebrow-ref">Жизненный цикл объекта</span>
            <h2>Данные вводятся один раз и живут до ввода в эксплуатацию.</h2>
          </div>
          {/* Подсказка, что блок переключается: без неё пять вкладок читаются
              как заголовки колонок, а не как выбор. */}
          <div style={{ flex: 'none', textAlign: 'right' }}>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                fontWeight: 500,
                color: 'var(--acc)',
              }}
            >
              {active + 1} / {STAGES.length}
            </div>
            <div style={{ marginTop: 8, fontSize: 12.5, color: 'var(--t4)' }}>Выберите этап</div>
          </div>
        </div>

        {/* Ось прогресса */}
        <div style={{ position: 'relative', height: 3, background: 'var(--line)' }}>
          <div
            style={{
              position: 'absolute',
              inset: '0 auto 0 0',
              width: `${((active + 1) / STAGES.length) * 100}%`,
              background: 'var(--acc)',
              transition: 'width .45s cubic-bezier(.4,0,.2,1)',
            }}
          />
        </div>

        <div className="stage-tabs" role="tablist" aria-label="Этапы объекта">
          {STAGES.map((s, i) => (
            <button
              key={s.no}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-controls="stage-panel"
              className="stage-tab"
              onClick={() => setActive(i)}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: i === active ? 'var(--acc)' : 'var(--line3)',
                  }}
                />
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10.5,
                    fontWeight: 500,
                    letterSpacing: '0.14em',
                  }}
                >
                  {s.no}
                </span>
              </span>
              <span style={{ display: 'block', marginTop: 11, fontSize: 16, fontWeight: 500 }}>
                {s.name}
              </span>
            </button>
          ))}
        </div>

        <div className="stage-body" id="stage-panel" role="tabpanel">
          <div style={{ padding: '36px 38px 34px', borderRight: '1px solid var(--line2)' }}>
            <span className="eyebrow-ref">Этап {stage.no}</span>
            <h3 style={{ margin: '16px 0 14px', fontSize: 'clamp(24px, 3vw, 34px)', fontWeight: 500 }}>
              {stage.name}
            </h3>
            <p style={{ margin: '0 0 26px', fontSize: 15.5, lineHeight: 1.6, color: 'var(--t3)' }}>
              {stage.description}
            </p>
            <div style={{ display: 'flex', gap: 34, paddingTop: 22, borderTop: '1px solid var(--line)' }}>
              {stage.stats.map((st) => (
                <div key={st.label}>
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 26,
                      fontWeight: 500,
                      lineHeight: 1,
                    }}
                  >
                    {st.value}
                  </div>
                  <div className="counter-label" style={{ marginTop: 8 }}>
                    {st.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: '36px 38px 34px', background: 'var(--panelAlt)' }}>
            <div className="counter-label" style={{ marginTop: 0, marginBottom: 18 }}>
              Документы и модули этапа
            </div>
            <div style={{ display: 'grid', gap: 9 }}>
              {stage.docs.map((doc) => (
                <div
                  key={doc.title}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 13,
                    padding: '14px 16px',
                    background: 'var(--panel3)',
                    border: '1px solid var(--line2)',
                    borderRadius: 8,
                  }}
                >
                  <span style={{ width: 6, height: 6, background: 'var(--acc)', flex: 'none' }} />
                  <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--t2)' }}>
                    {doc.title}
                  </span>
                  <span
                    className="counter-label"
                    style={{ marginTop: 0, marginLeft: 'auto', letterSpacing: '0.08em' }}
                  >
                    {doc.module}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
