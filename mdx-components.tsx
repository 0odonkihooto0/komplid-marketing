import type { MDXComponents } from 'mdx/types';
import Image from 'next/image';
import Link from 'next/link';
import { Callout } from '@/components/mdx/Callout';
import { StepList, Step } from '@/components/mdx/StepList';
import { ComparisonTable } from '@/components/mdx/ComparisonTable';
import { DownloadCard } from '@/components/mdx/DownloadCard';
import { Quote } from '@/components/mdx/Quote';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => (
      <h1 className="mb-6 mt-0 text-4xl font-semibold tracking-tight text-[var(--ink)]">
        {children}
      </h1>
    ),
    h2: ({ children, id }) => (
      <h2
        id={id}
        className="mb-4 mt-12 scroll-mt-20 text-2xl font-semibold tracking-tight text-[var(--ink)]"
      >
        {children}
      </h2>
    ),
    h3: ({ children, id }) => (
      <h3
        id={id}
        className="mb-3 mt-8 scroll-mt-20 text-xl font-semibold text-[var(--ink)]"
      >
        {children}
      </h3>
    ),
    p: ({ children }) => (
      <p className="mb-4 leading-relaxed text-[var(--ink-soft)]">{children}</p>
    ),
    a: ({ href, children, ...props }) => {
      const isExternal = href?.startsWith('http');
      if (isExternal) {
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--accent-strong)] underline underline-offset-2 hover:no-underline"
            {...props}
          >
            {children}
          </a>
        );
      }
      return (
        <Link
          href={href ?? '#'}
          className="text-[var(--accent-strong)] underline underline-offset-2 hover:no-underline"
          {...props}
        >
          {children}
        </Link>
      );
    },
    img: ({ src, alt, ...props }) => (
      <Image
        src={src ?? ''}
        alt={alt ?? ''}
        width={800}
        height={450}
        className="my-8 rounded-lg"
        {...(props as object)}
      />
    ),
    blockquote: ({ children }) => (
      <blockquote
        className="my-6 border-l-4 pl-4 italic text-[var(--ink-soft)]"
        style={{ borderColor: 'var(--accent)' }}
      >
        {children}
      </blockquote>
    ),
    ul: ({ children }) => (
      <ul className="mb-4 ml-5 list-disc space-y-1 text-[var(--ink-soft)]">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="mb-4 ml-5 list-decimal space-y-1 text-[var(--ink-soft)]">{children}</ol>
    ),
    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
    strong: ({ children }) => (
      <strong className="font-semibold text-[var(--ink)]">{children}</strong>
    ),
    code: ({ children }) => (
      <code
        className="rounded px-1.5 py-0.5 font-mono text-[0.85em]"
        style={{ background: 'var(--bg-inset)', color: 'var(--ink)' }}
      >
        {children}
      </code>
    ),
    pre: ({ children }) => (
      <pre
        className="my-6 overflow-x-auto rounded-lg p-4 font-mono text-sm"
        style={{ background: 'var(--bg-inset)', border: '1px solid var(--border)' }}
      >
        {children}
      </pre>
    ),
    table: ({ children }) => (
      <div className="my-6 overflow-x-auto">
        <table className="w-full border-collapse text-sm">{children}</table>
      </div>
    ),
    th: ({ children }) => (
      <th
        className="px-4 py-2 text-left font-semibold"
        style={{ borderBottom: '2px solid var(--ink)', color: 'var(--ink)' }}
      >
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td
        className="px-4 py-2 text-[var(--ink-soft)]"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        {children}
      </td>
    ),
    // Кастомные компоненты для MDX-статей
    Callout,
    StepList,
    Step,
    ComparisonTable,
    DownloadCard,
    Quote,
    ...components,
  };
}
