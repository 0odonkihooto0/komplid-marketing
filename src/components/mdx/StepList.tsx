interface StepListProps {
  children: React.ReactNode;
}

interface StepProps {
  number: number;
  title: string;
  children: React.ReactNode;
}

export function StepList({ children }: StepListProps) {
  return (
    <div className="my-6 flex flex-col gap-4">
      {children}
    </div>
  );
}

export function Step({ number, title, children }: StepProps) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full font-mono text-sm font-semibold"
          style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}
        >
          {number}
        </div>
      </div>
      <div className="flex-1 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="mb-1 font-semibold text-[var(--ink)]">{title}</div>
        <div className="text-sm text-[var(--ink-soft)] [&>p]:mb-2 [&>p:last-child]:mb-0">
          {children}
        </div>
      </div>
    </div>
  );
}
