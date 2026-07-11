import { describe, it, expect } from 'vitest';
import {
  REBAR_MASS_PER_METER,
  REBAR_DIAMETERS,
  rebarFromLength,
  rebarFromMass,
} from './logic-armatura';

describe('REBAR_MASS_PER_METER', () => {
  it('табличные значения ГОСТ совпадают с формулой πd²/4·7850 в пределах 0,5%', () => {
    for (const d of REBAR_DIAMETERS) {
      const theoretical = 0.006165 * d * d;
      const table = REBAR_MASS_PER_METER[d] ?? 0;
      expect(table).toBeGreaterThan(0);
      expect(Math.abs(table - theoretical) / theoretical).toBeLessThan(0.005);
    }
  });

  it('контрольные значения сортамента: Ø12 — 0,888 кг/м; Ø16 — 1,58 кг/м', () => {
    expect(REBAR_MASS_PER_METER[12]).toBe(0.888);
    expect(REBAR_MASS_PER_METER[16]).toBe(1.58);
  });
});

describe('rebarFromLength', () => {
  it('500 м Ø12 = 444 кг, 43 стержня по 11,7 м', () => {
    const r = rebarFromLength(12, 500, 11.7);
    expect(r.totalMassKg).toBeCloseTo(444, 6);
    expect(r.bars).toBe(Math.ceil(500 / 11.7)); // 43
    expect(r.bars).toBe(43);
  });

  it('неизвестный диаметр даёт нулевую массу', () => {
    expect(rebarFromLength(13, 100, 11.7).totalMassKg).toBe(0);
  });
});

describe('rebarFromMass', () => {
  it('1 000 кг Ø16 = 632,9 м, 55 стержней', () => {
    const r = rebarFromMass(16, 1000, 11.7);
    expect(r.totalLengthM).toBeCloseTo(1000 / 1.58, 3);
    expect(r.bars).toBe(Math.ceil(1000 / 1.58 / 11.7)); // 55
  });

  it('нулевая длина стержня — стержни не считаются', () => {
    expect(rebarFromMass(16, 1000, 0).bars).toBe(0);
  });
});
