import { describe, it, expect } from 'vitest';
import { bricksPerSquareMeter, computeBrickWall } from './logic-kirpich';

// Контрольные значения — классические справочные числа кладки со швом 10 мм:
// одинарный 1НФ в полкирпича — 51 шт/м², в кирпич — 102 шт/м²,
// полуторный в полкирпича — 39 шт/м², двойной — 26 шт/м².

describe('bricksPerSquareMeter', () => {
  it('одинарный 1НФ: 0,5 кирпича ≈ 51 шт/м², 1 кирпич ≈ 102 шт/м²', () => {
    expect(bricksPerSquareMeter('1nf', '0.5')).toBeCloseTo(51.28, 1);
    expect(bricksPerSquareMeter('1nf', '1')).toBeCloseTo(102.56, 1);
  });

  it('полуторный 1,4НФ: 0,5 кирпича ≈ 39 шт/м²', () => {
    expect(bricksPerSquareMeter('1.4nf', '0.5')).toBeCloseTo(39.2, 1);
  });

  it('двойной 2,1НФ: 0,5 кирпича ≈ 26 шт/м²', () => {
    expect(bricksPerSquareMeter('2.1nf', '0.5')).toBeCloseTo(26.0, 1);
  });
});

describe('computeBrickWall', () => {
  it('стена 20 м² в 1 кирпич (1НФ), запас 5%: ≈2 052 шт нетто, 2 154 к заказу', () => {
    const r = computeBrickWall(20, '1nf', '1', 5);
    expect(r.bricksNet).toBeCloseTo(2051.3, 0);
    expect(r.bricksWithReserve).toBe(Math.ceil(r.bricksNet * 1.05));
    expect(r.bricksWithReserve).toBe(2154);
  });

  it('раствор: кладка 20 м² в 1 кирпич — 5 м³ кладки, ≈1 м³ раствора', () => {
    const r = computeBrickWall(20, '1nf', '1', 0);
    expect(r.masonryVolumeM3).toBeCloseTo(5, 6);
    // объём кирпичей = 2051,3 × 0,25×0,12×0,065 ≈ 4,0 м³ → раствор ≈ 1,0 м³
    expect(r.mortarM3).toBeCloseTo(1.0, 1);
  });

  it('нулевая площадь — нулевой результат', () => {
    const r = computeBrickWall(0, '1nf', '1', 5);
    expect(r.bricksNet).toBe(0);
    expect(r.mortarM3).toBe(0);
  });
});
