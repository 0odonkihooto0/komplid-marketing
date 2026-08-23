/**
 * Единая точка правды для всех соцдоказательств сайта.
 *
 * Правило: сюда попадает только то, что можно проверить прямо сейчас —
 * пересчитать файлы в репозитории, открыть код приложения, показать в интерфейсе.
 * Клиентские метрики и отзывы до появления настоящих клиентов не публикуются
 * (CLAUDE.md §21, docs/memory/marketing-decisions-2026-07.md).
 */

export interface PlatformFact {
  value: string;
  label: string;
}

/**
 * Факты о самой платформе: что уже открыто и работает.
 *
 * Это НЕ счётчики первого экрана — те живут в HERO_COUNTERS (src/lib/home-data.ts)
 * и говорят про устройство контура. Здесь — объём того, что можно потрогать
 * на сайте сегодня; набор используется в блоке SocialProof.
 *
 * Каждый факт проверяется механически:
 * 323 — число файлов в content/normativ/registry.json,
 * 22 — длина CALCULATORS в src/lib/calculators-data/index.ts,
 * 12 — комплект XSD-схем Минстроя в приложении,
 * 21 — модули приложения в двух контурах: 14 в контуре объекта и 7 в контуре
 *      организации (см. src/lib/home-data.ts и docs/memory/app-module-list.md).
 */
export const PLATFORM_FACTS: PlatformFact[] = [
  { value: '323', label: 'свода правил' },
  { value: '22', label: 'калькулятора' },
  { value: '12', label: 'схем Минстроя' },
  { value: '21', label: 'модуль' },
];

export interface BetaMetric {
  number: string;
  label: string;
  description: string;
}

/**
 * Метрики беты для тёмного блока «Комплид в цифрах».
 *
 * Пусто до запуска — блок не рендерится (см. hasBetaMetrics ниже).
 * Заполнять ТОЛЬКО измеренными данными из /admin/billing основного приложения,
 * с датой замера в description. Никаких «расчётных» и «ожидаемых» величин:
 * ровно на этом сайт уже один раз обжёгся.
 */
export const BETA_METRICS: BetaMetric[] = [];

export const hasBetaMetrics = BETA_METRICS.length > 0;

export interface Testimonial {
  text: string;
  author: { name: string; role: string; initials: string };
  stats: Array<{ label: string; value: string }>;
}

/**
 * Отзывы. Пусто до появления реальных клиентов.
 * Условие публикации: живой пользователь + письменное согласие на имя и компанию.
 */
export const TESTIMONIALS: Testimonial[] = [];
