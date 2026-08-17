'use client';

import { useEffect, useState } from 'react';
import { seatsPhrase } from '@/lib/waitlist';

/**
 * Остаток мест в закрытой бете. Число подтягивается с /api/waitlist-seats
 * уже в браузере: страница статическая, и посчитанное при сборке значение
 * застряло бы до следующего деплоя.
 *
 * Пока число не приехало — не показываем ничего. Заглушка вроде «осталось
 * мало мест» была бы ровно тем недостоверным дефицитом, которого мы избегаем.
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

  return <span style={{ color: 'var(--t4)' }}>закрытая бета · {seatsPhrase(left)}</span>;
}
