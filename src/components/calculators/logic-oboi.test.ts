import { describe, it, expect } from 'vitest';
import { computeOboi } from './logic-oboi';

// Контрольные значения пересчитаны вручную (рулон 0,53 × 10,05 м).

describe('computeOboi', () => {
  it('комната 3×4 (периметр 14 м), высота 2,7 м, без раппорта: 27 полос, 9 рулонов', () => {
    const r = computeOboi(14, 2.7, 0.53, 10.05, 0, 0);
    expect(r.stripHeightM).toBeCloseTo(2.7, 6);
    expect(r.stripsPerRoll).toBe(3); // floor(10,05 / 2,7)
    expect(r.stripsNeeded).toBe(27); // ceil(14 / 0,53)
    expect(r.rolls).toBe(9);
  });

  it('раппорт увеличивает высоту полосы и число рулонов', () => {
    // Высота 2,5: без раппорта 4 полосы с рулона → 7 рулонов
    const plain = computeOboi(14, 2.5, 0.53, 10.05, 0, 0);
    expect(plain.stripsPerRoll).toBe(4);
    expect(plain.rolls).toBe(7);
    // С раппортом 0,64: полоса 2,56 м → 3 полосы с рулона → 9 рулонов
    const rap = computeOboi(14, 2.5, 0.53, 10.05, 0.64, 0);
    expect(rap.stripHeightM).toBeCloseTo(2.56, 6);
    expect(rap.stripsPerRoll).toBe(3);
    expect(rap.rolls).toBe(9);
  });

  it('проёмы уменьшают оклеиваемый периметр', () => {
    // 14 − 1,8 (дверь 0,9 + окно 0,9) = 12,2 → 24 полосы → 8 рулонов
    const r = computeOboi(14, 2.7, 0.53, 10.05, 0, 1.8);
    expect(r.stripsNeeded).toBe(24);
    expect(r.rolls).toBe(8);
  });

  it('нулевая ширина рулона не даёт деления на ноль', () => {
    expect(computeOboi(14, 2.7, 0, 10.05, 0, 0).rolls).toBe(0);
  });
});
