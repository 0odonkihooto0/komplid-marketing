import { OBJECT_MODULES, ORG_MODULES, CROSS_FEATURES } from '@/lib/home-data';
import { FeaturedModuleCard, CompactModuleCard, ContourHead } from './ModuleCards';

/**
 * 21 модуль в двух контурах. Ключевые четыре показаны крупно с описанием,
 * остальные — компактной сеткой: иначе экран превращается в стену текста,
 * по которой не видно, что именно делает система.
 */
export function ModulesGrid() {
  const featured = OBJECT_MODULES.filter((m) => m.description);
  const compact = OBJECT_MODULES.filter((m) => !m.description);
  const total = OBJECT_MODULES.length + ORG_MODULES.length;

  return (
    <section className="section" id="modules" style={{ scrollMarginTop: 72, paddingTop: 0 }}>
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow-ref">{total} модуля · два контура</span>
          <h2>
            Внутри объекта — стройка.
            <br />
            Над объектами — компания.
          </h2>
          <p>
            Модули не продаются по отдельности: во всех тарифах открыты все {total}. Различаются
            только число людей, активных строек и объём хранилища.
          </p>
        </div>

        <ContourHead
          title={`Контур объекта · ${OBJECT_MODULES.length} модулей`}
          hint="всё, что происходит на стройке: документы, деньги, сроки, качество"
        />
        <div className="mod-grid">
          {featured.map((m) => (
            <FeaturedModuleCard key={m.no} mod={m} />
          ))}
        </div>
        <div className="mod-compact-grid" style={{ marginTop: 12 }}>
          {compact.map((m) => (
            <CompactModuleCard key={m.no} mod={m} />
          ))}
        </div>

        <div style={{ marginTop: 34 }}>
          <ContourHead
            title={`Контур организации · ${ORG_MODULES.length} модулей`}
            hint="то, что над объектами: портфель строек, люди, обмен, справочники"
          />
          <div className="mod-compact-grid">
            {ORG_MODULES.map((m) => (
              <CompactModuleCard key={m.no} mod={m} />
            ))}
          </div>
        </div>

        <div style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', gap: 9 }}>
          {CROSS_FEATURES.map((f) => (
            <span
              key={f}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 9,
                padding: '9px 14px',
                borderRadius: 999,
                background: 'var(--panel)',
                border: '1px solid var(--line2)',
                fontSize: 12.5,
                color: 'var(--t3)',
              }}
            >
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--acc)' }} />
              {f}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
