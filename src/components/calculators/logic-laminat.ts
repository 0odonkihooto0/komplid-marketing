// Ламинат/паркетная доска — упаковки с учётом подрезки. Чистая геометрия.
//
// Типовые запасы на подрезку: прямая укладка ~5%, диагональная ~10%
// (общепринятая практика укладчиков; значение редактируется).

export type LaminatLayout = 'straight' | 'diagonal';

export const LAYOUT_RESERVE_PCT: Record<LaminatLayout, number> = {
  straight: 5,
  diagonal: 10,
};

function clampNonNegative(n: number): number {
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export interface LaminatResult {
  /** Площадь к закупке с запасом, м² */
  areaWithReserve: number;
  /** Упаковок, шт (целое, вверх) */
  packs: number;
}

export function computeLaminat(
  areaM2: number,
  packAreaM2: number,
  reservePct: number,
): LaminatResult {
  const area = clampNonNegative(areaM2);
  const pack = clampNonNegative(packAreaM2);
  const areaWithReserve = area * (1 + clampNonNegative(reservePct) / 100);
  return {
    areaWithReserve,
    packs: pack > 0 ? Math.ceil(areaWithReserve / pack) : 0,
  };
}
