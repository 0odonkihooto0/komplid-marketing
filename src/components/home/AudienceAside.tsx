import { SPACE_ROLES } from '@/lib/home-data';

/**
 * Правая колонка секции «Для кого» — то, что человек получает, а не текст о том.
 * Специалисту показываем его профиль и ленту заказов, компании — состав
 * пространства.
 *
 * ЧЕСТНОСТЬ (CLAUDE.md §21). В прототипе на карточке стояли фамилия
 * и метрики «34 объекта · 1 240 актов · 0,4% возвратов», а в ленте — суммы
 * заказов. Это выглядит как данные живого клиента, которых у нас нет:
 * публиковать такое — ст. 5 ФЗ «О рекламе». Вёрстка перенесена, содержимое
 * заменено на подписи полей, и обе карточки явно помечены примером.
 */

const FIELD_ROWS = [
  { label: 'объектов', hint: 'считается по вашим стройкам' },
  { label: 'актов сдано', hint: 'из подписанных пакетов' },
  { label: 'возвратов', hint: 'доля актов, вернувшихся с приёмки' },
];

const ORDER_ROWS = [
  { title: 'Комплект ИД на объект, 3 месяца', meta: 'бюджет · сроки', delay: '0.1s' },
  { title: 'Технадзор, объект под ключ', meta: 'бюджет · сроки', delay: '0.3s' },
  { title: 'Разовая сборка АОСР', meta: 'бюджет · сроки', delay: '0.5s' },
];

/** Плашка «это пример вида, а не чьи-то данные» — общая для обеих карточек. */
function ExampleBadge({ text }: { text: string }) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '3px 8px',
        borderRadius: 5,
        background: 'var(--accSoft)',
        color: 'var(--acc)',
        fontFamily: 'var(--font-mono)',
        fontSize: 9.5,
        fontWeight: 600,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
      }}
    >
      {text}
    </span>
  );
}

function SpecialistAside() {
  return (
    <>
      <div className="aside-card">
        <div className="aside-card__tape" />
        <div style={{ padding: '22px 24px 24px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 20,
            }}
          >
            <div>
              <div className="counter-label" style={{ marginTop: 0, letterSpacing: '0.16em' }}>
                Профиль специалиста
              </div>
              <div style={{ marginTop: 7 }}>
                <ExampleBadge text="пример вида · не данные клиента" />
              </div>
            </div>
            <div className="aside-card__qr anim-pulse-slow" aria-hidden="true" />
          </div>

          <div style={{ display: 'flex', gap: 18, marginTop: 22, alignItems: 'flex-end' }}>
            <div className="aside-card__photo" aria-hidden="true">
              ФОТО
            </div>
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 26,
                  fontWeight: 500,
                  lineHeight: 1.1,
                  letterSpacing: '-0.03em',
                  color: 'var(--t1)',
                }}
              >
                Инженер ПТО
              </div>
              <div style={{ marginTop: 7, fontSize: 14, color: 'var(--acc)' }}>
                специальность и стаж
              </div>
              <div
                className="counter-label"
                style={{ marginTop: 10, letterSpacing: '0.1em', textTransform: 'none' }}
              >
                номер профиля · город
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 22,
              paddingTop: 18,
              borderTop: '1px solid var(--line2)',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 12,
            }}
          >
            {FIELD_ROWS.map((f) => (
              <div key={f.label}>
                <div
                  title={f.hint}
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 24,
                    fontWeight: 500,
                    lineHeight: 1,
                    color: 'var(--t4)',
                  }}
                >
                  —
                </div>
                <div className="counter-label" style={{ marginTop: 7 }}>
                  {f.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: 14,
          background: 'var(--panel)',
          border: '1px solid var(--line2)',
          borderRadius: 12,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flexWrap: 'wrap',
            padding: '14px 20px',
            borderBottom: '1px solid var(--line)',
          }}
        >
          <span className="counter-label" style={{ marginTop: 0, letterSpacing: '0.14em' }}>
            Заказы под ваш профиль
          </span>
          <ExampleBadge text="пример" />
        </div>
        {ORDER_ROWS.map((o) => (
          <div
            key={o.title}
            className="anim-rise"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '14px 20px',
              borderBottom: '1px solid var(--lineSoft)',
              animationDelay: o.delay,
            }}
          >
            <span
              style={{
                flex: 'none',
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'var(--acc)',
              }}
            />
            <span style={{ fontSize: 13.5, color: 'var(--t2)' }}>{o.title}</span>
            <span
              className="counter-label"
              style={{ marginTop: 0, marginLeft: 'auto', letterSpacing: '0.06em' }}
            >
              {o.meta}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

function CompanyAside() {
  return (
    <div className="aside-card">
      <div className="aside-card__tape" />
      <div style={{ padding: '20px 24px 8px' }}>
        <span className="counter-label" style={{ marginTop: 0, letterSpacing: '0.16em' }}>
          Кто заходит в пространство
        </span>
      </div>
      <div style={{ padding: '0 24px 20px' }}>
        {SPACE_ROLES.map((role) => (
          <div
            key={role.name}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '11px 0',
              borderBottom: '1px solid var(--lineSoft)',
            }}
          >
            <span
              style={{
                flex: 'none',
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: role.free ? 'var(--ok)' : 'var(--acc)',
              }}
            />
            <span style={{ fontSize: 13.5, color: 'var(--t2)' }}>{role.name}</span>
            <span
              style={{
                marginLeft: 'auto',
                fontFamily: 'var(--font-mono)',
                fontSize: 10.5,
                letterSpacing: '0.08em',
                color: role.free ? 'var(--ok)' : 'var(--t4)',
                whiteSpace: 'nowrap',
              }}
            >
              {role.free ? 'без места' : 'место в тарифе'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AudienceAside({ specialist }: { specialist: boolean }) {
  return specialist ? <SpecialistAside /> : <CompanyAside />;
}
