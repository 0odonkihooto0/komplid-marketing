// Расход штукатурки по площади и толщине слоя.
//
// Норма расхода на 10 мм слоя — данные производителей (ориентировочно:
// гипсовые смеси 8,5–10 кг/м², цементные 14–18 кг/м² на 10 мм). Значения
// НЕ зашиты жёстко — редактируемые дефолты, пользователь уточняет по ТДС
// своей смеси (blindspot B-4: не выдаём чужие данные за норматив).

export const PLASTER_PRESETS = {
  gypsum: { rate10mm: 8.5, label: 'Гипсовая (~8,5 кг/м² на 10 мм)' },
  cement: { rate10mm: 17, label: 'Цементная (~17 кг/м² на 10 мм)' },
} as const;

export type PlasterType = keyof typeof PLASTER_PRESETS;

function clampNonNegative(n: number): number {
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export interface PlasterResult {
  /** Расход на 1 м² при заданной толщине, кг */
  kgPerM2: number;
  /** Всего смеси, кг */
  totalKg: number;
  /** Мешков к покупке, шт (целое, вверх) */
  bags: number;
}

/** Всего = площадь × (толщина/10) × расход на 10 мм; мешки — вверх до целого. */
export function computePlaster(
  areaM2: number,
  thicknessMm: number,
  ratePer10mm: number,
  bagKg: number,
): PlasterResult {
  const area = clampNonNegative(areaM2);
  const t = clampNonNegative(thicknessMm);
  const rate = clampNonNegative(ratePer10mm);
  const bag = clampNonNegative(bagKg);
  const kgPerM2 = (t / 10) * rate;
  const totalKg = area * kgPerM2;
  return {
    kgPerM2,
    totalKg,
    bags: bag > 0 ? Math.ceil(totalKg / bag) : 0,
  };
}
