import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';
import { MobileNav } from './MobileNav';

const NAV_LINKS = [
  { href: '/#modules', label: 'Модули' },
  { href: '/#pricing', label: 'Тарифы' },
  { href: '/sravnenie', label: 'Сравнение' },
  { href: '/blog', label: 'Блог' },
  { href: '/#faq', label: 'FAQ' },
];

export function MarketingHeader() {
  return (
    <header className="nav-bar">
      <div className="nav-inner">
        {/* Логотип */}
        <Link href="/" className="brand-link">
          <span className="brand-mark">
            K
            <span className="brand-dot" />
          </span>
          Komplid
        </Link>

        {/* Десктопная навигация */}
        <nav className="nav-links">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="nav-link">
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Правая часть */}
        <div className="nav-right">
          <div className="nav-desktop-only">
            <ThemeToggle />
          </div>

          <a href="https://app.komplid.ru/login" className="nav-desktop-only btn-ghost">
            Войти
          </a>

          <a href="https://app.komplid.ru/signup" className="nav-desktop-only btn-primary">
            Попробовать
          </a>

          <div className="nav-mobile-only">
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  );
}
