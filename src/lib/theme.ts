// Логика переключения темы, вынесенная из ThemeToggle для тестируемости.
// Сам компонент остаётся тонким: применяет тему к DOM и хранит её в стейте.

export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'komplid_theme';

/** Возвращает противоположную тему. */
export function nextTheme(current: Theme): Theme {
  return current === 'light' ? 'dark' : 'light';
}

/**
 * Сохраняет выбранную тему в localStorage. Глотает ошибки: в приватном режиме
 * Safari и при переполнении квоты setItem бросает — переключение темы при этом
 * не должно падать, тема уже применена к DOM.
 */
export function persistTheme(theme: Theme): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // запись недоступна (incognito / отключённое хранилище) — игнорируем
  }
}
