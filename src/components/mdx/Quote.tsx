interface QuoteProps {
  children: React.ReactNode;
  author?: string;
  role?: string;
}

export function Quote({ children, author, role }: QuoteProps) {
  return (
    <figure className="my-8">
      <blockquote
        className="relative pl-5 text-lg italic leading-relaxed"
        style={{ borderLeft: '3px solid var(--accent)', color: 'var(--ink)' }}
      >
        {children}
      </blockquote>
      {(author ?? role) && (
        <figcaption className="mt-3 pl-5 text-sm text-[var(--ink-mute)]">
          {author && <span className="font-medium text-[var(--ink-soft)]">{author}</span>}
          {author && role && ' · '}
          {role && <span>{role}</span>}
        </figcaption>
      )}
    </figure>
  );
}
