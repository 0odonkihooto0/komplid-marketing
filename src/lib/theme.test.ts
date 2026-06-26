import { describe, it, expect, vi, afterEach } from 'vitest';
import { nextTheme, persistTheme, THEME_STORAGE_KEY } from './theme';

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
