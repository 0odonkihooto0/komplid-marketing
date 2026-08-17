import { NORM_TICKER } from '@/lib/home-data';

/**
 * Бегущая строка нормативов. Лента дублируется дважды и сдвигается на половину
 * своей ширины — так шов не виден. При prefers-reduced-motion анимация
 * отключается в CSS, строка просто стоит.
 */
export function NormTicker() {
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker__track">
        {[0, 1].map((copy) => (
          <div className="ticker__group" key={copy}>
            {NORM_TICKER.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
