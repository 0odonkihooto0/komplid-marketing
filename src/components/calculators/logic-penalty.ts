// Расчёт неустойки (пени) — общее ядро калькуляторов «Неустойка по договору
// подряда» и «Компенсация за просрочку сдачи объекта».
//
// Источники формул:
// - ч. 5, ч. 7 ст. 34 Федерального закона №44-ФЗ: пени в размере 1/300 ключевой
//   ставки ЦБ РФ от неисполненного обязательства за каждый день просрочки;
// - ст. 330, 395 ГК РФ: неустойка и проценты за пользование чужими средствами;
// - ч. 2 ст. 6 Федерального закона №214-ФЗ: неустойка застройщика 1/300 ставки
//   рефинансирования (= ключевой ставки), участнику-гражданину — в двойном размере.
//
// Ключевая ставка ЦБ НЕ зашита в код (меняется несколько раз в год, blindspot B-4
// плана 00-STRATEGY) — пользователь вводит её вручную, на странице ссылка на cbr.ru.

export type PenaltyFraction = 300 | 150 | 130;

export interface PenaltyResult {
  /** Пени за один день просрочки, ₽ */
  perDay: number;
  /** Итоговая сумма пени за весь период, ₽ */
  total: number;
  /** Доля пени от базы, % (0 при нулевой базе) */
  percentOfBase: number;
}

/** Отрицательные значения из URL/ввода не должны давать отрицательную неустойку. */
function clampNonNegative(n: number): number {
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/**
 * Пени по доле ключевой ставки ЦБ:
 * база × (ставка% / 100 / fraction) × дни × multiplier.
 * multiplier = 2 — двойной размер для дольщика-физлица по ч. 2 ст. 6 214-ФЗ.
 */
export function computeKeyRatePenalty(
  base: number,
  keyRatePct: number,
  fraction: PenaltyFraction,
  days: number,
  multiplier = 1,
): PenaltyResult {
  const b = clampNonNegative(base);
  const rate = clampNonNegative(keyRatePct);
  const d = clampNonNegative(days);
  const perDay = (b * (rate / 100 / fraction)) * multiplier;
  const total = perDay * d;
  return { perDay, total, percentOfBase: b > 0 ? (total / b) * 100 : 0 };
}

/** Пени по договорному проценту за день: база × (%/день / 100) × дни. */
export function computeContractPenalty(
  base: number,
  pctPerDay: number,
  days: number,
): PenaltyResult {
  const b = clampNonNegative(base);
  const pct = clampNonNegative(pctPerDay);
  const d = clampNonNegative(days);
  const perDay = b * (pct / 100);
  const total = perDay * d;
  return { perDay, total, percentOfBase: b > 0 ? (total / b) * 100 : 0 };
}
