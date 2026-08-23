import { HERO_COUNTERS } from '@/lib/home-data';

/**
 * Счётчики под героем: как устроен контур объекта — этапы, роли, стороны по ГрК
 * и приказ, по формам которого собираются документы.
 *
 * Значения берутся из HERO_COUNTERS (src/lib/home-data.ts), где первые три
 * считаются из самих наборов данных. Своих чисел здесь нет намеренно: цифра
 * на первом экране не должна расходиться с секциями ниже (CLAUDE.md §21).
 */
export function SiteCounters() {
  return (
    <div className="counters">
      {HERO_COUNTERS.map((counter) => (
        <div key={counter.label}>
          <div className="counter-value">{counter.value}</div>
          <div className="counter-label">{counter.label}</div>
        </div>
      ))}
    </div>
  );
}
