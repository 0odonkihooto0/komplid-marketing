import { describe, it, expect } from 'vitest';
import { computeStair } from './logic-lestnitsa';

// Контрольные значения — СП 118.13330.2022 пп. 5.7, 5.8 и правило Блонделя.

describe('computeStair', () => {
  it('этаж 3,0 м, проступь 0,3, подступёнок 0,15: 20 ступеней, уклон 1:2, Блондель 600 мм', () => {
    const r = computeStair(3.0, 0.3, 0.15, 'public');
    expect(r.steps).toBe(20);
    expect(r.riserM).toBeCloseTo(0.15, 6);
    expect(r.slope).toBeCloseTo(0.5, 6);
    expect(r.blondelMm).toBeCloseTo(600, 6);
    expect(r.runM).toBeCloseTo(5.7, 6); // 19 проступей × 0,3
    expect(r.violations).toHaveLength(0);
    expect(r.warnings).toHaveLength(0);
  });

  it('этаж 2,8 м: 19 ступеней, подступёнок ≈147 мм — в допуске, Блондель ≈595 мм — предупреждение', () => {
    const r = computeStair(2.8, 0.3, 0.15, 'public');
    expect(r.steps).toBe(19);
    expect(r.riserM).toBeCloseTo(2.8 / 19, 6);
    expect(r.violations).toHaveLength(0);
    expect(r.warnings.length).toBeGreaterThan(0);
  });

  it('подступёнок вне допуска 130–170 мм даёт нарушение', () => {
    // 3,0 м на 15 ступеней = 200 мм
    const r = computeStair(3.0, 0.3, 0.2, 'public');
    expect(r.violations.some(v => v.includes('130–170'))).toBe(true);
  });

  it('уклон круче 1:2 для посетительской лестницы — нарушение, для служебной — нет', () => {
    // подступёнок 0,17, проступь 0,28 → уклон 0,607 (1:1,65)
    const pub = computeStair(3.06, 0.28, 0.17, 'public');
    expect(pub.violations.some(v => v.includes('5.8'))).toBe(true);
    const service = computeStair(3.06, 0.28, 0.17, 'service');
    expect(service.violations.some(v => v.includes('5.8'))).toBe(false);
  });

  it('проступь вне допуска 280–350 мм — нарушение', () => {
    const r = computeStair(3.0, 0.25, 0.15, 'public');
    expect(r.violations.some(v => v.includes('280–350'))).toBe(true);
  });
});
