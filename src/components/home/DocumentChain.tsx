/**
 * Правая часть героя: как запись смены становится актом, а акт — закрытием
 * месяца. Это иллюстрация процесса, а не снимок интерфейса, — поэтому цифры
 * в ней условные и никаких клиентских метрик не заявляют.
 *
 * Блок скрыт от скринридеров (aria-hidden): весь его смысл в движении, а
 * текстом он повторяет то, что уже сказано в заголовке и абзаце героя.
 */
const CHAIN = [
  {
    no: '01',
    title: 'Журнал смены · 12 марта',
    note: 'Бетонирование плиты, ось 4–7 · фото 6 · с координатами',
    /* Задержки складываются в один такт: полосы заполняются по очереди,
       и точка на рейке доходит до низа ровно к моменту штампа. */
    delay: '0.1s',
  },
  {
    no: '02',
    title: 'АОСР № 118 сформирован',
    note: 'Приложения подтянуты: паспорта, сертификаты, схема',
    delay: '1.2s',
  },
  {
    no: '03',
    title: 'КС-2 за месяц посчитана',
    note: 'Объёмы из актов легли в закрытие по договору',
    delay: '2.3s',
  },
];

export function DocumentChain() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'relative',
        background: 'var(--panel)',
        border: '1px solid var(--line3)',
        borderRadius: 14,
        boxShadow: '0 34px 90px var(--shadow)',
        overflow: 'hidden',
      }}
    >
      {/* Полоса сканера — она же подсказка, что карточка живая */}
      <div
        className="anim-scan"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          height: 52,
          background: 'linear-gradient(var(--glow1), transparent)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          borderBottom: '1px solid var(--line2)',
          fontFamily: 'var(--font-mono)',
          fontSize: 10.5,
          fontWeight: 500,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--t4)',
        }}
      >
        <span>Объект 04 · корпус 2</span>
        <span style={{ color: 'var(--acc)' }}>цепочка документа</span>
      </div>

      <div style={{ position: 'relative', padding: '26px 24px 22px' }}>
        {/* Вертикаль, связывающая шаги */}
        <div
          style={{
            position: 'absolute',
            left: 33,
            top: 48,
            bottom: 80,
            width: 1,
            background: 'var(--line3)',
          }}
        />
        {/* Точка, пробегающая рейку сверху вниз */}
        <div
          className="anim-travel"
          style={{
            position: 'absolute',
            left: 30,
            top: 48,
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: 'var(--acc)',
            boxShadow: '0 0 14px var(--acc)',
          }}
        />

        <div style={{ display: 'grid', gap: 18 }}>
          {CHAIN.map((step) => (
            <div key={step.no} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div
                style={{
                  flex: 'none',
                  width: 20,
                  height: 20,
                  borderRadius: 5,
                  border: '1px solid var(--line3)',
                  background: 'var(--panel3)',
                  display: 'grid',
                  placeItems: 'center',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 9,
                  fontWeight: 500,
                  color: 'var(--t3)',
                  position: 'relative',
                }}
              >
                {step.no}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14.5, fontWeight: 500, color: 'var(--t2)' }}>
                  {step.title}
                </div>
                <div style={{ marginTop: 5, fontSize: 12.5, color: 'var(--t4)' }}>{step.note}</div>
                <div
                  style={{
                    marginTop: 10,
                    height: 3,
                    borderRadius: 2,
                    background: 'var(--line)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    className="anim-fill"
                    style={{ height: '100%', background: 'var(--acc)', animationDelay: step.delay }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Чем цепочка заканчивается: подпись с местом и временем */}
        <div
          style={{
            marginTop: 24,
            padding: '16px 18px',
            borderRadius: 10,
            border: '1px dashed var(--line3)',
            background: 'var(--panel3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--t4)',
              }}
            >
              Подписано ПЭП
            </div>
            <div
              style={{
                marginTop: 6,
                fontFamily: 'var(--font-mono)',
                fontSize: 12.5,
                color: 'var(--t2)',
              }}
            >
              55.7512, 37.6184 · геозона объекта
            </div>
          </div>
          <div
            className="anim-stamp"
            style={{
              flex: 'none',
              padding: '8px 13px',
              borderRadius: 6,
              border: '1.5px solid var(--okLine)',
              color: 'var(--ok)',
              fontFamily: 'var(--font-mono)',
              fontSize: 11.5,
              fontWeight: 600,
              letterSpacing: '0.08em',
              whiteSpace: 'nowrap',
            }}
          >
            ОК · ПТО
          </div>
        </div>
      </div>
    </div>
  );
}
