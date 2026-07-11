// Объём бетона для фундамента — чистая геометрия, нормативных констант нет.
//
// Справочная плотность тяжёлого бетона ~2400 кг/м³ (ГОСТ 26633: тяжёлые бетоны
// имеют среднюю плотность 2200–2500 кг/м³) — используется только для
// ориентировочной массы, на объём не влияет.

export const CONCRETE_DENSITY_KG_M3 = 2400;

export type FoundationType = 'lenta' | 'plita' | 'svai';

function clampNonNegative(n: number): number {
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** Ленточный фундамент: длина ленты × ширина × высота. */
export function computeLentaVolume(lengthM: number, widthM: number, heightM: number): number {
  return clampNonNegative(lengthM) * clampNonNegative(widthM) * clampNonNegative(heightM);
}

/** Плитный фундамент: длина × ширина × толщина. */
export function computePlitaVolume(aM: number, bM: number, thicknessM: number): number {
  return clampNonNegative(aM) * clampNonNegative(bM) * clampNonNegative(thicknessM);
}

/** Свайный/столбчатый: n × π(d/2)² × глубина. */
export function computeSvaiVolume(diameterM: number, depthM: number, count: number): number {
  const r = clampNonNegative(diameterM) / 2;
  return clampNonNegative(count) * Math.PI * r * r * clampNonNegative(depthM);
}

export interface BetonResult {
  /** Расчётный объём, м³ */
  volume: number;
  /** Объём с запасом на потери, м³ */
  volumeWithReserve: number;
  /** Ориентировочная масса с запасом, кг */
  weightKg: number;
}

/** Итог с запасом на потери при доставке и укладке (обычно 2%). */
export function withReserve(volume: number, reservePct: number): BetonResult {
  const v = clampNonNegative(volume);
  const withRes = v * (1 + clampNonNegative(reservePct) / 100);
  return {
    volume: v,
    volumeWithReserve: withRes,
    weightKg: withRes * CONCRETE_DENSITY_KG_M3,
  };
}
