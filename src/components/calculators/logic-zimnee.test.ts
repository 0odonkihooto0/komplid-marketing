import { describe, it, expect } from 'vitest';
import { computeWinterIncrease } from './logic-zimnee';

// Контрольные значения пересчитаны вручную: удорожание = СМР × НДЗ / 100.

describe('computeWinterIncrease', () => {
  it('СМР 10 000 000 ₽ при НДЗ 1,8% — удорожание 180 000 ₽', () => {
    const r = computeWinterIncrease(10_000_000, 1.8);
    expect(r.increase).toBeCloseTo(180_000, 6);
    expect(r.total).toBeCloseTo(10_180_000, 6);
  });

  it('НДЗ 0% — удорожания нет', () => {
    const r = computeWinterIncrease(10_000_000, 0);
    expect(r.increase).toBe(0);
    expect(r.total).toBe(10_000_000);
  });

  it('дробный норматив: 2 500 000 × 3,25% = 81 250', () => {
    const r = computeWinterIncrease(2_500_000, 3.25);
    expect(r.increase).toBeCloseTo(81_250, 6);
  });

  it('отрицательные и нечисловые входы приводятся к нулю', () => {
    expect(computeWinterIncrease(-1, 1.8).increase).toBe(0);
    expect(computeWinterIncrease(10_000_000, -2).increase).toBe(0);
    expect(computeWinterIncrease(NaN, 1.8).total).toBe(0);
  });
});
