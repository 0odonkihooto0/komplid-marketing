import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';
import { MobileNav } from './MobileNav';
import { BrandLogo } from './BrandLogo';
import { NAV_LINKS } from './nav-links';
import { company } from '@/lib/company';
import { primaryCtaHref, primaryCtaLabel, WAITLIST_MODE } from '@/lib/waitlist';

export function MarketingHeader() {
  return (
    <header className="nav-bar">
      <div className="nav-inner">
        <Link href="/" className="brand-link">
          <BrandLogo />
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
          {/* Почта — единственный публичный канал связи до запуска приложения.
              Прячется раньше остальной навигации (порог 1200px, а не 1023px):
              шесть ссылок, тема и CTA уже занимают ~970px, и на планшете
              контакт распирал бы шапку. На узких экранах он есть
              в мобильном меню и в подвале. */}
          <a href={`mailto:${company.email}`} className="nav-contact">
            {company.email}
          </a>

          <div className="nav-desktop-only">
            <ThemeToggle />
          </div>

          {/* На пре-лонче «Войти» скрыт: app.komplid.ru закрыт, и кнопка вела бы
              в тупик из шапки каждой страницы. Вернётся сама, когда
              NEXT_PUBLIC_WAITLIST_MODE поставят в 0 — как и первичные CTA. */}
          {!WAITLIST_MODE && (
            <a href="https://app.komplid.ru/login" className="nav-desktop-only btn-ghost">
              Войти
            </a>
          )}

          <a
            href={primaryCtaHref('https://app.komplid.ru/signup')}
            className="nav-desktop-only btn-accent btn-accent--sm"
          >
            {primaryCtaLabel('Попробовать')}
          </a>

          <div className="nav-mobile-only">
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  );
}
