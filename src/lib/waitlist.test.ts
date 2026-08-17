import { describe, it, expect } from 'vitest';
import { seatsPhrase } from './waitlist';

describe('seatsPhrase', () => {
  it('склоняет единственное число', () => {
    expect(seatsPhrase(1)).toBe('1 место');
    expect(seatsPhrase(21)).toBe('21 место');
    expect(seatsPhrase(101)).toBe('101 место');
  });

  it('склоняет от двух до четырёх', () => {
    expect(seatsPhrase(2)).toBe('2 места');
    expect(seatsPhrase(3)).toBe('3 места');
    expect(seatsPhrase(24)).toBe('24 места');
  });

  it('склоняет множественное число', () => {
    expect(seatsPhrase(0)).toBe('0 мест');
    expect(seatsPhrase(5)).toBe('5 мест');
    expect(seatsPhrase(100)).toBe('100 мест');
  });

  it('обрабатывает исключения второго десятка', () => {
    // 11–14 всегда «мест», хотя последняя цифра говорит об обратном
    expect(seatsPhrase(11)).toBe('11 мест');
    expect(seatsPhrase(12)).toBe('12 мест');
    expect(seatsPhrase(13)).toBe('13 мест');
    expect(seatsPhrase(14)).toBe('14 мест');
    expect(seatsPhrase(111)).toBe('111 мест');
  });
});
