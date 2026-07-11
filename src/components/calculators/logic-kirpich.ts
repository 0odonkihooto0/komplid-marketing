// Кирпич и раствор на стену — геометрический расчёт из размеров кирпича.
//
// Размеры кирпича — ГОСТ 530-2012 «Кирпич и камень керамические»:
// одинарный 1НФ 250×120×65, утолщённый (полуторный) 1,4НФ 250×120×88,
// двойной камень 2,1НФ 250×120×138. Шов кладки — 10 мм (растворный шов
// по СП 15.13330). Количество на 1 м² и объём раствора выводятся из
// геометрии, а не из зашитой таблицы — результат совпадает со
// справочными значениями (одинарный в полкирпича — 51 шт/м²).

export type BrickFormat = '1nf' | '1.4nf' | '2.1nf';

export const BRICK_SIZES: Record<BrickFormat, { l: number; w: number; h: number; label: string }> = {
  '1nf': { l: 0.25, w: 0.12, h: 0.065, label: 'Одинарный 1НФ (250×120×65)' },
  '1.4nf': { l: 0.25, w: 0.12, h: 0.088, label: 'Полуторный 1,4НФ (250×120×88)' },
  '2.1nf': { l: 0.25, w: 0.12, h: 0.138, label: 'Двойной 2,1НФ (250×120×138)' },
};

// Толщина кладки «в кирпичах» → толщина стены в метрах (с продольными швами 10 мм).
export type WallThickness = '0.5' | '1' | '1.5' | '2';

export const WALL_THICKNESS_M: Record<WallThickness, number> = {
  '0.5': 0.12,
  '1': 0.25,
  '1.5': 0.38,
  '2': 0.51,
};

/** Растворный шов кладки, м (10 мм). */
export const JOINT_M = 0.01;

function clampNonNegative(n: number): number {
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/**
 * Кирпичей на 1 м² кладки: на фасаде один кирпич со швом занимает
 * (0,25 + шов) × (h + шов); число «слоёв» в глубину = толщина × 2.
 */
export function bricksPerSquareMeter(format: BrickFormat, thickness: WallThickness): number {
  const { h } = BRICK_SIZES[format];
  const faceArea = (0.25 + JOINT_M) * (h + JOINT_M);
  const layers = Number(thickness) * 2;
  return layers / faceArea;
}

export interface BrickWallResult {
  /** Кирпичей без запаса, шт */
  bricksNet: number;
  /** Кирпичей к заказу с запасом на бой, шт (целое, вверх) */
  bricksWithReserve: number;
  /** Кирпичей на 1 м² кладки, шт */
  perSquareMeter: number;
  /** Объём кладки, м³ */
  masonryVolumeM3: number;
  /** Объём раствора = кладка − кирпичи, м³ */
  mortarM3: number;
}

export function computeBrickWall(
  areaM2: number,
  format: BrickFormat,
  thickness: WallThickness,
  reservePct: number,
): BrickWallResult {
  const area = clampNonNegative(areaM2);
  const perM2 = bricksPerSquareMeter(format, thickness);
  const bricksNet = area * perM2;
  const { l, w, h } = BRICK_SIZES[format];
  const masonryVolumeM3 = area * WALL_THICKNESS_M[thickness];
  const bricksVolume = bricksNet * l * w * h;
  return {
    bricksNet,
    bricksWithReserve: Math.ceil(bricksNet * (1 + clampNonNegative(reservePct) / 100)),
    perSquareMeter: perM2,
    masonryVolumeM3,
    mortarM3: Math.max(0, masonryVolumeM3 - bricksVolume),
  };
}
