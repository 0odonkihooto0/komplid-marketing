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

const NAV_LINKS = [
  { href: '/#modules', label: 'Модули' },
  { href: '/#pricing', label: 'Тарифы' },
  { href: '/sravnenie', label: 'Сравнение' },
  { href: '/blog', label: 'Блог' },
  { href: '/#faq', label: 'FAQ' },
];

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
          <SheetTitle style={{ color: 'var(--ink)' }}>Komplid</SheetTitle>
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
          <a
            href="https://app.komplid.ru/signup"
            style={{
              display: 'block',
              padding: '10px 14px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500,
              textAlign: 'center',
              color: 'var(--ink-invert)',
              background: 'var(--bg-invert)',
              border: '1px solid var(--bg-invert)',
            }}
          >
            Попробовать
          </a>
        </div>
      </SheetContent>
    </Sheet>
  );
}
