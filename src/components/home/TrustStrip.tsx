import Link from 'next/link';
import { TRUST_ITEMS } from '@/lib/home-data';

/**
 * Полоса «что берём на себя» — четыре проверяемых утверждения о платформе.
 * Ссылка ставится только там, где есть куда вести: база нормативки открыта
 * без регистрации, и это можно проверить прямо сейчас.
 */
export function TrustStrip() {
  return (
    <section className="trust-grid" id="base" style={{ scrollMarginTop: 72 }}>
      {TRUST_ITEMS.map((item) => {
        const body = (
          <>
            <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--t1)' }}>{item.title}</div>
            <div style={{ marginTop: 9, fontSize: 13, lineHeight: 1.5, color: 'var(--t4)' }}>
              {item.text}
            </div>
          </>
        );

        return item.href ? (
          <Link key={item.title} href={item.href} style={{ display: 'block' }}>
            {body}
          </Link>
        ) : (
          <div key={item.title}>{body}</div>
        );
      })}
    </section>
  );
}
