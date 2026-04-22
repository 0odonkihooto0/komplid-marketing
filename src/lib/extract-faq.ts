export interface ExtractedFaq {
  question: string;
  answer: string;
}

/**
 * Извлекает FAQ из MDX-контента статьи.
 * Ожидает секцию "## Частые вопросы" с форматом:
 *   **Вопрос?**
 *
 *   Ответ текст...
 */
export function extractFaqFromContent(content: string): ExtractedFaq[] {
  const faqSectionMatch = content.match(
    /##\s+Частые\s+вопросы([\s\S]*?)(?=\n##\s|$)/i
  );
  if (!faqSectionMatch?.[1]) return [];

  const section = faqSectionMatch[1];
  const faqs: ExtractedFaq[] = [];

  // Формат: **Вопрос?**\n\nОтвет до следующего **...?** или конца секции
  const pattern = /\*\*([^*]+\?)\*\*\s*\n+([\s\S]+?)(?=\n\*\*[^*]+\?\*\*|$)/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(section)) !== null) {
    const question = match[1]?.trim();
    const answer = match[2]?.trim().replace(/\n+/g, ' ');
    if (question && answer) {
      faqs.push({ question, answer });
    }
  }

  return faqs;
}
