/**
 * Главная навигация — один список на шапку и мобильное меню.
 *
 * Раньше он был продублирован в MarketingHeader и MobileNav, и правка в одном
 * месте молча расходилась с другим (CLAUDE.md §19 п.5). Теперь источник один.
 *
 * Ссылки добавляются только на существующие страницы: пункт меню в 404 хуже,
 * чем его отсутствие.
 */
export interface NavLink {
  href: string;
  label: string;
}

export const NAV_LINKS: readonly NavLink[] = [
  { href: '/#modules', label: 'Модули' },
  { href: '/#price', label: 'Тарифы' },
  { href: '/normativ', label: 'Нормативы' },
  { href: '/formy', label: 'Формы ИД' },
  { href: '/kalkulyator', label: 'Калькуляторы' },
  { href: '/blog', label: 'Блог' },
];
