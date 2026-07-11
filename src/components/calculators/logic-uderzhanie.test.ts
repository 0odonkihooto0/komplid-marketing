import { describe, it, expect } from 'vitest';
import { computeRetention } from './logic-uderzhanie';

// Контрольные значения пересчитаны вручную: удержание = акт × %, к выплате = акт − удержание.

describe('computeRetention', () => {
  it('5% с акта 2 000 000 ₽: удержание 100 000, к выплате 1 900 000', () => {
    const r = computeRetention(2_000_000, 5);
    expect(r.retentionFromAct).toBeCloseTo(100_000, 6);
    expect(r.payableFromAct).toBeCloseTo(1_900_000, 6);
    expect(r.totalRetention).toBeNull();
  });

  it('с ценой контракта считает общий объём удержания', () => {
    const r = computeRetention(2_000_000, 5, 10_000_000);
    expect(r.totalRetention).toBeCloseTo(500_000, 6);
  });

  it('10% с акта 750 000 ₽: удержание 75 000', () => {
    const r = computeRetention(750_000, 10);
    expect(r.retentionFromAct).toBeCloseTo(75_000, 6);
    expect(r.payableFromAct).toBeCloseTo(675_000, 6);
  });

  it('процент ограничивается сверху 100%', () => {
    const r = computeRetention(100_000, 150);
    expect(r.retentionFromAct).toBe(100_000);
    expect(r.payableFromAct).toBe(0);
  });

  it('отрицательные и нечисловые входы приводятся к нулю', () => {
    expect(computeRetention(-1, 5).retentionFromAct).toBe(0);
    expect(computeRetention(100_000, -5).retentionFromAct).toBe(0);
    expect(computeRetention(NaN, 5).payableFromAct).toBe(0);
    expect(computeRetention(100_000, 5, -1).totalRetention).toBeNull();
  });
});
