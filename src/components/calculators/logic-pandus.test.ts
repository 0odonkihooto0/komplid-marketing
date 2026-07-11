import { describe, it, expect } from 'vitest';
import { computePandus } from './logic-pandus';

// Контрольные значения — СП 59.13330.2020, таблица 5.1 и п. 5.1.14.

describe('computePandus', () => {
  it('перепад 1,0 м при уклоне 50‰ (1:20): длина 20 м, 2 марша по ≤12 м, 1 площадка', () => {
    const r = computePandus(1.0, 50);
    expect(r.slopeRatioX).toBeCloseTo(20, 6);
    expect(r.totalLengthM).toBeCloseTo(20, 6);
    expect(r.maxMarchM).toBe(12);
    expect(r.marches).toBe(2);
    expect(r.landings).toBe(1);
    expect(r.violations).toHaveLength(0);
  });

  it('уклон 80‰: марш не более 6 м', () => {
    const r = computePandus(0.5, 80);
    expect(r.totalLengthM).toBeCloseTo(6.25, 6);
    expect(r.maxMarchM).toBe(6);
    expect(r.marches).toBe(2);
    expect(r.violations).toHaveLength(0);
  });

  it('уклон 90‰ — нарушение (более 80‰ не допускается)', () => {
    const r = computePandus(0.5, 90);
    expect(r.violations.some(v => v.includes('80'))).toBe(true);
  });

  it('перепад 7 м — нужен лифт (п. 5.1.14)', () => {
    const r = computePandus(7, 50);
    expect(r.violations.some(v => v.includes('лифт'))).toBe(true);
  });

  it('превышение суммарной длины 36 м при уклоне 61–80‰', () => {
    // 3 м перепада при 80‰ → 37,5 м > 36 м
    const r = computePandus(3, 80);
    expect(r.violations.some(v => v.includes('36'))).toBe(true);
  });

  it('пологие уклоны до 40‰: марш до 15 м', () => {
    const r = computePandus(0.9, 40);
    expect(r.maxMarchM).toBe(15);
    expect(r.totalLengthM).toBeCloseTo(22.5, 6);
    expect(r.marches).toBe(2);
  });
});
