// Пандус для МГН — проверка уклона и длины маршей по СП 59.13330.2020.
//
// Константы транскрибированы вручную из текста СП 59.13330.2020
// (локальный корпус нормативных документов):
// - п. 5.1.14: пандусы применяются при перепаде высот от 0,014 до 6,0 м
//   (свыше 3,0 м возможны подъёмные платформы/лифты, свыше 6,0 м — лифты);
// - таблица 5.1: предельная длина одного марша и суммарная длина наклонных
//   поверхностей в зависимости от продольного уклона;
// - примечание 1 к табл. 5.1: уклон более 80 ‰ (1:12,5) не допускается.

export interface PandusMarchLimit {
  /** Верхняя граница диапазона уклона, ‰ */
  maxSlopePpm: number;
  /** Длина одного марша, м, не более */
  maxMarchM: number;
  /** Суммарная длина наклонных поверхностей, м, не более */
  maxTotalM: number;
}

// Источник: СП 59.13330.2020, таблица 5.1
export const PANDUS_MARCH_LIMITS: PandusMarchLimit[] = [
  { maxSlopePpm: 40, maxMarchM: 15, maxTotalM: 110 },
  { maxSlopePpm: 50, maxMarchM: 12, maxTotalM: 110 },
  { maxSlopePpm: 60, maxMarchM: 9, maxTotalM: 110 },
  { maxSlopePpm: 80, maxMarchM: 6, maxTotalM: 36 },
];

/** Максимальный допустимый уклон марша пандуса, ‰ (прим. 1 к табл. 5.1). */
export const PANDUS_MAX_SLOPE_PPM = 80;
/** Максимальный перепад высот для пандуса, м (п. 5.1.14). */
export const PANDUS_MAX_HEIGHT_M = 6.0;
/** Минимальный перепад, при котором нужен пандус, м (п. 5.1.14). */
export const PANDUS_MIN_HEIGHT_M = 0.014;

function clampNonNegative(n: number): number {
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export interface PandusResult {
  /** Уклон в виде 1:x */
  slopeRatioX: number;
  /** Требуемая длина наклонных поверхностей, м */
  totalLengthM: number;
  /** Предел длины одного марша для этого уклона, м (null — уклон вне таблицы) */
  maxMarchM: number | null;
  /** Число маршей */
  marches: number;
  /** Число промежуточных площадок (1,5×1,5 м, п. 5.1.16) */
  landings: number;
  /** Замечания о несоответствии СП 59 (пустой массив — соответствует) */
  violations: string[];
}

export function computePandus(heightM: number, slopePpm: number): PandusResult {
  const h = clampNonNegative(heightM);
  const slope = clampNonNegative(slopePpm);
  const totalLengthM = slope > 0 ? h / (slope / 1000) : 0;
  const limit = PANDUS_MARCH_LIMITS.find(l => slope <= l.maxSlopePpm) ?? null;

  const violations: string[] = [];
  if (slope > PANDUS_MAX_SLOPE_PPM) {
    violations.push(
      'Уклон более 80 ‰ (1:12,5) не допускается (прим. 1 к табл. 5.1 СП 59.13330).',
    );
  }
  if (h > PANDUS_MAX_HEIGHT_M) {
    violations.push(
      'Перепад высот более 6,0 м — пандус не применяется, предусмотрите лифт (п. 5.1.14).',
    );
  }
  if (limit && totalLengthM > limit.maxTotalM) {
    violations.push(
      `Суммарная длина наклонных поверхностей ${totalLengthM.toFixed(1)} м превышает предел ${limit.maxTotalM} м для этого уклона (табл. 5.1).`,
    );
  }

  const maxMarchM = limit?.maxMarchM ?? null;
  const marches =
    maxMarchM && totalLengthM > 0 ? Math.ceil(totalLengthM / maxMarchM) : totalLengthM > 0 ? 1 : 0;
  return {
    slopeRatioX: slope > 0 ? 1000 / slope : 0,
    totalLengthM,
    maxMarchM,
    marches,
    landings: Math.max(0, marches - 1),
    violations,
  };
}
