import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';
import { MobileNav } from './MobileNav';
import { BrandLogo } from './BrandLogo';
import { NAV_LINKS } from './nav-links';
import { primaryCtaHref, primaryCtaLabel } from '@/lib/waitlist';

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
          <div className="nav-desktop-only">
            <ThemeToggle />
          </div>

          <a href="https://app.komplid.ru/login" className="nav-desktop-only btn-ghost">
            Войти
          </a>

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
