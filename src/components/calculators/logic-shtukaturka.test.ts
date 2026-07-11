import { describe, it, expect } from 'vitest';
import { computePlaster } from './logic-shtukaturka';

// Контрольные значения пересчитаны вручную: кг = S × (t/10) × расход₁₀мм.

describe('computePlaster', () => {
  it('40 м² слоем 15 мм гипсовой (8,5 кг/м²/10мм) = 510 кг, 17 мешков по 30 кг', () => {
    const r = computePlaster(40, 15, 8.5, 30);
    expect(r.kgPerM2).toBeCloseTo(12.75, 6);
    expect(r.totalKg).toBeCloseTo(510, 6);
    expect(r.bags).toBe(17);
  });

  it('цементная 17 кг/м²/10мм: 10 м² слоем 20 мм = 340 кг', () => {
    const r = computePlaster(10, 20, 17, 25);
    expect(r.totalKg).toBeCloseTo(340, 6);
    expect(r.bags).toBe(Math.ceil(340 / 25)); // 14
  });

  it('нулевой вес мешка не даёт деления на ноль', () => {
    expect(computePlaster(40, 15, 8.5, 0).bags).toBe(0);
  });

  it('отрицательные входы приводятся к нулю', () => {
    expect(computePlaster(-40, 15, 8.5, 30).totalKg).toBe(0);
  });
});
