import { describe, it, expect } from 'vitest';
import { computeKeyRatePenalty, computeContractPenalty } from './logic-penalty';

// Контрольные значения пересчитаны вручную по формуле ч. 5 ст. 34 44-ФЗ:
// пени = база × (ставка / 100 / 300) × дни.

describe('computeKeyRatePenalty', () => {
  it('1/300 ключевой ставки: 1 000 000 ₽ × 16% × 30 дней = 16 000 ₽', () => {
    const r = computeKeyRatePenalty(1_000_000, 16, 300, 30);
    expect(r.perDay).toBeCloseTo(533.333, 2);
    expect(r.total).toBeCloseTo(16_000, 6);
    expect(r.percentOfBase).toBeCloseTo(1.6, 6);
  });

  it('двойной размер для дольщика-физлица (214-ФЗ): тот же расчёт × 2', () => {
    const r = computeKeyRatePenalty(1_000_000, 16, 300, 30, 2);
    expect(r.total).toBeCloseTo(32_000, 6);
  });

  it('доля 1/150 даёт вдвое больше, чем 1/300', () => {
    const single = computeKeyRatePenalty(500_000, 12, 300, 10);
    const double = computeKeyRatePenalty(500_000, 12, 150, 10);
    expect(double.total).toBeCloseTo(single.total * 2, 6);
  });

  it('доля 1/130: 2 000 000 ₽ × 13% × 10 дней = 20 000 ₽', () => {
    // 2 000 000 × 0.13 / 130 = 2 000 ₽/день
    const r = computeKeyRatePenalty(2_000_000, 13, 130, 10);
    expect(r.perDay).toBeCloseTo(2_000, 6);
    expect(r.total).toBeCloseTo(20_000, 6);
  });

  it('нулевые дни — нулевая пеня, но perDay считается', () => {
    const r = computeKeyRatePenalty(1_000_000, 16, 300, 0);
    expect(r.perDay).toBeGreaterThan(0);
    expect(r.total).toBe(0);
  });

  it('отрицательные и нечисловые входы приводятся к нулю', () => {
    expect(computeKeyRatePenalty(-5, 16, 300, 30).total).toBe(0);
    expect(computeKeyRatePenalty(1_000_000, -1, 300, 30).total).toBe(0);
    expect(computeKeyRatePenalty(1_000_000, 16, 300, -3).total).toBe(0);
    expect(computeKeyRatePenalty(NaN, 16, 300, 30).total).toBe(0);
    expect(computeKeyRatePenalty(1_000_000, 16, 300, 30).percentOfBase).toBeCloseTo(1.6, 6);
  });

  it('нулевая база — percentOfBase равен 0, без деления на ноль', () => {
    const r = computeKeyRatePenalty(0, 16, 300, 30);
    expect(r.percentOfBase).toBe(0);
    expect(r.total).toBe(0);
  });
});

describe('computeContractPenalty', () => {
  it('договорной процент: 500 000 ₽ × 0,1%/день × 45 дней = 22 500 ₽', () => {
    const r = computeContractPenalty(500_000, 0.1, 45);
    expect(r.perDay).toBeCloseTo(500, 6);
    expect(r.total).toBeCloseTo(22_500, 6);
    expect(r.percentOfBase).toBeCloseTo(4.5, 6);
  });

  it('отрицательные входы приводятся к нулю', () => {
    expect(computeContractPenalty(500_000, -0.1, 45).total).toBe(0);
    expect(computeContractPenalty(-1, 0.1, 45).total).toBe(0);
  });
});
