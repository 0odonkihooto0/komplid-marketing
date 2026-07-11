// Чистая логика оглавления статьи — без React и DOM, чтобы покрыть тестами
// генерацию якорей отдельно от рендера (CLAUDE.md §10: разделение UI и логики).

export interface TocEntry {
  level: 2 | 3;
  text: string;
  id: string;
}

/**
 * Slug якоря заголовка. Обязан давать те же id, что rehype-slug
 * (github-slugger) при рендере статьи — иначе ссылки оглавления бьют мимо:
 * кириллица и цифры сохраняются, пунктуация удаляется, каждый пробельный
 * символ заменяется дефисом (без схлопывания повторов — так делает
 * github-slugger). Класс \p{L}/\p{N} вместо \w — \w без флага `u`
 * покрывает только латиницу и превращал бы русские заголовки в «-».
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s_-]/gu, '')
    .replace(/\s/g, '-');
}

const H2_RE = /^##\s+(.+)$/;
const H3_RE = /^###\s+(.+)$/;

/** Извлекает H2/H3-заголовки из MDX-контента для оглавления. */
export function extractHeadings(content: string): TocEntry[] {
  const headings: TocEntry[] = [];
  const lines = content.split('\n');

  for (const line of lines) {
    // Подавляющее большинство строк MDX — не заголовки; дешёвая проверка до regex.
    if (line.charCodeAt(0) !== 35 /* '#' */) continue;

    const h2 = line.match(H2_RE);
    const h3 = line.match(H3_RE);

    if (h2?.[1]) {
      headings.push({ level: 2, text: h2[1].trim(), id: slugify(h2[1]) });
    } else if (h3?.[1]) {
      headings.push({ level: 3, text: h3[1].trim(), id: slugify(h3[1]) });
    }
  }

  return headings;
}
