'use client';

import { useEffect, useRef, useState } from 'react';

// Постоянная ссылка на расчёт (план 02-CALCULATORS-PLAN.md §2 п. 3):
// состояние виджета зеркалится в query-параметры, ссылка с параметрами
// восстанавливает введённые значения.
//
// SSG-безопасность: первый рендер всегда идёт с дефолтами (совпадает с
// пререндеренным HTML), URL читается в useEffect после маунта — поэтому
// hydration mismatch исключён. Запись в URL включается только после чтения
// (флаг loaded в state, а не ref: эффект записи первого коммита обязан
// увидеть loaded=false и не затереть входящие параметры дефолтами).

interface Options {
  /** Вызывается один раз после маунта, если в URL есть query-параметры. */
  onLoad: (params: URLSearchParams) => void;
  /** Текущие значения; пустые строки в URL не пишутся. */
  params: Record<string, string>;
}

export function useCalcUrlState({ onLoad, params }: Options) {
  const [loaded, setLoaded] = useState(false);
  const onLoadRef = useRef(onLoad);
  onLoadRef.current = onLoad;

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    if (Array.from(sp.keys()).length > 0) onLoadRef.current(sp);
    setLoaded(true);
  }, []);

  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== ''),
  ).toString();

  useEffect(() => {
    if (!loaded) return;
    const { pathname, hash } = window.location;
    window.history.replaceState(null, '', query ? `${pathname}?${query}${hash}` : `${pathname}${hash}`);
  }, [loaded, query]);
}

/** Безопасно читает строковый параметр: undefined → пустая строка. */
export function readParam(sp: URLSearchParams, key: string): string {
  return sp.get(key) ?? '';
}
