'use client';

import { useState } from 'react';
import { Link2, Send, Check } from 'lucide-react';
import { copyToClipboard } from '@/lib/clipboard';

interface ShareButtonsProps {
  url: string;
  title: string;
}

export function ShareButtons({ url, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    // copyToClipboard сам откатывается на execCommand и не бросает —
    // подсветку «Скопировано» показываем только при подтверждённом успехе.
    const ok = await copyToClipboard(url);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;

  return (
    <div
      className="my-10 flex items-center gap-3 border-t pt-6"
      style={{ borderColor: 'var(--border)' }}
    >
      <span
        className="mr-2 font-mono text-[11px] uppercase tracking-widest"
        style={{ color: 'var(--ink-mute)' }}
      >
        Поделиться
      </span>

      <button
        onClick={handleCopy}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
        style={{
          background: 'var(--bg-elev)',
          border: '1px solid var(--border)',
          color: copied ? 'var(--ok)' : 'var(--ink-soft)',
        }}
        aria-label="Скопировать ссылку"
      >
        {copied ? <Check size={14} /> : <Link2 size={14} />}
        {copied ? 'Скопировано' : 'Ссылка'}
      </button>

      <a
        href={telegramUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
        style={{
          background: 'var(--bg-elev)',
          border: '1px solid var(--border)',
          color: 'var(--ink-soft)',
        }}
        aria-label="Поделиться в Telegram"
      >
        <Send size={14} />
        Telegram
      </a>
    </div>
  );
}
