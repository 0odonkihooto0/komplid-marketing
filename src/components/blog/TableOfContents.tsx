'use client';

import { useEffect, useState } from 'react';

interface TocEntry {
  level: 2 | 3;
  text: string;
  id: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function extractHeadings(content: string): TocEntry[] {
  const headings: TocEntry[] = [];
  const lines = content.split('\n');

  for (const line of lines) {
    const h2 = line.match(/^##\s+(.+)$/);
    const h3 = line.match(/^###\s+(.+)$/);

    if (h2?.[1]) {
      headings.push({ level: 2, text: h2[1].trim(), id: slugify(h2[1].trim()) });
    } else if (h3?.[1]) {
      headings.push({ level: 3, text: h3[1].trim(), id: slugify(h3[1].trim()) });
    }
  }

  return headings;
}

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
