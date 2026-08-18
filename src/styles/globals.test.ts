import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

/**
 * Комментарии в CSS должны быть закрыты ровно там, где задумано.
 *
 * Зачем тест: закрывающую пару «звёздочка-слэш» легко получить в тексте
 * случайно — например, перечисляя семейства токенов «--bg-*» и «--ink-*»
 * через слэш без пробелов. Комментарий обрывается на
 * середине фразы, остаток парсится как CSS, и дальше страдает весь файл.
 * Глазами это не видно, а `next build` такую ошибку глотает: прод-сборка молча
 * выбрасывает часть правил (в нашем случае терялось 129 строк, включая утилиты
 * .border-border и .bg-card), и падает только дев-сервер на Turbopack.
 */
const CSS_FILE = path.join(process.cwd(), 'src/styles/globals.css');

/** Закрытия комментария вне комментария и незакрытые открытия — смещения в файле. */
function scanComments(css: string): { strayClose: number[]; unclosedOpen: number[] } {
  const strayClose: number[] = [];
  const unclosedOpen: number[] = [];
  let inComment = false;
  let openedAt = -1;

  for (let i = 0; i < css.length - 1; i += 1) {
    const pair = css.slice(i, i + 2);
    if (!inComment && pair === '/*') {
      inComment = true;
      openedAt = i;
      i += 1;
    } else if (inComment && pair === '*/') {
      inComment = false;
      i += 1;
    } else if (!inComment && pair === '*/') {
      strayClose.push(i);
      i += 1;
    }
  }
  if (inComment) unclosedOpen.push(openedAt);

  return { strayClose, unclosedOpen };
}

/** Номер строки по смещению — чтобы в отчёте теста было куда идти. */
function lineAt(css: string, offset: number): number {
  return css.slice(0, offset).split('\n').length;
}

describe('src/styles/globals.css', () => {
  const css = readFileSync(CSS_FILE, 'utf8');

  it('не содержит `*/` вне комментария', () => {
    const { strayClose } = scanComments(css);
    expect(strayClose.map((o) => lineAt(css, o))).toEqual([]);
  });

  it('не содержит незакрытых комментариев', () => {
    const { unclosedOpen } = scanComments(css);
    expect(unclosedOpen.map((o) => lineAt(css, o))).toEqual([]);
  });

  // Ловит ровно тот случай, который сломал сборку: перечисление токенов
  // со звёздочкой, вплотную прижатой к слэшу.
  it('не содержит последовательности `*/` в перечислениях токенов', () => {
    expect(css).not.toMatch(/--[\w-]+\*\//);
  });
});
