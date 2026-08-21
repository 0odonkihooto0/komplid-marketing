/**
 * Ограничение частоты обращений к формам.
 *
 * Исходно это планировалось повесить на nginx, но основной хостинг — Timeweb
 * App Platform, где своего nginx нет. А открытый POST, который пишет в
 * хранилище, скриптом набивает и базу заявок, и счётчик мест на главной —
 * а счётчик это публичное обещание (CLAUDE.md §21).
 *
 * Окно фиксированное, состояние — в памяти процесса. Для одного контейнера
 * этого достаточно; при нескольких инстансах счётчик станет мягче (лимит
 * умножится на их число), но защиту от простого скрипта сохранит.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

/** Сколько ключей держим, прежде чем выбросить протухшие. */
const SWEEP_THRESHOLD = 5_000;

export interface RateLimitOptions {
  /** Сколько запросов разрешено в окне. */
  limit: number;
  /** Длина окна в миллисекундах. */
  windowMs: number;
}

export interface RateLimitResult {
  ok: boolean;
  /** Через сколько секунд можно повторить. Ноль, пока лимит не исчерпан. */
  retryAfterSec: number;
}

function sweep(now: number): void {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export function rateLimit(key: string, { limit, windowMs }: RateLimitOptions): RateLimitResult {
  const now = Date.now();

  // Чистим только при разрастании: пробегать всю карту на каждом запросе
  // дороже, чем изредка — целиком.
  if (buckets.size > SWEEP_THRESHOLD) sweep(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSec: 0 };
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    return { ok: false, retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  return { ok: true, retryAfterSec: 0 };
}

/** Сбрасывает состояние. Нужен тестам: иначе прогон роутов упирается в лимит. */
export function resetRateLimits(): void {
  buckets.clear();
}

/**
 * Кто отправил запрос.
 *
 * За прокси платформы реальный адрес приезжает в X-Forwarded-For; берём первый
 * элемент — остальные дописаны промежуточными узлами. Без заголовков все
 * запросы схлопнутся в один ключ, и лимит станет общим на всех: это грубо,
 * но безопасная сторона — лучше отказать, чем пустить набивку.
 */
export function clientKey(req: Request, scope: string): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || req.headers.get('x-real-ip')?.trim() || 'unknown';
  return `${scope}:${ip}`;
}

/** Ответ 429 с заголовком Retry-After — по нему клиент понимает, когда повторить. */
export function tooManyRequests(retryAfterSec: number): Response {
  return Response.json(
    { error: 'Слишком много запросов. Попробуйте позже.' },
    { status: 429, headers: { 'Retry-After': String(retryAfterSec) } },
  );
}
