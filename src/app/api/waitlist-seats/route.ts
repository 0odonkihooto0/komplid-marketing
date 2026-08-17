import { countWaitlistLeads } from '@/lib/leads-store';
import { BETA_SEATS_TOTAL } from '@/lib/waitlist';

/**
 * Сколько мест в закрытой бете осталось.
 *
 * Отдельный роут, а не значение в сборке: главная статическая, и число,
 * посчитанное при сборке, замёрзло бы до следующего деплоя. Счётчик обязан
 * быть настоящим — выдуманный дефицит это ст. 5 ФЗ «О рекламе» (CLAUDE.md §21).
 */
export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  const taken = await countWaitlistLeads();
  const left = Math.max(0, BETA_SEATS_TOTAL - taken);

  return Response.json(
    { left, total: BETA_SEATS_TOTAL },
    // Небольшой кэш: счётчик меняется редко, а главную открывают часто.
    { headers: { 'Cache-Control': 'public, max-age=60' } },
  );
}
