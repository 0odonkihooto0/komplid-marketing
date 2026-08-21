import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { rateLimit, resetRateLimits, clientKey, tooManyRequests } from './rate-limit';

beforeEach(() => {
  resetRateLimits();
});

afterEach(() => {
  vi.useRealTimers();
});

const OPTS = { limit: 3, windowMs: 60_000 };

describe('rateLimit', () => {
  it('пропускает запросы до лимита включительно', () => {
    for (let i = 0; i < 3; i += 1) {
      expect(rateLimit('a', OPTS).ok).toBe(true);
    }
  });

  it('отказывает на запросе сверх лимита', () => {
    for (let i = 0; i < 3; i += 1) rateLimit('a', OPTS);

    const res = rateLimit('a', OPTS);
    expect(res.ok).toBe(false);
    expect(res.retryAfterSec).toBeGreaterThan(0);
    expect(res.retryAfterSec).toBeLessThanOrEqual(60);
  });

  it('считает ключи независимо — один нарушитель не блокирует остальных', () => {
    for (let i = 0; i < 4; i += 1) rateLimit('a', OPTS);

    expect(rateLimit('a', OPTS).ok).toBe(false);
    expect(rateLimit('b', OPTS).ok).toBe(true);
  });

  it('после окна счётчик начинается заново', () => {
    vi.useFakeTimers();
    for (let i = 0; i < 4; i += 1) rateLimit('a', OPTS);
    expect(rateLimit('a', OPTS).ok).toBe(false);

    vi.advanceTimersByTime(60_001);
    expect(rateLimit('a', OPTS).ok).toBe(true);
  });
});

describe('clientKey', () => {
  function req(headers: Record<string, string>): Request {
    return new Request('http://localhost/api/lead', { method: 'POST', headers });
  }

  it('берёт первый адрес из X-Forwarded-For — остальные дописаны прокси', () => {
    expect(clientKey(req({ 'x-forwarded-for': '203.0.113.7, 10.0.0.1' }), 'lead')).toBe(
      'lead:203.0.113.7',
    );
  });

  it('падает на X-Real-IP, если X-Forwarded-For нет', () => {
    expect(clientKey(req({ 'x-real-ip': '203.0.113.9' }), 'lead')).toBe('lead:203.0.113.9');
  });

  it('без заголовков даёт общий ключ, а не пустой', () => {
    expect(clientKey(req({}), 'lead')).toBe('lead:unknown');
  });

  it('разделяет области — лимит скачиваний не съедает лимит заявок', () => {
    const r = req({ 'x-real-ip': '203.0.113.9' });
    expect(clientKey(r, 'lead')).not.toBe(clientKey(r, 'template'));
  });
});

describe('tooManyRequests', () => {
  it('отдаёт 429 с Retry-After', async () => {
    const res = tooManyRequests(42);

    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBe('42');
    expect(await res.json()).toMatchObject({ error: expect.any(String) });
  });
});
