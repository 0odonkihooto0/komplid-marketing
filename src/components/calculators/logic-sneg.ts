// Снеговая нагрузка на покрытие — упрощённый расчёт по СП 20.13330.2016 разд. 10.
//
// S0 = ce · ct · μ · Sg (формула 10.1, нормативное значение);
// расчётное значение = γf · S0, γf = 1,4 (п. 10.12).
//
// Константы транскрибированы вручную из текста СП 20.13330.2016
// (локальный корпус нормативных документов):
// - таблица 10.1 — вес снегового покрова Sg по снеговым районам I–VIII;
// - приложение Б, таблица Б.1 — коэффициент μ для одно- и двускатных
//   покрытий: μ = 1 при α ≤ 30°, μ = 0 при α ≥ 60°, между — линейная
//   интерполяция.
// Снеговой район принимается по карте 1 приложения Е СП 20.

export type SnowRegion = 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI' | 'VII' | 'VIII';

// Источник: СП 20.13330.2016, таблица 10.1, кПа
export const SNOW_LOAD_SG_KPA: Record<SnowRegion, number> = {
  I: 0.5,
  II: 1.0,
  III: 1.5,
  IV: 2.0,
  V: 2.5,
  VI: 3.0,
  VII: 3.5,
  VIII: 4.0,
};

export const SNOW_REGIONS = Object.keys(SNOW_LOAD_SG_KPA) as SnowRegion[];

/** Коэффициент надёжности по снеговой нагрузке (СП 20 п. 10.12). */
export const SNOW_GAMMA_F = 1.4;

/** 1 кПа ≈ 101,97 кгс/м² — для вывода нагрузки в привычных кг/м². */
export const KPA_TO_KGF_M2 = 101.97;

function clampNonNegative(n: number): number {
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** μ для одно-/двускатных покрытий (СП 20, прил. Б, табл. Б.1). */
export function muForGableRoof(angleDeg: number): number {
  const a = clampNonNegative(angleDeg);
  if (a <= 30) return 1;
  if (a >= 60) return 0;
  return (60 - a) / 30;
}

export interface SnowLoadResult {
  sgKpa: number;
  mu: number;
  /** Нормативное значение S0, кПа и кгс/м² */
  normativeKpa: number;
  normativeKgfM2: number;
  /** Расчётное значение γf·S0 */
  designKpa: number;
  designKgfM2: number;
}

export function computeSnowLoad(
  region: SnowRegion,
  roofAngleDeg: number,
  ce: number,
  ct: number,
): SnowLoadResult {
  const sgKpa = SNOW_LOAD_SG_KPA[region];
  const mu = muForGableRoof(roofAngleDeg);
  const normativeKpa = clampNonNegative(ce) * clampNonNegative(ct) * mu * sgKpa;
  const designKpa = normativeKpa * SNOW_GAMMA_F;
  return {
    sgKpa,
    mu,
    normativeKpa,
    normativeKgfM2: normativeKpa * KPA_TO_KGF_M2,
    designKpa,
    designKgfM2: designKpa * KPA_TO_KGF_M2,
  };
}
