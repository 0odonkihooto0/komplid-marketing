// Копирование в буфер обмена с запасным вариантом.
//
// navigator.clipboard доступен только в защищённом контексте (HTTPS/localhost)
// и может отклонить запрос (нет фокуса, отказ прав). Поэтому при недоступности
// или ошибке откатываемся на временный textarea + document.execCommand('copy') —
// устаревший, но работающий в старых браузерах и по HTTP способ.

/**
 * Копирует текст в буфер обмена. Возвращает true при успехе.
 * Никогда не бросает — вызывающий код решает, что показать пользователю.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Современный API отказал — пробуем запасной вариант ниже.
    }
  }

  return copyViaExecCommand(text);
}

function copyViaExecCommand(text: string): boolean {
  if (typeof document === 'undefined') return false;

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.top = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();

  try {
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    document.body.removeChild(textarea);
  }
}
