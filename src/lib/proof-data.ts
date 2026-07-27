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
 * Факты о самой платформе. Каждый проверяется механически:
 * 323 — число файлов в content/normativ/registry.json,
 * 22 — длина CALCULATORS в src/lib/calculators-data/index.ts,
 * 12 — комплект XSD-схем Минстроя в приложении,
 * 18 — модули в stroydocs/src/lib/ui/object-modules.ts (7 базовых + 11 опциональных).
 */
export const PLATFORM_FACTS: PlatformFact[] = [
  { value: '323', label: 'свода правил' },
  { value: '22', label: 'калькулятора' },
  { value: '12', label: 'схем Минстроя' },
  { value: '18', label: 'модулей' },
];

export interface BetaMetric {
  number: string;
  label: string;
  description: string;
}

/**
 * Метрики беты для тёмного блока «Komplid в цифрах».
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
