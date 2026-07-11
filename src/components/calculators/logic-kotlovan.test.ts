import { describe, it, expect } from 'vitest';
import { computePit, computeTrench } from './logic-kotlovan';

// Контрольные значения пересчитаны вручную по формуле призматоида
// и перепроверены формулой Симпсона V = H/6·(Sниз + 4Sсред + Sверх).

describe('computePit', () => {
  it('котлован дно 10×8, глубина 2, откос m=0,5: 198,67 м³, верх 12×10', () => {
    const r = computePit(10, 8, 2, 0.5, 1);
    // Симпсон: 2/6 × (80 + 4·(11·9) + 120) = 596/3 ≈ 198,67
    expect(r.volume).toBeCloseTo(596 / 3, 3);
    expect(r.topA).toBeCloseTo(12, 6);
    expect(r.topB).toBeCloseTo(10, 6);
  });

  it('вертикальные стенки (m=0): обычный параллелепипед', () => {
    const r = computePit(10, 8, 2, 0, 1);
    expect(r.volume).toBeCloseTo(160, 6);
  });

  it('разрыхление 1,25 увеличивает объём вывоза', () => {
    const r = computePit(10, 8, 2, 0, 1.25);
    expect(r.looseVolume).toBeCloseTo(200, 6);
  });

  it('коэффициент разрыхления меньше 1 приводится к 1', () => {
    const r = computePit(10, 8, 2, 0, 0.8);
    expect(r.looseVolume).toBeCloseTo(r.volume, 6);
  });
});

describe('computeTrench', () => {
  it('траншея: дно 0,8 м, глубина 1,5, m=0,5, длина 50 м — 116,25 м³', () => {
    const r = computeTrench(0.8, 1.5, 0.5, 50, 1);
    expect(r.topA).toBeCloseTo(2.3, 6); // ширина поверху
    expect(r.volume).toBeCloseTo(116.25, 6);
  });

  it('нулевая длина — нулевой объём', () => {
    expect(computeTrench(0.8, 1.5, 0.5, 0, 1).volume).toBe(0);
  });
});
