import { describe, it, expect } from 'vitest';
import { isExternal } from './utils';

describe('isExternal', () => {
  it('считает http и https ссылки внешними', () => {
    expect(isExternal('http://app.komplid.ru')).toBe(true);
    expect(isExternal('https://app.komplid.ru/signup')).toBe(true);
  });

  it('считает внутренние пути не внешними', () => {
    expect(isExternal('/blog/skachat-shablon-aosr')).toBe(false);
    expect(isExternal('/pto')).toBe(false);
    expect(isExternal('#faq')).toBe(false);
    expect(isExternal('')).toBe(false);
  });

  it('не считает протокол-относительные и mailto ссылки http-внешними', () => {
    // startsWith('http') — mailto и tel остаются «внутренними» для роутинга <Link>
    expect(isExternal('mailto:hello@komplid.ru')).toBe(false);
    expect(isExternal('tel:+70000000000')).toBe(false);
  });
});
