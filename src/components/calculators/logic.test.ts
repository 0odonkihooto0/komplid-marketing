import { describe, it, expect } from 'vitest';
import { parseISO, format } from 'date-fns';
import {
  clampPercent,
  computeAvans,
  computeKs2,
  countWorkingDays,
  isWorkingDay,
  nthWorkingDay,
} from './logic';

const d = (iso: string) => parseISO(iso);

describe('clampPercent', () => {
  it('ограничивает диапазоном [0, 100]', () => {
    expect(clampPercent(30)).toBe(30);
    expect(clampPercent(150)).toBe(100);
    expect(clampPercent(-5)).toBe(0);
  });
});

describe('computeAvans', () => {
  it('считает аванс, остаток и НДС', () => {
    const r = computeAvans(1_000_000, 20, 20);
    expect(r.advanceAmount).toBe(200_000);
    expect(r.remaining).toBe(800_000);
    expect(r.vatAmount).toBe(200_000);
    expect(r.totalWithVat).toBe(1_200_000);
    expect(r.advanceWithVat).toBe(240_000);
  });

  it('ограничивает процент аванса сверху 100%', () => {
    const r = computeAvans(500_000, 150, 0);
    expect(r.advanceAmount).toBe(500_000);
    expect(r.remaining).toBe(0);
  });

  it('при НДС 0% не начисляет налог', () => {
    const r = computeAvans(800_000, 30, 0);
    expect(r.vatAmount).toBe(0);
    expect(r.totalWithVat).toBe(800_000);
    expect(r.advanceWithVat).toBe(r.advanceAmount);
  });
});

describe('computeKs2', () => {
  it('начисляет НДС 20%', () => {
    expect(computeKs2(500_000, 20)).toEqual({ vatAmount: 100_000, totalInclVat: 600_000 });
  });

  it('начисляет НДС 10%', () => {
    expect(computeKs2(500_000, 10)).toEqual({ vatAmount: 50_000, totalInclVat: 550_000 });
  });

  it('при УСН (0%) НДС не начисляется', () => {
    expect(computeKs2(500_000, 0)).toEqual({ vatAmount: 0, totalInclVat: 500_000 });
  });
});

describe('isWorkingDay (РФ 2026)', () => {
  it('будний непраздничный день — рабочий', () => {
    expect(isWorkingDay(d('2026-01-12'))).toBe(true); // понедельник
  });

  it('выходной — не рабочий', () => {
    expect(isWorkingDay(d('2026-01-17'))).toBe(false); // суббота
  });

  it('федеральный праздник — не рабочий', () => {
    expect(isWorkingDay(d('2026-02-23'))).toBe(false); // День защитника Отечества
  });
});

describe('countWorkingDays (РФ 2026)', () => {
  it('новогодние каникулы целиком нерабочие', () => {
    expect(countWorkingDays(d('2026-01-01'), d('2026-01-11'))).toBe(0);
  });

  it('обычная рабочая неделя без праздников = 5', () => {
    expect(countWorkingDays(d('2026-01-12'), d('2026-01-16'))).toBe(5);
  });

  it('исключает выходные внутри интервала', () => {
    expect(countWorkingDays(d('2026-01-12'), d('2026-01-18'))).toBe(5);
  });

  it('исключает праздник внутри интервала', () => {
    expect(countWorkingDays(d('2026-02-23'), d('2026-02-27'))).toBe(4);
  });
});

describe('nthWorkingDay (РФ 2026)', () => {
  it('возвращает дату 3-го рабочего дня', () => {
    const result = nthWorkingDay(d('2026-01-12'), d('2026-01-16'), 3);
    expect(result).not.toBeNull();
    expect(format(result!, 'yyyy-MM-dd')).toBe('2026-01-14');
  });

  it('пропускает праздники при отсчёте', () => {
    // 23-е (Пн) праздник → 1-й раб. день 24-е, 3-й раб. день — 26-е
    const result = nthWorkingDay(d('2026-02-23'), d('2026-02-28'), 3);
    expect(format(result!, 'yyyy-MM-dd')).toBe('2026-02-26');
  });

  it('возвращает null, если рабочих дней меньше N', () => {
    expect(nthWorkingDay(d('2026-01-01'), d('2026-01-11'), 3)).toBeNull();
  });
});
