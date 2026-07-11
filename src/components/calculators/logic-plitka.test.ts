import { describe, it, expect } from 'vitest';
import { groutPerM2, computeTiles } from './logic-plitka';

// Контрольный пример формулы затирки (методика производителей):
// плитка 300×300×8, шов 3 мм: (600/90000)·8·3·1,6 = 0,256 кг/м².

describe('groutPerM2', () => {
  it('плитка 300×300×8, шов 3 мм — 0,256 кг/м²', () => {
    expect(groutPerM2(300, 300, 8, 3)).toBeCloseTo(0.256, 3);
  });

  it('нулевые размеры плитки не дают деления на ноль', () => {
    expect(groutPerM2(0, 300, 8, 3)).toBe(0);
  });
});

describe('computeTiles', () => {
  it('12 м², плитка 300×300, запас 10%: 147 плиток, 13,2 м²', () => {
    const r = computeTiles(12, 300, 300, 8, 3, 10, 4);
    expect(r.areaWithReserve).toBeCloseTo(13.2, 6);
    expect(r.tiles).toBe(Math.ceil(13.2 / 0.09)); // 147
    expect(r.tiles).toBe(147);
  });

  it('клей и затирка считаются по площади без запаса', () => {
    const r = computeTiles(12, 300, 300, 8, 3, 10, 4);
    expect(r.glueKg).toBeCloseTo(48, 6);
    expect(r.groutKg).toBeCloseTo(12 * 0.256, 2);
  });

  it('нулевая площадь — нулевой результат', () => {
    const r = computeTiles(0, 300, 300, 8, 3, 10, 4);
    expect(r.tiles).toBe(0);
    expect(r.glueKg).toBe(0);
  });
});
