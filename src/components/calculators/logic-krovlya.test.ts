import { describe, it, expect } from 'vitest';
import { computeGableRoof } from './logic-krovlya';

// Контрольные значения пересчитаны вручную: скат = (b/2)/cos α + свес.

describe('computeGableRoof', () => {
  it('дом 10×8, уклон 30°, свесы 0,5: скат 5,12 м, конёк 2,31 м, площадь ≈112,6 м²', () => {
    const r = computeGableRoof(10, 8, 30, 0.5, 0.5, 0);
    expect(r.slopeLengthM).toBeCloseTo(4 / Math.cos(Math.PI / 6) + 0.5, 3); // 5,119
    expect(r.ridgeHeightM).toBeCloseTo(4 * Math.tan(Math.PI / 6), 3); // 2,309
    expect(r.roofAreaM2).toBeCloseTo(2 * 5.1188 * 11, 1); // ≈112,6
  });

  it('запас 10% увеличивает площадь к закупке', () => {
    const r = computeGableRoof(10, 8, 30, 0.5, 0.5, 10);
    expect(r.areaWithReserveM2).toBeCloseTo(r.roofAreaM2 * 1.1, 6);
  });

  it('нулевой уклон — плоская кровля: скат = полширины + свес', () => {
    const r = computeGableRoof(10, 8, 0, 0.5, 0, 0);
    expect(r.slopeLengthM).toBeCloseTo(4.5, 6);
    expect(r.ridgeHeightM).toBe(0);
  });

  it('угол ограничивается 89° — нет деления на ноль при 90°', () => {
    const r = computeGableRoof(10, 8, 90, 0, 0, 0);
    expect(Number.isFinite(r.slopeLengthM)).toBe(true);
  });
});
