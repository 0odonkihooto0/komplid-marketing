/**
 * Правая часть героя: как запись смены становится актом, а акт — закрытием
 * месяца. Это иллюстрация процесса, а не снимок интерфейса, — поэтому цифры
 * в ней условные и никаких клиентских метрик не заявляют.
 */
const CHAIN = [
  {
    no: '01',
    title: 'Журнал смены · 12 марта',
    note: 'Бетонирование плиты, ось 4–7 · фото 6 · с координатами',
  },
  {
    no: '02',
    title: 'АОСР № 118 сформирован',
    note: 'Приложения подтянуты: паспорта, сертификаты, схема',
  },
  {
    no: '03',
    title: 'Подписи сторон собраны',
    note: 'Подрядчик, технадзор, застройщик — с отметкой места и времени',
  },
  {
    no: '04',
    title: 'КС-2 за месяц посчитана',
    note: 'Объёмы из актов легли в закрытие по договору',
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
            bottom: 48,
            width: 1,
            background: 'var(--line3)',
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
                    background: 'var(--acc)',
                    opacity: 0.85,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
