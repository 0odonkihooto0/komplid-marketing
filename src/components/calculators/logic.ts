import { eachDayOfInterval, isWeekend, format } from 'date-fns';

// Чистая расчётная логика калькуляторов — без React и DOM, чтобы покрыть
// тестами математику отдельно от рендера (CLAUDE.md §10: разделение UI и логики).

export type VatRate = 20 | 10 | 0;

// ─── Аванс подрядчику ───────────────────────────────────────────────────────

export interface AvansResult {
  advanceAmount: number;
  remaining: number;
  vatAmount: number;
  totalWithVat: number;
  advanceWithVat: number;
}

/** Ограничивает процент диапазоном [0, 100]. */
export function clampPercent(pct: number): number {
  return Math.min(100, Math.max(0, pct));
}

/** Расчёт аванса по контракту. advancePct ограничивается [0, 100]. */
export function computeAvans(amount: number, advancePct: number, vatRate: VatRate): AvansResult {
  const pct = clampPercent(advancePct);
  const advanceAmount = (amount * pct) / 100;
  const vatAmount = (amount * vatRate) / 100;
  return {
    advanceAmount,
    remaining: amount - advanceAmount,
    vatAmount,
    totalWithVat: amount + vatAmount,
    advanceWithVat: advanceAmount * (1 + vatRate / 100),
  };
}

// ─── КС-2: НДС с суммы акта ──────────────────────────────────────────────────

export interface Ks2Result {
  vatAmount: number;
  totalInclVat: number;
}

export function computeKs2(amount: number, vatRate: VatRate): Ks2Result {
  const vatAmount = (amount * vatRate) / 100;
  return { vatAmount, totalInclVat: amount + vatAmount };
}

// ─── Рабочие дни ──────────────────────────────────────────────────────────────

// Производственный календарь РФ 2026 — федеральные нерабочие праздничные дни.
// Set для O(1) проверки членства в циклах по датам.
export const HOLIDAYS_2026 = new Set<string>([
  '2026-01-01', '2026-01-02', '2026-01-05', '2026-01-06', '2026-01-07',
  '2026-01-08', '2026-01-09',  // Новый год + Рождество (с переносами)
  '2026-02-23',                // День защитника Отечества
  '2026-03-09',                // 8 марта (перенос с воскресенья)
  '2026-05-01', '2026-05-04',  // Праздник Весны и Труда + перенос
  '2026-05-11',                // День Победы + перенос
  '2026-06-12',                // День России
  '2026-11-04',                // День народного единства
]);

/** Рабочий ли день: не выходной и не федеральный праздник РФ 2026. */
export function isWorkingDay(d: Date): boolean {
  return !isWeekend(d) && !HOLIDAYS_2026.has(format(d, 'yyyy-MM-dd'));
}

/** Число рабочих дней в интервале [start, end] включительно. */
export function countWorkingDays(start: Date, end: Date): number {
  return eachDayOfInterval({ start, end }).filter(isWorkingDay).length;
}

/**
 * Дата N-го рабочего дня в интервале [start, end] включительно
 * или null, если рабочих дней меньше N.
 */
export function nthWorkingDay(start: Date, end: Date, n: number): Date | null {
  let count = 0;
  for (const d of eachDayOfInterval({ start, end })) {
    if (isWorkingDay(d)) {
      count++;
      if (count === n) return d;
    }
  }
  return null;
}
