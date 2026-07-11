import { describe, it, expect } from 'vitest';
import { computeLaminat, LAYOUT_RESERVE_PCT } from './logic-laminat';

// Контрольные значения пересчитаны вручную: упаковки = ceil(S·(1+запас)/м² в уп.).

describe('computeLaminat', () => {
  it('18 м², упаковка 2,13 м², прямая укладка 5%: 18,9 м² → 9 упаковок', () => {
    const r = computeLaminat(18, 2.13, LAYOUT_RESERVE_PCT.straight);
    expect(r.areaWithReserve).toBeCloseTo(18.9, 6);
    expect(r.packs).toBe(9);
  });

  it('та же комната по диагонали (10%): 19,8 м² → 10 упаковок', () => {
    const r = computeLaminat(18, 2.13, LAYOUT_RESERVE_PCT.diagonal);
    expect(r.areaWithReserve).toBeCloseTo(19.8, 6);
    expect(r.packs).toBe(10);
  });

  it('нулевая площадь упаковки не даёт деления на ноль', () => {
    expect(computeLaminat(18, 0, 5).packs).toBe(0);
  });
});
