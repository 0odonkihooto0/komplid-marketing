'use client';

import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { nextTheme, persistTheme, type Theme } from '@/lib/theme';

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const current = document.documentElement.getAttribute('data-theme') as Theme | null;
    setTheme(current ?? 'light');
  }, []);

  function toggle() {
    const next = nextTheme(theme);
    document.documentElement.setAttribute('data-theme', next);
    setTheme(next);
    persistTheme(next);
  }

  return (
    <button
      onClick={toggle}
      aria-label="Сменить тему"
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
        flexShrink: 0,
      }}
    >
      {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
    </button>
  );
}
