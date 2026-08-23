'use client';

import Link from 'next/link';
import { Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';

import { NAV_LINKS } from './nav-links';
import { company } from '@/lib/company';
import { ThemeToggle } from './ThemeToggle';
import { WAITLIST_MODE } from '@/lib/waitlist';
import { HeaderCta } from './HeaderCta';

export function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          aria-label="Открыть меню"
          style={{
            width: 32,
            height: 32,
            borderRadius: 6,
            display: 'grid',
            placeItems: 'center',
            background: 'transparent',
            border: '1px solid var(--border)',
            color: 'var(--ink-soft)',
            cursor: 'pointer',
          }}
        >
          <Menu size={16} />
        </button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle style={{ color: 'var(--ink)' }}>Комплид</SheetTitle>
        </SheetHeader>
        <nav
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            marginTop: 16,
          }}
        >
          {NAV_LINKS.map((link) => (
            <SheetClose asChild key={link.href}>
              <Link
                href={link.href}
                style={{
                  display: 'block',
                  padding: '10px 12px',
                  borderRadius: 6,
                  fontSize: 15,
                  color: 'var(--ink-soft)',
                  transition: 'background 0.12s, color 0.12s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = 'var(--bg-inset)';
                  (e.currentTarget as HTMLAnchorElement).style.color = 'var(--ink)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                  (e.currentTarget as HTMLAnchorElement).style.color = 'var(--ink-soft)';
                }}
              >
                {link.label}
              </Link>
            </SheetClose>
          ))}
        </nav>
        <div
          style={{
            marginTop: 'auto',
            paddingTop: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          {/* Почта из шапки на этой ширине скрыта — контакт живёт здесь */}
          <a
            href={`mailto:${company.email}`}
            style={{
              display: 'block',
              padding: '10px 12px',
              textAlign: 'center',
              fontFamily: 'var(--font-mono)',
              fontSize: 12.5,
              letterSpacing: '0.02em',
              color: 'var(--ink-soft)',
            }}
          >
            {company.email}
          </a>

          {/* В шапке переключатель темы виден только на десктопе */}
          <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 8 }}>
            <ThemeToggle />
          </div>

          {/* Скрыт на пре-лонче — как и в десктопной шапке. */}
          {!WAITLIST_MODE && (
            <a
              href="https://app.komplid.ru/login"
              style={{
                display: 'block',
                padding: '10px 14px',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 500,
                textAlign: 'center',
                color: 'var(--ink)',
                background: 'var(--bg-inset)',
                border: '1px solid var(--border)',
              }}
            >
              Войти
            </a>
          )}
          {/* До запуска ведёт на форму раннего доступа, как и остальные первичные CTA.
              Адрес зависит от страницы — этим занимается HeaderCta. */}
          <HeaderCta
            style={{
              display: 'block',
              padding: '10px 14px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500,
              textAlign: 'center',
              color: 'var(--accent-ink)',
              background: 'var(--accent)',
              border: '1px solid var(--accent)',
            }}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
