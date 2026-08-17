import { PLATFORM_FACTS } from '@/lib/proof-data';

/**
 * Счётчики платформы. Значения берутся из единой точки правды
 * src/lib/proof-data.ts — каждое проверяется механически (CLAUDE.md §21).
 * Своих чисел здесь нет намеренно.
 */
export function SiteCounters() {
  return (
    <div className="counters">
      {PLATFORM_FACTS.map((fact) => (
        <div key={fact.label}>
          <div className="counter-value">{fact.value}</div>
          <div className="counter-label">{fact.label}</div>
        </div>
      ))}
    </div>
  );
}
