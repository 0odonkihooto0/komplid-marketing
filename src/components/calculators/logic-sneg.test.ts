import { describe, it, expect } from 'vitest';
import {
  SNOW_LOAD_SG_KPA,
  SNOW_REGIONS,
  muForGableRoof,
  computeSnowLoad,
} from './logic-sneg';

// Контрольные значения — СП 20.13330.2016 таблица 10.1 и прил. Б табл. Б.1.

describe('SNOW_LOAD_SG_KPA (табл. 10.1)', () => {
  it('крайние и средние районы: I=0,5; III=1,5; VIII=4,0 кПа', () => {
    expect(SNOW_LOAD_SG_KPA.I).toBe(0.5);
    expect(SNOW_LOAD_SG_KPA.III).toBe(1.5);
    expect(SNOW_LOAD_SG_KPA.VIII).toBe(4.0);
  });

  it('таблица монотонна с шагом 0,5 кПа', () => {
    const values = SNOW_REGIONS.map(r => SNOW_LOAD_SG_KPA[r]);
    for (let i = 1; i < values.length; i++) {
      expect((values[i] ?? 0) - (values[i - 1] ?? 0)).toBeCloseTo(0.5, 6);
    }
  });
});

describe('muForGableRoof (прил. Б, табл. Б.1)', () => {
  it('μ = 1 при уклоне ≤ 30°', () => {
    expect(muForGableRoof(0)).toBe(1);
    expect(muForGableRoof(30)).toBe(1);
  });

  it('μ = 0 при уклоне ≥ 60°', () => {
    expect(muForGableRoof(60)).toBe(0);
    expect(muForGableRoof(75)).toBe(0);
  });

  it('линейная интерполяция: 45° → 0,5', () => {
    expect(muForGableRoof(45)).toBeCloseTo(0.5, 6);
  });
});

describe('computeSnowLoad', () => {
  it('III район, уклон 25°, ce=ct=1: S0=1,5 кПа ≈ 153 кгс/м²; расчётная 2,1 кПа', () => {
    const r = computeSnowLoad('III', 25, 1, 1);
    expect(r.normativeKpa).toBeCloseTo(1.5, 6);
    expect(r.normativeKgfM2).toBeCloseTo(152.96, 1);
    expect(r.designKpa).toBeCloseTo(2.1, 6);
  });

  it('уклон 45° уменьшает нагрузку вдвое (μ=0,5)', () => {
    const r = computeSnowLoad('III', 45, 1, 1);
    expect(r.normativeKpa).toBeCloseTo(0.75, 6);
  });

  it('снос снега ce=0,85 пропорционально снижает S0', () => {
    const r = computeSnowLoad('IV', 20, 0.85, 1);
    expect(r.normativeKpa).toBeCloseTo(2.0 * 0.85, 6);
  });
});
