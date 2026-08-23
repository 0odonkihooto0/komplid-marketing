'use client';

import { useEffect, useState } from 'react';
import { BETA_SEATS_TOTAL, seatsPhrase } from '@/lib/waitlist';

/**
 * Остаток мест в закрытой бете. Число подтягивается с /api/waitlist-seats
 * уже в браузере: страница статическая, и посчитанное при сборке значение
 * застряло бы до следующего деплоя.
 *
 * Пока число не приехало — не показываем ничего. Заглушка вроде «осталось
 * мало мест» была бы ровно тем недостоверным дефицитом, которого мы избегаем.
 *
 * Слово «бета» живёт в надзаголовке рядом, поэтому здесь остаются только места:
 * «34 места из 100».
 */
export function SeatsCounter() {
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/waitlist-seats')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { left?: number } | null) => {
        if (!cancelled && typeof data?.left === 'number') setLeft(data.left);
      })
      .catch(() => {
        // Счётчик необязателен: без него секция просто короче.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (left === null) return null;

  return (
    <>
      {/* Точка пульсирует, только когда число мест реальное: мигающий индикатор
          рядом с пустотой обещал бы дефицит, которого мы не считали. */}
      <span
        className="anim-pulse"
        style={{
          width: 5,
          height: 5,
          borderRadius: '50%',
          background: 'var(--acc)',
          flex: 'none',
        }}
      />
      <span style={{ color: 'var(--t4)' }}>
        {seatsPhrase(left)} из {BETA_SEATS_TOTAL}
      </span>
    </>
  );
}
