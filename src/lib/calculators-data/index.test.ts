import { describe, it, expect } from 'vitest';
import { CALCULATORS, getCalcBySlug } from './index';

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
    expect(getCalcBySlug('nonexistent')).toBeUndefined();
  });

  it('возвращает undefined для пустой строки', () => {
    expect(getCalcBySlug('')).toBeUndefined();
  });
});

describe('инварианты CALCULATORS', () => {
  it('слаги уникальны', () => {
    const slugs = CALCULATORS.map(c => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  // Контент-стандарт плана 02-CALCULATORS-PLAN.md §4 и §6 — проверяем для КАЖДОГО
  // калькулятора, чтобы новые записи не публиковались без обязательных блоков.
  for (const calc of CALCULATORS) {
    describe(calc.slug, () => {
      it('FAQ содержит минимум 5 вопросов, каждый с ответом', () => {
        expect(calc.faq.length).toBeGreaterThanOrEqual(5);
        for (const item of calc.faq) {
          expect(item.question.trim().length).toBeGreaterThan(0);
          expect(item.answer.trim().length).toBeGreaterThan(0);
        }
      });

      it('howToUse содержит минимум 3 шага (HowTo schema)', () => {
        expect(calc.howToUse.length).toBeGreaterThanOrEqual(3);
      });

      it('блок «Как считается» заполнен', () => {
        expect(calc.howItWorks.formula.trim().length).toBeGreaterThan(0);
        expect(calc.howItWorks.variables.length).toBeGreaterThanOrEqual(1);
      });

      it('блок «Пример расчёта» заполнен', () => {
        expect(calc.example.conditions.length).toBeGreaterThanOrEqual(1);
        expect(calc.example.calculation.length).toBeGreaterThanOrEqual(1);
        expect(calc.example.result.trim().length).toBeGreaterThan(0);
      });

      it('нормативное обоснование: минимум 1 ссылка с http-URL', () => {
        expect(calc.normativeBasis.length).toBeGreaterThanOrEqual(1);
        for (const ref of calc.normativeBasis) {
          expect(ref.url).toMatch(/^https?:\/\//);
          expect(ref.title.trim().length).toBeGreaterThan(0);
          expect(ref.reference.trim().length).toBeGreaterThan(0);
        }
      });

      it('related указывает на существующие калькуляторы и не на себя', () => {
        expect(calc.related.length).toBeGreaterThanOrEqual(1);
        for (const relSlug of calc.related) {
          expect(relSlug).not.toBe(calc.slug);
          expect(getCalcBySlug(relSlug)).toBeDefined();
        }
      });

      it('SEO-поля заполнены: keywords ≥ 3, description и title непустые', () => {
        expect(calc.keywords.length).toBeGreaterThanOrEqual(3);
        expect(calc.title.trim().length).toBeGreaterThan(0);
        expect(calc.titleShort.trim().length).toBeGreaterThan(0);
        expect(calc.description.trim().length).toBeGreaterThan(80);
        expect(calc.schemaName).toContain('Комплид');
      });
    });
  }
});
