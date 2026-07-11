import { describe, it, expect } from 'vitest';
import {
  hourlyRateFromSalary,
  computeManHourCost,
  computeCrewCost,
  computeLaborCost,
} from './logic-trudozatraty';

// Контрольные значения пересчитаны вручную:
// 500 × 1,3 × 1,15 = 747,5; 747,5 × 4 × 8 = 23 920; 747,5 × 120 = 89 700.

describe('hourlyRateFromSalary', () => {
  it('оклад 82 000 ₽ при 164 ч/мес — ставка 500 ₽/ч', () => {
    expect(hourlyRateFromSalary(82_000, 164)).toBeCloseTo(500, 6);
  });

  it('нулевые часы не дают деления на ноль', () => {
    expect(hourlyRateFromSalary(82_000, 0)).toBe(0);
  });
});

describe('computeManHourCost', () => {
  it('ставка 500 ₽/ч, взносы 30%, накладные 15% — 747,5 ₽/чел-ч', () => {
    expect(computeManHourCost(500, 30, 15)).toBeCloseTo(747.5, 6);
  });

  it('без взносов и накладных равна ставке', () => {
    expect(computeManHourCost(500, 0, 0)).toBe(500);
  });

  it('отрицательные проценты приводятся к нулю', () => {
    expect(computeManHourCost(500, -30, -15)).toBe(500);
  });
});

describe('computeCrewCost', () => {
  it('бригада 4 человека × 8 часов при 747,5 ₽/чел-ч — 23 920 ₽/смена', () => {
    const r = computeCrewCost(747.5, 4, 8);
    expect(r.crewPerHour).toBeCloseTo(2_990, 6);
    expect(r.crewPerShift).toBeCloseTo(23_920, 6);
  });
});

describe('computeLaborCost', () => {
  it('трудоёмкость 120 чел-ч при 747,5 ₽/чел-ч — 89 700 ₽', () => {
    expect(computeLaborCost(747.5, 120)).toBeCloseTo(89_700, 6);
  });

  it('отрицательная трудоёмкость приводится к нулю', () => {
    expect(computeLaborCost(747.5, -10)).toBe(0);
  });
});
