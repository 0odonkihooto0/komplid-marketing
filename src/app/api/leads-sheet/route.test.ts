import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { POST } from './route';
import { resetRateLimits } from '@/lib/rate-limit';

/**
 * Роут пересборки таблицы-зеркала. Он читает всю базу заявок и перезаписывает
 * файл на Диске, поэтому проверяем прежде всего защиту: без секрета роут
 * должен быть невидим, с неверным — молчать, и перебор секрета должен упираться
 * в лимит.
 */

const { rebuild } = vi.hoisted(() => ({ rebuild: vi.fn() }));

vi.mock('@/lib/leads-store', () => ({ rebuildLeadsSheet: rebuild }));

const saved: Record<string, string | undefined> = {};

function req(headers: Record<string, string> = {}) {
  return new Request('http://localhost/api/leads-sheet', {
    method: 'POST',
    headers: { 'x-forwarded-for': '203.0.113.7', ...headers },
  }) as unknown as Parameters<typeof POST>[0];
}

beforeEach(() => {
  saved['LEADS_ADMIN_TOKEN'] = process.env.LEADS_ADMIN_TOKEN;
  process.env.LEADS_ADMIN_TOKEN = 'secret-token';
  rebuild.mockReset();
  rebuild.mockResolvedValue(42);
  resetRateLimits();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  if (saved['LEADS_ADMIN_TOKEN'] === undefined) delete process.env.LEADS_ADMIN_TOKEN;
  else process.env.LEADS_ADMIN_TOKEN = saved['LEADS_ADMIN_TOKEN'];
  vi.restoreAllMocks();
});

describe('POST /api/leads-sheet', () => {
  it('пересобирает таблицу и отдаёт число строк', async () => {
    const res = await POST(req({ authorization: 'Bearer secret-token' }));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true, rows: 42 });
    expect(rebuild).toHaveBeenCalledOnce();
  });

  it('без секрета в окружении роут не существует', async () => {
    delete process.env.LEADS_ADMIN_TOKEN;

    const res = await POST(req({ authorization: 'Bearer ' }));

    // Именно 404: пустой секрет, с которым сходится пустой заголовок,
    // открыл бы базу заявок наружу.
    expect(res.status).toBe(404);
    expect(rebuild).not.toHaveBeenCalled();
  });

  it('с неверным секретом ничего не делает', async () => {
    const res = await POST(req({ authorization: 'Bearer wrong' }));

    expect(res.status).toBe(401);
    expect(rebuild).not.toHaveBeenCalled();
  });

  it('без заголовка авторизации — тоже отказ', async () => {
    expect((await POST(req())).status).toBe(401);
  });

  it('перебор секрета упирается в лимит', async () => {
    for (let i = 0; i < 5; i += 1) await POST(req({ authorization: 'Bearer wrong' }));

    const res = await POST(req({ authorization: 'Bearer wrong' }));
    expect(res.status).toBe(429);
  });

  it('сбой пересборки не роняет роут', async () => {
    rebuild.mockRejectedValue(new Error('Диск недоступен'));

    const res = await POST(req({ authorization: 'Bearer secret-token' }));

    expect(res.status).toBe(500);
    expect(await res.json()).toMatchObject({ error: expect.any(String) });
  });
});
