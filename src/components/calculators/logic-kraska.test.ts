import { describe, it, expect } from 'vitest';
import { computeKraska } from './logic-kraska';

// Контрольные значения пересчитаны вручную: литры = S × расход × слои.

describe('computeKraska', () => {
  it('45 м², расход 0,12 л/м², 2 слоя: 10,8 л — 5 банок по 2,5 л', () => {
    const r = computeKraska(45, 0.12, 2, 2.5);
    expect(r.litersPerCoat).toBeCloseTo(5.4, 6);
    expect(r.litersTotal).toBeCloseTo(10.8, 6);
    expect(r.cans).toBe(5);
  });

  it('один слой — вдвое меньше краски', () => {
    const r = computeKraska(45, 0.12, 1, 2.5);
    expect(r.litersTotal).toBeCloseTo(5.4, 6);
    expect(r.cans).toBe(3);
  });

  it('нулевой объём банки не даёт деления на ноль', () => {
    expect(computeKraska(45, 0.12, 2, 0).cans).toBe(0);
  });

  it('отрицательные входы приводятся к нулю', () => {
    expect(computeKraska(-45, 0.12, 2, 2.5).litersTotal).toBe(0);
  });
});
