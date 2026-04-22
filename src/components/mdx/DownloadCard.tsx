interface DownloadCardProps {
  title: string;
  description: string;
  filename: string;
  format: string;
  size: string;
  downloadUrl: string;
}

export function DownloadCard({
  title,
  description,
  filename,
  format,
  size,
  downloadUrl,
}: DownloadCardProps) {
  return (
    <div
      className="my-6 flex items-center justify-between gap-4 rounded-lg p-5"
      style={{
        background: 'var(--bg-elev)',
        border: '1px solid var(--border)',
      }}
    >
      <div className="flex items-start gap-4">
        <div
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg font-mono text-xs font-semibold uppercase"
          style={{ background: 'var(--bg-inset)', color: 'var(--ink-soft)', border: '1px solid var(--border)' }}
        >
          {format}
        </div>
        <div>
          <div className="font-semibold text-[var(--ink)]">{title}</div>
          <div className="mt-0.5 text-sm text-[var(--ink-soft)]">{description}</div>
          <div className="mt-1 font-mono text-xs text-[var(--ink-mute)]">
            {filename} · {size}
          </div>
        </div>
      </div>
      <a
        href={downloadUrl}
        className="flex-shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
        style={{
          background: 'var(--accent)',
          color: 'var(--accent-ink)',
        }}
        download
      >
        Скачать
      </a>
    </div>
  );
}
