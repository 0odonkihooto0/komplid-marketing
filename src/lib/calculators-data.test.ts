import { describe, it, expect } from 'vitest';
import { CALCULATORS, getCalcBySlug } from './calculators-data';

describe('getCalcBySlug', () => {
  it('возвращает калькулятор по существующему slug', () => {
    const calc = getCalcBySlug('smeta-avans');
    expect(calc).toBeDefined();
    expect(calc?.slug).toBe('smeta-avans');
  });

  it('находит каждый калькулятор из CALCULATORS', () => {
    for (const expected of CALCULATORS) {
      expect(getCalcBySlug(expected.slug)).toBe(expected);
    }
  });

  it('возвращает undefined для отсутствующего slug', () => {
    expect(getCalcBySlug('nonexistent' as never)).toBeUndefined();
  });

  it('возвращает undefined для пустой строки', () => {
    expect(getCalcBySlug('' as never)).toBeUndefined();
  });
});
