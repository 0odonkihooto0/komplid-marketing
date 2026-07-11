// Зимнее удорожание строительно-монтажных работ.
//
// Действующий норматив: Методика определения дополнительных затрат при
// производстве работ в зимнее время, утв. приказом Минстроя России от
// 25.05.2021 №325/пр (вступила в силу 08.08.2021). Прежний ГСН 81-05-02-2007
// с этой даты признан не подлежащим применению.
//
// Нормативы НДЗ (% от стоимости СМР) зависят от температурной зоны и вида
// объекта и приведены в приложениях к Методике. Таблица нормативов НАМЕРЕННО
// не зашита в код: значения не удалось сверить по двум независимым источникам
// (blindspot B-4 плана 00-STRATEGY — «данные только вручную выверенные»),
// поэтому пользователь вводит норматив из своей сметной документации.

export interface WinterIncreaseResult {
  /** Сумма зимнего удорожания, ₽ */
  increase: number;
  /** Стоимость СМР с учётом удорожания, ₽ */
  total: number;
}

function clampNonNegative(n: number): number {
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** Удорожание = СМР × НДЗ% / 100; итого = СМР + удорожание. */
export function computeWinterIncrease(smrCost: number, ndzPct: number): WinterIncreaseResult {
  const base = clampNonNegative(smrCost);
  const pct = clampNonNegative(ndzPct);
  const increase = (base * pct) / 100;
  return { increase, total: base + increase };
}
