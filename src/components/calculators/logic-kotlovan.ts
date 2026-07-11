// Объём земляных работ: котлован и траншея с откосами. Чистая геометрия.
//
// Котлован с откосами — призматоид (обелиск), объём по точной формуле
// V = H/6 × [(2a + a₁)·b + (2a₁ + a)·b₁], где верхние размеры
// a₁ = a + 2·H·m, b₁ = b + 2·H·m; m — коэффициент заложения откоса
// (горизонтальная проекция на 1 м глубины).
//
// Значение m зависит от грунта и глубины и принимается по правилам охраны
// труда в строительстве (СП 45.13330.2017 п. 6.1.10 отсылает к ним) —
// пользователь вводит m вручную; таблица грунтов в код не зашита (B-4).
// Коэффициент первоначального разрыхления грунта — редактируемый дефолт.

export type ExcavationType = 'pit' | 'trench';

function clampNonNegative(n: number): number {
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export interface ExcavationResult {
  /** Объём выемки в плотном теле, м³ */
  volume: number;
  /** Верхние размеры выемки: a₁×b₁ (котлован) или ширина поверху (траншея), м */
  topA: number;
  topB: number;
  /** Объём к вывозу с разрыхлением, м³ */
  looseVolume: number;
}

/** Котлован: дно a×b, глубина H, заложение откоса m. */
export function computePit(
  aM: number,
  bM: number,
  depthM: number,
  slopeM: number,
  looseFactor: number,
): ExcavationResult {
  const a = clampNonNegative(aM);
  const b = clampNonNegative(bM);
  const h = clampNonNegative(depthM);
  const m = clampNonNegative(slopeM);
  const a1 = a + 2 * h * m;
  const b1 = b + 2 * h * m;
  const volume = (h / 6) * ((2 * a + a1) * b + (2 * a1 + a) * b1);
  return {
    volume,
    topA: a1,
    topB: b1,
    looseVolume: volume * Math.max(1, clampNonNegative(looseFactor)),
  };
}

/** Траншея: ширина по дну b, глубина H, заложение m, длина L. */
export function computeTrench(
  bottomWidthM: number,
  depthM: number,
  slopeM: number,
  lengthM: number,
  looseFactor: number,
): ExcavationResult {
  const b = clampNonNegative(bottomWidthM);
  const h = clampNonNegative(depthM);
  const m = clampNonNegative(slopeM);
  const l = clampNonNegative(lengthM);
  const b1 = b + 2 * h * m;
  const volume = ((b + b1) / 2) * h * l;
  return {
    volume,
    topA: b1,
    topB: l,
    looseVolume: volume * Math.max(1, clampNonNegative(looseFactor)),
  };
}
