// Краска: литры и банки по площади и расходу. Чистая арифметика.
//
// Расход на слой — данные производителя (обычно указывается укрывистость
// 8–12 м²/л, т.е. расход 0,08–0,12 л/м²). Дефолт редактируемый — точное
// значение с банки конкретной краски (blindspot B-4).

function clampNonNegative(n: number): number {
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export interface KraskaResult {
  /** На один слой, л */
  litersPerCoat: number;
  /** Всего, л */
  litersTotal: number;
  /** Банок к покупке, шт */
  cans: number;
}

export function computeKraska(
  areaM2: number,
  ratePerM2L: number,
  coats: number,
  canVolumeL: number,
): KraskaResult {
  const litersPerCoat = clampNonNegative(areaM2) * clampNonNegative(ratePerM2L);
  const litersTotal = litersPerCoat * clampNonNegative(coats);
  const can = clampNonNegative(canVolumeL);
  return {
    litersPerCoat,
    litersTotal,
    cans: can > 0 ? Math.ceil(litersTotal / can) : 0,
  };
}
