import { describe, it, expect } from 'vitest';
import { WIND_PRESSURE_W0_KPA, kCoefficient, computeWindLoad } from './logic-veter';

// Контрольные значения — СП 20.13330.2016 таблицы 11.1, 11.2, 11.3.

describe('WIND_PRESSURE_W0_KPA (табл. 11.1)', () => {
  it('крайние районы: Ia=0,17; VII=0,85 кПа; II=0,30', () => {
    expect(WIND_PRESSURE_W0_KPA.Ia).toBe(0.17);
    expect(WIND_PRESSURE_W0_KPA.II).toBe(0.3);
    expect(WIND_PRESSURE_W0_KPA.VII).toBe(0.85);
  });
});

describe('kCoefficient — формула (11.4) против контрольных точек таблицы 11.2', () => {
  it('тип A: k(10)=1,0; k(40)≈1,5; k(100)≈2,0', () => {
    expect(kCoefficient(10, 'A')).toBeCloseTo(1.0, 6);
    expect(kCoefficient(40, 'A')).toBeCloseTo(1.5, 1); // табл: 1,5 (формула 1,516)
    expect(kCoefficient(100, 'A')).toBeCloseTo(2.0, 1); // табл: 2,0 (формула 1,995)
  });

  it('тип B: k(20)≈0,85; тип C: k(40)=0,8 (точное совпадение)', () => {
    expect(kCoefficient(20, 'B')).toBeCloseTo(0.85, 1); // табл: 0,85 (формула 0,858)
    expect(kCoefficient(40, 'C')).toBeCloseTo(0.8, 6); // 0,4·4^0,5 = 0,8
  });

  it('высота ограничивается диапазоном 5…300 м', () => {
    expect(kCoefficient(2, 'A')).toBeCloseTo(kCoefficient(5, 'A'), 6);
    expect(kCoefficient(500, 'A')).toBeCloseTo(kCoefficient(300, 'A'), 6);
  });
});

describe('computeWindLoad', () => {
  it('II район, ze=10 м, местность A, c=0,8, γf=1,4: wm=0,24 кПа, расчётная 0,336', () => {
    const r = computeWindLoad('II', 10, 'A', 0.8, 1.4);
    expect(r.k).toBeCloseTo(1.0, 6);
    expect(r.normativeKpa).toBeCloseTo(0.24, 6);
    expect(r.normativeKgfM2).toBeCloseTo(24.47, 1);
    expect(r.designKpa).toBeCloseTo(0.336, 6);
  });

  it('местность C снижает нагрузку против A на той же высоте', () => {
    const a = computeWindLoad('II', 10, 'A', 0.8, 1.4);
    const c = computeWindLoad('II', 10, 'C', 0.8, 1.4);
    expect(c.normativeKpa).toBeLessThan(a.normativeKpa);
  });
});
