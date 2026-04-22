interface CalloutProps {
  type?: 'info' | 'warning' | 'tip' | 'success';
  title?: string;
  children: React.ReactNode;
}

const styles: Record<NonNullable<CalloutProps['type']>, string> = {
  info:    'border-[var(--info)]    bg-[color-mix(in_oklch,var(--info)_8%,var(--bg-elev))]',
  warning: 'border-[var(--warn)]    bg-[color-mix(in_oklch,var(--warn)_8%,var(--bg-elev))]',
  tip:     'border-[var(--ok)]      bg-[color-mix(in_oklch,var(--ok)_8%,var(--bg-elev))]',
  success: 'border-[var(--ok)]      bg-[color-mix(in_oklch,var(--ok)_8%,var(--bg-elev))]',
};

const titleStyles: Record<NonNullable<CalloutProps['type']>, string> = {
  info:    'text-[var(--info)]',
  warning: 'text-[var(--warn)]',
  tip:     'text-[var(--ok)]',
  success: 'text-[var(--ok)]',
};

export function Callout({ type = 'info', title, children }: CalloutProps) {
  return (
    <div
      className={`my-6 rounded-r-lg border-l-4 p-4 ${styles[type]}`}
    >
      {title && (
        <div className={`mb-1 font-semibold ${titleStyles[type]}`}>{title}</div>
      )}
      <div className="text-[var(--ink-soft)] [&>p]:mb-0 [&>p:last-child]:mb-0">
        {children}
      </div>
    </div>
  );
}
