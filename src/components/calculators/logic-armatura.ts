// Масса и метраж арматуры по диаметру.
//
// Источник: сортамент арматурного проката ГОСТ 34028-2016 (ранее ГОСТ 5781-82) —
// теоретическая масса 1 м стержня. Табличные значения совпадают с формулой
// m = π·d²/4 × 7850 кг/м³ = 0.006165·d² (d в мм) — тест сверяет таблицу с формулой.

export const REBAR_MASS_PER_METER: Record<number, number> = {
  6: 0.222,
  8: 0.395,
  10: 0.617,
  12: 0.888,
  14: 1.21,
  16: 1.58,
  18: 2.0,
  20: 2.47,
  22: 2.98,
  25: 3.85,
  28: 4.83,
  32: 6.31,
  36: 7.99,
  40: 9.87,
};

export const REBAR_DIAMETERS = Object.keys(REBAR_MASS_PER_METER).map(Number);

/** Стандартная длина стержня арматуры при поставке, м (мерная длина 11,7 м). */
export const DEFAULT_BAR_LENGTH_M = 11.7;

function clampNonNegative(n: number): number {
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export interface RebarResult {
  /** Теоретическая масса 1 м, кг */
  massPerMeter: number;
  /** Общая масса, кг */
  totalMassKg: number;
  /** Общая длина, м */
  totalLengthM: number;
  /** Число целых стержней, шт */
  bars: number;
}

/** Метраж → масса и число стержней. */
export function rebarFromLength(diameter: number, lengthM: number, barLengthM: number): RebarResult {
  const perM = REBAR_MASS_PER_METER[diameter] ?? 0;
  const len = clampNonNegative(lengthM);
  const bar = clampNonNegative(barLengthM);
  return {
    massPerMeter: perM,
    totalLengthM: len,
    totalMassKg: perM * len,
    bars: bar > 0 ? Math.ceil(len / bar) : 0,
  };
}

/** Масса → метраж и число стержней. */
export function rebarFromMass(diameter: number, massKg: number, barLengthM: number): RebarResult {
  const perM = REBAR_MASS_PER_METER[diameter] ?? 0;
  const mass = clampNonNegative(massKg);
  const bar = clampNonNegative(barLengthM);
  const len = perM > 0 ? mass / perM : 0;
  return {
    massPerMeter: perM,
    totalLengthM: len,
    totalMassKg: mass,
    bars: bar > 0 ? Math.ceil(len / bar) : 0,
  };
}
