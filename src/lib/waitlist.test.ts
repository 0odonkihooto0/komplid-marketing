import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { seatsPhrase, globalCtaHref, WAITLIST_ANCHOR, WAITLIST_MODE } from './waitlist';

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

describe('globalCtaHref', () => {
  it('до запуска ведёт на главную с якорем, а не на локальный', () => {
    // Локальный якорь ставит сама форма, поэтому на странице без неё он мёртв
    expect(globalCtaHref('https://app.komplid.ru/signup')).toBe(`/${WAITLIST_ANCHOR}`);
    expect(WAITLIST_ANCHOR.startsWith('#')).toBe(true);
  });
});

/**
 * Кнопка раннего доступа стоит в шапке, то есть на каждой странице сайта,
 * а якорь для неё создаёт форма. Страница без формы = молча неработающая кнопка;
 * ровно так и было на блоге, шаблонах и нормативах до 23.08.2026.
 *
 * Поэтому список страниц-исключений задан явно: новая страница без формы уронит
 * прогон, и решение «а кнопка тут куда ведёт?» придётся принять осознанно.
 */
describe('форма раннего доступа на страницах', () => {
  const APP_DIR = path.join(process.cwd(), 'src/app');

  /** Юридические страницы намеренно строгие: там только текст документа. */
  const WITHOUT_FORM = ['legal/oferta', 'legal/privacy', 'legal/terms'];

  /** Компоненты, каждый из которых рендерит форму с якорем. */
  const FORM_COMPONENTS = ['WaitlistSection', 'BetaCtaSection', 'RoleSolutionPage'];

  function pages(dir: string, prefix = ''): Array<{ route: string; file: string }> {
    const found: Array<{ route: string; file: string }> = [];
    for (const entry of readdirSync(dir)) {
      const full = path.join(dir, entry);
      if (statSync(full).isDirectory()) {
        if (entry === 'api') continue;
        found.push(...pages(full, prefix ? `${prefix}/${entry}` : entry));
      } else if (entry === 'page.tsx') {
        found.push({ route: prefix, file: full });
      }
    }
    return found;
  }

  it.runIf(WAITLIST_MODE)('есть везде, кроме явных исключений', () => {
    const missing = pages(APP_DIR)
      .filter(({ file }) => {
        const src = readFileSync(file, 'utf8');
        return !FORM_COMPONENTS.some((name) => src.includes(name));
      })
      .map(({ route }) => route);

    expect(missing.sort()).toEqual(WITHOUT_FORM.sort());
  });
});
