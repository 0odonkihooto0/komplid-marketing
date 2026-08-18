import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  nextTheme,
  parseTheme,
  persistTheme,
  readStoredTheme,
  THEME_INIT_SCRIPT,
  THEME_STORAGE_KEY,
} from './theme';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('nextTheme', () => {
  it('light → dark', () => {
    expect(nextTheme('light')).toBe('dark');
  });

  it('dark → light', () => {
    expect(nextTheme('dark')).toBe('light');
  });
});

describe('persistTheme', () => {
  it('пишет выбранную тему в localStorage', () => {
    const setItem = vi.fn();
    vi.stubGlobal('localStorage', { setItem });

    persistTheme('dark');

    expect(setItem).toHaveBeenCalledWith(THEME_STORAGE_KEY, 'dark');
  });

  it('не бросает, если setItem кидает (приватный режим / квота)', () => {
    const setItem = vi.fn(() => {
      throw new Error('QuotaExceededError');
    });
    vi.stubGlobal('localStorage', { setItem });

    // ключевая проверка: ошибка хранилища проглатывается
    expect(() => persistTheme('light')).not.toThrow();
    expect(setItem).toHaveBeenCalled();
  });

  it('не бросает, если localStorage недоступен вовсе', () => {
    vi.stubGlobal('localStorage', undefined);
    expect(() => persistTheme('dark')).not.toThrow();
  });
});

describe('parseTheme', () => {
  it('пропускает только известные темы', () => {
    expect(parseTheme('light')).toBe('light');
    expect(parseTheme('dark')).toBe('dark');
  });

  it('чужое значение отбрасывает', () => {
    // в ключ мог записать что угодно другой скрипт на том же домене
    expect(parseTheme('steel')).toBeNull();
    expect(parseTheme(null)).toBeNull();
    expect(parseTheme(1)).toBeNull();
  });
});

describe('readStoredTheme', () => {
  it('возвращает сохранённую тему', () => {
    vi.stubGlobal('localStorage', { getItem: () => 'dark' });
    expect(readStoredTheme()).toBe('dark');
  });

  it('без записи возвращает null — решать будет системная настройка', () => {
    vi.stubGlobal('localStorage', { getItem: () => null });
    expect(readStoredTheme()).toBeNull();
  });

  it('не бросает, если хранилище закрыто', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('SecurityError');
      },
    });
    expect(() => readStoredTheme()).not.toThrow();
    expect(readStoredTheme()).toBeNull();
  });
});

describe('THEME_INIT_SCRIPT', () => {
  it('ссылается на тот же ключ хранилища, что и persistTheme', () => {
    // расхождение ключей здесь не заметит ни один тест компонентов:
    // тема будет сохраняться, но не подхватываться при загрузке
    expect(THEME_INIT_SCRIPT).toContain(`'${THEME_STORAGE_KEY}'`);
  });

  it('учитывает системную тёмную тему', () => {
    expect(THEME_INIT_SCRIPT).toContain('prefers-color-scheme: dark');
  });

  it('исполняется в браузере и ставит атрибут до отрисовки', () => {
    // проверяем сам код скрипта, а не его пересказ: он уедет в <head> строкой
    const doc = { documentElement: { setAttribute: vi.fn() } };
    const run = new Function('window', 'document', 'localStorage', THEME_INIT_SCRIPT);

    run({ matchMedia: () => ({ matches: false }) }, doc, { getItem: () => 'dark' });
    expect(doc.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');

    run({ matchMedia: () => ({ matches: true }) }, doc, { getItem: () => null });
    expect(doc.documentElement.setAttribute).toHaveBeenLastCalledWith('data-theme', 'dark');

    run({ matchMedia: () => ({ matches: false }) }, doc, { getItem: () => null });
    expect(doc.documentElement.setAttribute).toHaveBeenLastCalledWith('data-theme', 'light');
  });
});
