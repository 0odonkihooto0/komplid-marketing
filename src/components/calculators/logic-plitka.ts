// Плитка, клей и затирка — геометрия + общепринятая формула расхода затирки.
//
// Затирка (методика, используемая производителями затирок, напр. Ceresit):
// расход кг/м² = (A + B) / (A × B) × C × D × ρ, где A и B — стороны плитки (мм),
// C — толщина плитки (мм), D — ширина шва (мм), ρ ≈ 1,6 кг/дм³ — плотность
// затирочной смеси. Расход клея зависит от зубца шпателя — редактируемый
// дефолт, точное значение на упаковке клея (blindspot B-4).

export const GROUT_DENSITY = 1.6;

function clampNonNegative(n: number): number {
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export interface TileResult {
  /** Площадь к закупке с запасом, м² */
  areaWithReserve: number;
  /** Плиток, шт (целое, вверх) */
  tiles: number;
  /** Клей, кг */
  glueKg: number;
  /** Затирка, кг */
  groutKg: number;
}

/** Расход затирки, кг/м² — формула производителей затирочных смесей. */
export function groutPerM2(
  tileWmm: number,
  tileHmm: number,
  tileThicknessMm: number,
  jointMm: number,
): number {
  const w = clampNonNegative(tileWmm);
  const h = clampNonNegative(tileHmm);
  if (w === 0 || h === 0) return 0;
  return ((w + h) / (w * h)) * clampNonNegative(tileThicknessMm) * clampNonNegative(jointMm) * GROUT_DENSITY;
}

export function computeTiles(
  areaM2: number,
  tileWmm: number,
  tileHmm: number,
  tileThicknessMm: number,
  jointMm: number,
  reservePct: number,
  glueRateKgM2: number,
): TileResult {
  const area = clampNonNegative(areaM2);
  const tileAreaM2 = (clampNonNegative(tileWmm) / 1000) * (clampNonNegative(tileHmm) / 1000);
  const areaWithReserve = area * (1 + clampNonNegative(reservePct) / 100);
  return {
    areaWithReserve,
    tiles: tileAreaM2 > 0 ? Math.ceil(areaWithReserve / tileAreaM2) : 0,
    // клей и затирка — по фактически укладываемой площади (без запаса на подрезку)
    glueKg: area * clampNonNegative(glueRateKgM2),
    groutKg: area * groutPerM2(tileWmm, tileHmm, tileThicknessMm, jointMm),
  };
}
