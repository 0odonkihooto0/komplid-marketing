// Сетевой слой формы скачивания шаблона — вынесен из компонента,
// чтобы покрыть тестами ветки ошибок (не-OK ответ vs сбой сети).

export interface TemplateDownloadPayload {
  slug: string;
  filename: string;
  email: string;
  role: string;
  newsletterConsent: boolean;
  /** Отметка «хочу ранний доступ» — тот же лид, но с интересом к продукту. */
  earlyAccess?: boolean;
}

/** Ошибка не-OK ответа API (в отличие от сетевого сбоя fetch). */
export class TemplateDownloadError extends Error {
  constructor(public readonly status: number) {
    super(`Template download request failed: ${status}`);
    this.name = 'TemplateDownloadError';
  }
}

/**
 * Запрашивает у API-роута ссылку на скачивание шаблона.
 * Бросает TemplateDownloadError при не-OK ответе; сетевые ошибки fetch
 * пробрасываются как есть — вызывающий код различает их для текста сообщения.
 */
export async function requestTemplateDownload(
  payload: TemplateDownloadPayload,
): Promise<{ downloadUrl: string }> {
  const res = await fetch('/api/template-download', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new TemplateDownloadError(res.status);
  }

  return (await res.json()) as { downloadUrl: string };
}
