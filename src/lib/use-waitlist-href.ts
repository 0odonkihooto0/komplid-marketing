'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { WAITLIST_ANCHOR, WAITLIST_MODE, globalCtaHref } from './waitlist';

/**
 * Куда вести кнопку раннего доступа, которая стоит на каждой странице.
 *
 * До гидратации и без JS — ссылка на главную с якорем: она работает везде.
 * После монтирования смотрим, есть ли форма на этой самой странице: если есть,
 * переключаемся на локальный якорь, и клик прокручивает к ней вместо перехода.
 *
 * Проверяем наличие узла, а не список адресов: список пришлось бы вспоминать
 * при каждой новой странице, а элемент в DOM — ровно то условие, от которого
 * зависит поведение кнопки.
 */
export function useWaitlistHref(signupHref: string): string {
  const pathname = usePathname();
  const [href, setHref] = useState(() => globalCtaHref(signupHref));

  useEffect(() => {
    if (!WAITLIST_MODE) return;
    const local = document.getElementById(WAITLIST_ANCHOR.slice(1)) !== null;
    setHref(local ? WAITLIST_ANCHOR : globalCtaHref(signupHref));
  }, [pathname, signupHref]);

  return href;
}
