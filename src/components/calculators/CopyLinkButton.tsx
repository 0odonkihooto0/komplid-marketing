'use client';

import { useEffect, useRef, useState } from 'react';
import { Link2, Check } from 'lucide-react';
import { copyToClipboard } from '@/lib/clipboard';

// Кнопка «Скопировать ссылку на расчёт» — вместе с useCalcUrlState даёт
// постоянную ссылку, которой делятся в чатах (линкбилдинг, план 02 §2 п. 3).
export function CopyLinkButton() {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  async function handleCopy() {
    const ok = await copyToClipboard(window.location.href);
    if (!ok) return;
    setCopied(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '8px 14px',
        borderRadius: 8,
        border: '1px solid var(--border)',
        background: 'var(--bg-elev)',
        color: copied ? 'var(--accent-strong)' : 'var(--ink-soft)',
        fontSize: 13,
        fontWeight: 500,
        cursor: 'pointer',
      }}
    >
      {copied ? <Check size={14} /> : <Link2 size={14} />}
      {copied ? 'Ссылка скопирована' : 'Скопировать ссылку на расчёт'}
    </button>
  );
}
