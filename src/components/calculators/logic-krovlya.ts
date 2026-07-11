// Двускатная кровля: площадь скатов, длина стропил, высота конька.
// Чистая тригонометрия, нормативных констант нет.

function clampNonNegative(n: number): number {
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export interface GableRoofResult {
  /** Длина ската (она же длина стропила со свесом), м */
  slopeLengthM: number;
  /** Высота конька над мауэрлатом, м */
  ridgeHeightM: number;
  /** Площадь кровли (два ската), м² */
  roofAreaM2: number;
  /** Площадь с запасом на нахлёсты и подрезку, м² */
  areaWithReserveM2: number;
}

/**
 * a — длина дома (вдоль конька), b — ширина (поперёк), angleDeg — уклон,
 * eaveOverhang — карнизный свес (добавка к скату), gableOverhang — фронтонный
 * свес (добавка к длине с каждой стороны), reservePct — запас на нахлёст.
 */
export function computeGableRoof(
  houseLengthM: number,
  houseWidthM: number,
  angleDeg: number,
  eaveOverhangM: number,
  gableOverhangM: number,
  reservePct: number,
): GableRoofResult {
  const a = clampNonNegative(houseLengthM);
  const b = clampNonNegative(houseWidthM);
  // Углы вне (0°, 90°) не имеют геометрического смысла для ската
  const angle = Math.min(89, Math.max(0, clampNonNegative(angleDeg)));
  const rad = (angle * Math.PI) / 180;

  const halfWidth = b / 2;
  const slopeLengthM = halfWidth / Math.cos(rad) + clampNonNegative(eaveOverhangM);
  const ridgeHeightM = halfWidth * Math.tan(rad);
  const roofLength = a + 2 * clampNonNegative(gableOverhangM);
  const roofAreaM2 = 2 * slopeLengthM * roofLength;
  return {
    slopeLengthM,
    ridgeHeightM,
    roofAreaM2,
    areaWithReserveM2: roofAreaM2 * (1 + clampNonNegative(reservePct) / 100),
  };
}
