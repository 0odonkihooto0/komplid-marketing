// Единый клиент к публичному API приложения (app.komplid.ru). Инкапсулирует
// чтение INTERNAL_API_URL/INTERNAL_API_TOKEN, заголовок Authorization и обработку
// сетевых ошибок, чтобы route-хендлеры (lead, newsletter) не дублировали boilerplate.

export type InternalApiResult =
  | { ok: true }
  | { ok: false; reason: 'not_configured' | 'error' };

/**
 * POST в публичное API приложения с серверным токеном.
 * @param path путь, начинающийся со «/» (например `/leads`)
 * @param body произвольное тело — сериализуется в JSON
 */
export async function postToInternalApi(path: string, body: unknown): Promise<InternalApiResult> {
  const apiUrl = process.env.INTERNAL_API_URL;
  const apiToken = process.env.INTERNAL_API_TOKEN;

  if (!apiUrl || !apiToken) {
    return { ok: false, reason: 'not_configured' };
  }

  try {
    const res = await fetch(`${apiUrl}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      return { ok: false, reason: 'error' };
    }

    return { ok: true };
  } catch {
    return { ok: false, reason: 'error' };
  }
}
