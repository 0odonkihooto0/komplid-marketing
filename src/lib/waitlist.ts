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
export const WAITLIST_OFFER = 'Скидка 30% на первые 3 месяца — первым 100 подписавшимся';

/**
 * Куда должен вести первичный CTA. До запуска — на форму, после — на регистрацию
 * с сохранением UTM-меток, которые уже были в ссылке.
 */
export function primaryCtaHref(signupHref: string): string {
  return WAITLIST_MODE ? WAITLIST_ANCHOR : signupHref;
}

/** Подпись первичной кнопки: обещать «14 дней» до запуска нельзя. */
export function primaryCtaLabel(launchedLabel: string): string {
  return WAITLIST_MODE ? 'Получить ранний доступ' : launchedLabel;
}
