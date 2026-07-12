'use client';

import { useEffect, useState } from 'react';
import { extractHeadings } from './toc';

interface TableOfContentsProps {
  content: string;
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');
  const headings = extractHeadings(content);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: '-20% 0% -70% 0%' }
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 3) return null;

  return (
    <nav
      className="my-8 rounded-lg p-4"
      style={{ background: 'var(--bg-inset)', border: '1px solid var(--border)' }}
      aria-label="Содержание"
    >
      <div
        className="mb-3 font-mono text-[10px] uppercase tracking-widest"
        style={{ color: 'var(--ink-mute)' }}
      >
        Содержание
      </div>
      <ul className="space-y-1">
        {headings.map(({ level, text, id }) => (
          <li key={id} className={level === 3 ? 'ml-4' : ''}>
            <a
              href={`#${id}`}
              className="block py-0.5 text-sm transition-colors"
              style={{
                color: activeId === id ? 'var(--accent-strong)' : 'var(--ink-soft)',
              }}
            >
              {text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
