import { describe, it, expect } from 'vitest';
import {
  STAGES,
  SPACE_ROLES,
  ORG_ROLES,
  OBJECT_MODULES,
  ORG_MODULES,
  HERO_BULLETS,
  HERO_COUNTERS,
} from './home-data';

/**
 * Первый экран говорит числами: «5 этапов», «10 ролей», «8 сторон», «21 модуль».
 * Числа берутся из наборов данных, поэтому разъехаться с секциями ниже они не могут,
 * — но могут молча измениться на самой видной части сайта, если кто-то добавит роль
 * или этап. Ожидаемые значения зафиксированы здесь: тест упадёт и заставит принять
 * это решение осознанно, а не обнаружить его на проде.
 */
describe('счётчики первого экрана', () => {
  it('показывают ровно то, что заявлено в секциях ниже', () => {
    expect(HERO_COUNTERS.map((c) => c.value)).toEqual([
      String(STAGES.length),
      String(SPACE_ROLES.length),
      String(ORG_ROLES.length),
      '344/пр',
    ]);
  });

  it('совпадают с числами, которые сайт называет в тексте', () => {
    expect(STAGES.length).toBe(5);
    expect(SPACE_ROLES.length).toBe(10);
    expect(ORG_ROLES.length).toBe(8);
  });

  it('у каждого счётчика есть подпись', () => {
    for (const counter of HERO_COUNTERS) {
      expect(counter.label.trim().length).toBeGreaterThan(0);
    }
  });
});

describe('буллеты первого экрана', () => {
  it('их десять и все с текстом', () => {
    expect(HERO_BULLETS).toHaveLength(10);
    for (const bullet of HERO_BULLETS) {
      expect(bullet.text.trim().length).toBeGreaterThan(0);
    }
  });

  it('«21 модуль» сходится с числом модулей в двух контурах', () => {
    const total = OBJECT_MODULES.length + ORG_MODULES.length;
    expect(total).toBe(21);
    expect(HERO_BULLETS.some((b) => b.text.includes(`${total} модул`))).toBe(true);
  });

  /**
   * Правило честности (CLAUDE.md §21): на первом экране нельзя обещать то,
   * чего в приложении нет. Список — из docs/memory/app-feature-reality.md.
   */
  it('не обещают непоставленных функций', () => {
    const notShipped = [/УКЭП/i, /КриптоПро/i, /МЧД/i, /ФГИС ЦС/i, /\b1С\b/, /прям\w* (?:передач|интеграц)/i];
    for (const bullet of HERO_BULLETS) {
      for (const pattern of notShipped) {
        expect(bullet.text).not.toMatch(pattern);
      }
    }
  });
});
