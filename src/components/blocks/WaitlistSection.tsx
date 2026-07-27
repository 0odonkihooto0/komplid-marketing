import { WaitlistForm } from '@/components/forms/WaitlistForm';
import { WAITLIST_MODE } from '@/lib/waitlist';

interface Props {
  /** Откуда пришёл лид — попадает в source, чтобы считать конверсию по страницам. */
  source: string;
  eyebrow?: string;
  title?: string;
  description?: string;
}

/**
 * Секция раннего доступа. На запущенном продукте (WAITLIST_MODE=0) не рендерится:
 * там место занимают обычные CTA на регистрацию.
 */
export function WaitlistSection({
  source,
  eyebrow = 'Пре-лонч',
  title = 'Komplid ещё не запущен — займите место в очереди',
  description = 'Мы открываем доступ постепенно. Оставьте почту: напишем в день запуска и закрепим скидку раннего доступа.',
}: Props) {
  if (!WAITLIST_MODE) return null;

  return (
    <section className="section" id="ranniy-dostup-section">
      <div className="wrap">
        <div
          style={{
            display: 'grid',
            gap: 40,
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 480px)',
            alignItems: 'center',
          }}
          className="waitlist-grid"
        >
          <div>
            <span className="eyebrow">{eyebrow}</span>
            <h2
              style={{
                fontSize: 'clamp(24px, 3vw, 36px)',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                fontWeight: 500,
                margin: '14px 0',
              }}
            >
              {title}
            </h2>
            <p style={{ color: 'var(--ink-soft)', fontSize: 16, lineHeight: 1.55, margin: 0 }}>
              {description}
            </p>
          </div>

          <WaitlistForm source={source} />
        </div>
      </div>
    </section>
  );
}
