/**
 * Режим пре-лонча.
 *
 * Пока app.komplid.ru/signup закрыт, вести туда кнопки бессмысленно — человек
 * упирается в тупик, а лид теряется. Поэтому главные CTA ведут на форму раннего
 * доступа (PROMOTION_STRATEGY §3, действие 0.1).
 *
 * При запуске: NEXT_PUBLIC_WAITLIST_MODE=0 и пересборка — кнопки вернутся
 * на регистрацию без правки страниц.
 */
export const WAITLIST_MODE = process.env.NEXT_PUBLIC_WAITLIST_MODE !== '0';

/** Якорь секции с формой раннего доступа — одинаковый на всех страницах. */
export const WAITLIST_ANCHOR = '#ranniy-dostup';

/** Оффер раннего доступа. Глубже −30% не давать (PROMOTION_STRATEGY §9). */
export const WAITLIST_OFFER = 'Скидка 20% на первый год — первым 100 подписавшимся';

/** Сколько мест в закрытой бете всего. Занятые считаются по реальным заявкам. */
export const BETA_SEATS_TOTAL = 100;

/** Склонение слова «место» — счётчик мест пишется числом и словом. */
export function seatsPhrase(n: number): string {
  const d = n % 10;
  const dd = n % 100;
  if (d === 1 && dd !== 11) return `${n} место`;
  if (d >= 2 && d <= 4 && (dd < 12 || dd > 14)) return `${n} места`;
  return `${n} мест`;
}

/**
 * Куда должен вести первичный CTA. До запуска — на форму, после — на регистрацию
 * с сохранением UTM-меток, которые уже были в ссылке.
 */
export function primaryCtaHref(signupHref: string): string {
  return WAITLIST_MODE ? WAITLIST_ANCHOR : signupHref;
}

/**
 * Адрес формы для кнопок, которые живут на каждой странице сайта — в шапке
 * и мобильном меню.
 *
 * Локальный якорь там ненадёжен: `id` раннего доступа ставит сама форма
 * (WaitlistForm, BetaAccessForm), поэтому на странице без формы `#ranniy-dostup`
 * ведёт в пустоту, и кнопка просто ничего не делает. Ссылка на главную с якорем
 * работает всегда — в том числе с выключенным JS и на странице 404.
 */
export function globalCtaHref(signupHref: string): string {
  return WAITLIST_MODE ? `/${WAITLIST_ANCHOR}` : signupHref;
}

/** Подпись первичной кнопки: обещать «14 дней» до запуска нельзя. */
export function primaryCtaLabel(launchedLabel: string): string {
  return WAITLIST_MODE ? 'Получить ранний доступ' : launchedLabel;
}
