/**
 * Локап «Комплид»: знак-галочка плюс начертание.
 *
 * Знак нарисован инлайновым SVG, а не <img src="/brand/...">, сознательно:
 * заливка берётся из токена --logoMark и сама меняется при смене темы
 * (на светлом фоне знак темнее — так в брендбуке). Готовые файлы локапов
 * в public/brand/ остаются для внешних носителей: писем, презентаций, печати.
 *
 * Правила использования — design/brand-kit.html.
 */

/** Контур знака — общий для всех файлов логокомплекта. */
const MARK_PATH =
  'M4.2 49.8A11 11 0 0 1 19.8 34.2L51 65.4Q76 40 107.2 9.2A4 4 0 0 1 112.8 14.8Q80 53 54.5 84.5Q41 86.6 38.2 83.8Z';

interface Props {
  /** Подпись «Строительство под контролем» — ставится только в подвале. */
  withTagline?: boolean;
}

export function BrandLogo({ withTagline = false }: Props) {
  return (
    <>
      <svg
        className="brand-mark"
        viewBox="0 0 120 100"
        role="img"
        aria-label="Комплид"
        focusable="false"
      >
        <path d={MARK_PATH} />
      </svg>
      <span>
        <span className="brand-word">Комплид</span>
        {withTagline && <span className="brand-tagline">Строительство под контролем</span>}
      </span>
    </>
  );
}
