// Ветровая нагрузка (средняя составляющая) — упрощённый расчёт по
// СП 20.13330.2016 разд. 11.1: wm = w0 · k(ze) · c (формула 11.2).
//
// Константы транскрибированы вручную из текста СП 20.13330.2016
// (локальный корпус нормативных документов):
// - таблица 11.1 — нормативное ветровое давление w0 по районам Ia–VII;
// - таблица 11.3 — параметры α и k10 типов местности A/B/C для
//   формулы (11.4): k(ze) = k10 · (ze/10)^(2α); тест сверяет формулу
//   с контрольными точками таблицы 11.2.
// Ветровой район принимается по карте 2 приложения Е СП 20.
// Пульсационная составляющая wp (п. 11.1.8) в упрощённом расчёте не учитывается.

export type WindRegion = 'Ia' | 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI' | 'VII';

// Источник: СП 20.13330.2016, таблица 11.1, кПа
export const WIND_PRESSURE_W0_KPA: Record<WindRegion, number> = {
  Ia: 0.17,
  I: 0.23,
  II: 0.3,
  III: 0.38,
  IV: 0.48,
  V: 0.6,
  VI: 0.73,
  VII: 0.85,
};

export const WIND_REGIONS = Object.keys(WIND_PRESSURE_W0_KPA) as WindRegion[];

export type TerrainType = 'A' | 'B' | 'C';

// Источник: СП 20.13330.2016, таблица 11.3
export const TERRAIN: Record<TerrainType, { alpha: number; k10: number; label: string }> = {
  A: { alpha: 0.15, k10: 1.0, label: 'A — открытая местность (степь, побережье, село)' },
  B: { alpha: 0.2, k10: 0.65, label: 'B — города, лес, препятствия выше 10 м' },
  C: { alpha: 0.25, k10: 0.4, label: 'C — плотная застройка зданиями выше 25 м' },
};

export const KPA_TO_KGF_M2 = 101.97;

function clampNonNegative(n: number): number {
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** k(ze) по формуле (11.4); высота ограничена диапазоном таблицы 11.2 (5…300 м). */
export function kCoefficient(zeM: number, terrain: TerrainType): number {
  const { alpha, k10 } = TERRAIN[terrain];
  const ze = Math.min(300, Math.max(5, clampNonNegative(zeM)));
  return k10 * Math.pow(ze / 10, 2 * alpha);
}

export interface WindLoadResult {
  w0Kpa: number;
  k: number;
  /** Нормативная средняя составляющая wm */
  normativeKpa: number;
  normativeKgfM2: number;
  /** Расчётное значение γf·wm */
  designKpa: number;
  designKgfM2: number;
}

export function computeWindLoad(
  region: WindRegion,
  zeM: number,
  terrain: TerrainType,
  aerodynamicC: number,
  gammaF: number,
): WindLoadResult {
  const w0Kpa = WIND_PRESSURE_W0_KPA[region];
  const k = kCoefficient(zeM, terrain);
  const normativeKpa = w0Kpa * k * clampNonNegative(aerodynamicC);
  const designKpa = normativeKpa * clampNonNegative(gammaF);
  return {
    w0Kpa,
    k,
    normativeKpa,
    normativeKgfM2: normativeKpa * KPA_TO_KGF_M2,
    designKpa,
    designKgfM2: designKpa * KPA_TO_KGF_M2,
  };
}
