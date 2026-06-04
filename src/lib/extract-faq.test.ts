import { describe, it, expect } from 'vitest';
import { extractFaqFromContent } from './extract-faq';

describe('extractFaqFromContent', () => {
  it('извлекает несколько вопросов и ответов', () => {
    const content = `
Вступление статьи.

## Частые вопросы

**Что такое АОСР?**

Это акт освидетельствования скрытых работ.

**Кто подписывает АОСР?**

Подрядчик, заказчик и
строительный контроль.
`;
    const faqs = extractFaqFromContent(content);
    expect(faqs).toHaveLength(2);
    expect(faqs[0]).toEqual({
      question: 'Что такое АОСР?',
      answer: 'Это акт освидетельствования скрытых работ.',
    });
    // Перенос строки внутри ответа схлопывается в пробел
    expect(faqs[1]?.answer).toBe('Подрядчик, заказчик и строительный контроль.');
  });

  it('возвращает пустой массив без секции "Частые вопросы"', () => {
    const content = '## Что-то другое\n\nТекст без FAQ.';
    expect(extractFaqFromContent(content)).toEqual([]);
  });

  it('возвращает пустой массив, если в секции нет пар **Вопрос?**', () => {
    const content = '## Частые вопросы\n\nПросто текст без жирных вопросов.';
    expect(extractFaqFromContent(content)).toEqual([]);
  });

  it('игнорирует жирный заголовок без знака вопроса', () => {
    const content = '## Частые вопросы\n\n**Просто заголовок**\n\nКакой-то текст.';
    expect(extractFaqFromContent(content)).toEqual([]);
  });

  it('завершает секцию на следующем H2 и не цепляет посторонний текст', () => {
    const content = `## Частые вопросы

**Вопрос один?**

Ответ один.

## Заключение

Финальный текст, не относящийся к FAQ.`;
    const faqs = extractFaqFromContent(content);
    expect(faqs).toHaveLength(1);
    expect(faqs[0]?.answer).toBe('Ответ один.');
  });

  it('сохраняет жирный текст внутри ответа и не разрывает по нему', () => {
    const content = `## Частые вопросы

**Можно ли подписать ЭЦП?**

Да, через **КриптоПро** и МЧД.`;
    const faqs = extractFaqFromContent(content);
    expect(faqs).toHaveLength(1);
    expect(faqs[0]?.answer).toBe('Да, через **КриптоПро** и МЧД.');
  });
});
