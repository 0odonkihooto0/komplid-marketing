// Логика переключения темы, вынесенная из ThemeToggle для тестируемости.
// Сам компонент остаётся тонким: применяет тему к DOM и хранит её в стейте.

export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'komplid_theme';

/** Возвращает противоположную тему. */
export function nextTheme(current: Theme): Theme {
  return current === 'light' ? 'dark' : 'light';
}

/** Приводит произвольное значение из хранилища к теме; чужое — в null. */
export function parseTheme(value: unknown): Theme | null {
  return value === 'light' || value === 'dark' ? value : null;
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

/**
 * Читает сохранённую тему. Возвращает null, если её нет или хранилище закрыто —
 * тогда решает системная настройка, а не наш дефолт.
 */
export function readStoredTheme(): Theme | null {
  try {
    return parseTheme(localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return null;
  }
}

/**
 * Скрипт, который ставит тему до первой отрисовки страницы.
 *
 * Нужен именно синхронным в <head>: React-компонент выставил бы тему только
 * после гидратации, и выбранная тёмная тема успевала бы моргнуть светлой на
 * каждой перезагрузке и каждом переходе. Отсюда же и дублирование логики
 * readStoredTheme — модуль сюда не импортируешь, строка исполняется до бандла.
 *
 * Порядок источников: явный выбор человека → системная настройка → светлая.
 */
export const THEME_INIT_SCRIPT = `(function(){try{
var t=null;try{t=localStorage.getItem('${THEME_STORAGE_KEY}')}catch(e){}
if(t!=='light'&&t!=='dark'){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}
document.documentElement.setAttribute('data-theme',t)}catch(e){}})()`;
