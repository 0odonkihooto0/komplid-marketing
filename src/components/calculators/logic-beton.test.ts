import { describe, it, expect } from 'vitest';
import {
  computeLentaVolume,
  computePlitaVolume,
  computeSvaiVolume,
  withReserve,
} from './logic-beton';

// Контрольные значения пересчитаны вручную (чистая геометрия).

describe('computeLentaVolume', () => {
  it('лента 30 м × 0,4 м × 0,9 м = 10,8 м³', () => {
    expect(computeLentaVolume(30, 0.4, 0.9)).toBeCloseTo(10.8, 6);
  });

  it('отрицательные входы приводятся к нулю', () => {
    expect(computeLentaVolume(-30, 0.4, 0.9)).toBe(0);
  });
});

describe('computePlitaVolume', () => {
  it('плита 10 × 8 м толщиной 0,3 м = 24 м³', () => {
    expect(computePlitaVolume(10, 8, 0.3)).toBeCloseTo(24, 6);
  });
});

describe('computeSvaiVolume', () => {
  it('20 свай Ø0,3 м глубиной 2 м = 20·π·0,15²·2 ≈ 2,827 м³', () => {
    expect(computeSvaiVolume(0.3, 2, 20)).toBeCloseTo(2.827, 3);
  });

  it('ноль свай — нулевой объём', () => {
    expect(computeSvaiVolume(0.3, 2, 0)).toBe(0);
  });
});

describe('withReserve', () => {
  it('10,8 м³ с запасом 2% = 11,016 м³; масса ≈ 26 438 кг', () => {
    const r = withReserve(10.8, 2);
    expect(r.volumeWithReserve).toBeCloseTo(11.016, 6);
    expect(r.weightKg).toBeCloseTo(11.016 * 2400, 3);
  });

  it('нулевой запас не меняет объём', () => {
    expect(withReserve(24, 0).volumeWithReserve).toBe(24);
  });
});
