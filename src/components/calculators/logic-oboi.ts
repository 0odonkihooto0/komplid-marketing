// Обои: рулоны на комнату с учётом раппорта. Чистая геометрия.
//
// Классический метод подсчёта: высота полосы округляется вверх до целого
// числа раппортов (шаг подгонки рисунка), из рулона выходит целое число
// полос, полосы считаются по периметру и ширине рулона.

function clampNonNegative(n: number): number {
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export interface OboiResult {
  /** Высота полосы с подгонкой раппорта, м */
  stripHeightM: number;
  /** Полос из одного рулона, шт */
  stripsPerRoll: number;
  /** Полос нужно всего, шт */
  stripsNeeded: number;
  /** Рулонов к покупке, шт */
  rolls: number;
}

export function computeOboi(
  perimeterM: number,
  wallHeightM: number,
  rollWidthM: number,
  rollLengthM: number,
  rapportM: number,
  openingsWidthM: number,
): OboiResult {
  const height = clampNonNegative(wallHeightM);
  const rollW = clampNonNegative(rollWidthM);
  const rollL = clampNonNegative(rollLengthM);
  const rapport = clampNonNegative(rapportM);
  // Проёмы (двери, окна во всю высоту полосы) уменьшают оклеиваемый периметр
  const perimeter = Math.max(0, clampNonNegative(perimeterM) - clampNonNegative(openingsWidthM));

  const stripHeightM = rapport > 0 ? Math.ceil(height / rapport) * rapport : height;
  const stripsPerRoll = stripHeightM > 0 ? Math.floor(rollL / stripHeightM) : 0;
  const stripsNeeded = rollW > 0 ? Math.ceil(perimeter / rollW) : 0;
  return {
    stripHeightM,
    stripsPerRoll,
    stripsNeeded,
    rolls: stripsPerRoll > 0 && stripsNeeded > 0 ? Math.ceil(stripsNeeded / stripsPerRoll) : 0,
  };
}
