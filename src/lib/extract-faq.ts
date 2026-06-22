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
// Регэкспы компилируем один раз на модуль, а не при каждом вызове функции.
const FAQ_SECTION_RE = /##\s+Частые\s+вопросы([\s\S]*?)(?=\n##\s|$)/i;
// Формат: **Вопрос?**\n\nОтвет до следующего **...?** или конца секции.
// Флаг `g` безопасен: matchAll работает с собственным итератором и не мутирует lastIndex.
const FAQ_ITEM_RE = /\*\*([^*]+\?)\*\*\s*\n+([\s\S]+?)(?=\n\*\*[^*]+\?\*\*|$)/g;

export function extractFaqFromContent(content: string): ExtractedFaq[] {
  const faqSectionMatch = content.match(FAQ_SECTION_RE);
  if (!faqSectionMatch?.[1]) return [];

  const section = faqSectionMatch[1];
  const faqs: ExtractedFaq[] = [];

  for (const match of section.matchAll(FAQ_ITEM_RE)) {
    const question = match[1]?.trim();
    const answer = match[2]?.trim().replace(/\n+/g, ' ');
    if (question && answer) {
      faqs.push({ question, answer });
    }
  }

  return faqs;
}
