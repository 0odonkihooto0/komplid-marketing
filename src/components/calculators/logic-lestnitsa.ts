// Лестница: подбор шага ступеней с проверкой норм.
//
// Нормативные пределы транскрибированы вручную из СП 118.13330.2022
// (локальный корпус нормативных документов):
// - п. 5.7: проступь 0,3 м (допускается 0,28–0,35), подступёнок 0,15 м
//   (допускается 0,13–0,17); в пределах марша параметры ступеней одинаковые;
// - п. 5.8: уклон маршей для посетителей — 1:2; для лестниц в подвал,
//   на чердак и служебных — не более 1:1,5; для второй лестницы в зданиях
//   с лифтами — не более 1:1.
// Формула удобства 2h + b = 600–640 мм (правило Блонделя) — эргономическая
// рекомендация (средний шаг человека), нормативом не является.

export const TREAD_MIN_M = 0.28;
export const TREAD_MAX_M = 0.35;
export const RISER_MIN_M = 0.13;
export const RISER_MAX_M = 0.17;

export const BLONDEL_MIN_MM = 600;
export const BLONDEL_MAX_MM = 640;

export type StairType = 'public' | 'service' | 'secondary';

// Предельный уклон (подступёнок/проступь) по п. 5.8 СП 118.13330.2022
export const STAIR_MAX_SLOPE: Record<StairType, { maxSlope: number; label: string }> = {
  public: { maxSlope: 1 / 2, label: 'Для посетителей (надземные этажи) — уклон 1:2' },
  service: { maxSlope: 1 / 1.5, label: 'В подвал, на чердак, служебная — до 1:1,5' },
  secondary: { maxSlope: 1, label: 'Вторая лестница в здании с лифтами — до 1:1' },
};

function clampNonNegative(n: number): number {
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export interface StairResult {
  /** Число подступёнков (подъёмов) */
  steps: number;
  /** Фактическая высота подступёнка, м */
  riserM: number;
  /** Уклон марша (подступёнок / проступь) */
  slope: number;
  /** Формула удобства 2h + b, мм */
  blondelMm: number;
  /** Длина марша в плане, м: (n − 1) проступей */
  runM: number;
  /** Замечания о несоответствии (пустой массив — соответствует) */
  violations: string[];
  /** Рекомендации по эргономике (не нарушения) */
  warnings: string[];
}

export function computeStair(
  floorHeightM: number,
  treadM: number,
  desiredRiserM: number,
  stairType: StairType,
): StairResult {
  const height = clampNonNegative(floorHeightM);
  const tread = clampNonNegative(treadM);
  const desired = clampNonNegative(desiredRiserM);

  const steps = height > 0 && desired > 0 ? Math.max(1, Math.round(height / desired)) : 0;
  const riserM = steps > 0 ? height / steps : 0;
  const slope = tread > 0 ? riserM / tread : 0;
  const blondelMm = (2 * riserM + tread) * 1000;

  const violations: string[] = [];
  if (riserM > 0 && (riserM < RISER_MIN_M || riserM > RISER_MAX_M)) {
    violations.push(
      `Подступёнок ${(riserM * 1000).toFixed(0)} мм вне допуска 130–170 мм (п. 5.7 СП 118.13330) — измените число ступеней.`,
    );
  }
  if (tread > 0 && (tread < TREAD_MIN_M || tread > TREAD_MAX_M)) {
    violations.push(
      `Проступь ${(tread * 1000).toFixed(0)} мм вне допуска 280–350 мм (п. 5.7 СП 118.13330).`,
    );
  }
  const limit = STAIR_MAX_SLOPE[stairType].maxSlope;
  if (slope > limit + 1e-9) {
    violations.push(
      `Уклон 1:${(1 / slope).toFixed(2)} круче предельного 1:${(1 / limit).toFixed(1)} для выбранного типа лестницы (п. 5.8 СП 118.13330).`,
    );
  }

  const warnings: string[] = [];
  if (steps > 0 && (blondelMm < BLONDEL_MIN_MM || blondelMm > BLONDEL_MAX_MM)) {
    warnings.push(
      `Формула удобства 2h + b = ${blondelMm.toFixed(0)} мм вне комфортного диапазона 600–640 мм — шаг будет неудобным.`,
    );
  }

  return {
    steps,
    riserM,
    slope,
    blondelMm,
    runM: steps > 1 ? (steps - 1) * tread : 0,
    violations,
    warnings,
  };
}
