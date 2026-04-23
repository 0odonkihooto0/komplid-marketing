export interface ReferralInfo {
  valid: boolean;
  inviterName?: string;
  discount?: number;
}

/**
 * Валидирует реферальный код через API приложения.
 *
 * Возвращает null если:
 *   - INTERNAL_API_URL / INTERNAL_API_TOKEN не настроены
 *   - код не найден (не-2xx ответ)
 *   - любая сетевая или parse-ошибка
 *
 * null = «неизвестно / показать дефолт» — не является ошибкой рендера.
 */
export async function validateRefCode(code: string): Promise<ReferralInfo | null> {
  const apiUrl = process.env.INTERNAL_API_URL;
  const apiToken = process.env.INTERNAL_API_TOKEN;

  if (!apiUrl || !apiToken) {
    return null;
  }

  try {
    const res = await fetch(`${apiUrl}/referrals/${encodeURIComponent(code)}`, {
      headers: { Authorization: `Bearer ${apiToken}` },
      cache: 'no-store',
    });

    if (!res.ok) {
      return null;
    }

    const data: unknown = await res.json();

    if (
      typeof data === 'object' &&
      data !== null &&
      'valid' in data &&
      typeof (data as Record<string, unknown>).valid === 'boolean'
    ) {
      return data as ReferralInfo;
    }

    return null;
  } catch {
    return null;
  }
}
