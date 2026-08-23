/**
 * Растровые иконки и OG-картинка из брендовых SVG.
 *
 * Текст нигде не набирается шрифтом: слово «КОМПЛИД» берётся из
 * komplid-wordmark-outlined-*.svg, где начертание переведено в кривые.
 * Иначе результат зависел бы от того, установлена ли Geologica в системе.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import sharp from 'sharp';

const BRAND = 'public/brand';
const OUT_ICONS = 'public/icons';
const OUT_OG = 'public/og-images';
mkdirSync(OUT_ICONS, { recursive: true });
mkdirSync(OUT_OG, { recursive: true });

const MARK =
  'M4.2 49.8A11 11 0 0 1 19.8 34.2L51 65.4Q76 40 107.2 9.2A4 4 0 0 1 112.8 14.8Q80 53 54.5 84.5Q41 86.6 38.2 83.8Z';
const INK = '#1B1F26';
const AMBER = '#F5A524';

/** Внутренности <g> с контурами слова — вынимаем из готового файла в кривых. */
function wordmarkPaths() {
  const src = readFileSync(`${BRAND}/komplid-wordmark-outlined-light.svg`, 'utf8');
  const m = src.match(/<g fill="[^"]*">([\s\S]*?)<\/g>\s*<\/svg>/);
  if (!m) throw new Error('не нашёл контуры начертания');
  return m[1];
}

async function png(svg, file, width, height) {
  await sharp(Buffer.from(svg)).resize(width, height).png({ compressionLevel: 9 }).toFile(file);
  console.log('  ', file);
}

const iconSvg = readFileSync(`${BRAND}/komplid-icon-dark.svg`, 'utf8');

// Маскируемая иконка: знак ужат в безопасную зону 80%, вокруг поле фона —
// иначе Android обрежет галочку при круглой маске.
const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" fill="${INK}"/>
  <g transform="translate(122 182) scale(2.34)"><path d="${MARK}" fill="${AMBER}"/></g>
</svg>`;

// Логотип для Schema.org: Google ждёт растр, поэтому знак и слово на плашке.
const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" fill="${INK}"/>
  <g transform="translate(112 150) scale(2.45)"><path d="${MARK}" fill="${AMBER}"/></g>
  <g transform="translate(76 300) scale(0.489)" fill="#F7F7F8">${wordmarkPaths()}</g>
</svg>`;

// OG-превью 1200×630 для соцсетей и мессенджеров.
const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <rect width="1200" height="630" fill="${INK}"/>
  <g stroke="#2A2F38" stroke-width="1">
    ${Array.from({ length: 25 }, (_, i) => `<line x1="${i * 48}" y1="0" x2="${i * 48}" y2="630"/>`).join('')}
    ${Array.from({ length: 14 }, (_, i) => `<line x1="0" y1="${i * 48}" x2="1200" y2="${i * 48}"/>`).join('')}
  </g>
  <g transform="translate(96 246) scale(1.15)"><path d="${MARK}" fill="${AMBER}"/></g>
  <g transform="translate(246 250) scale(0.66)" fill="#F7F7F8">${wordmarkPaths()}</g>
  <rect x="96" y="430" width="1008" height="1" fill="#2A2F38"/>
  <rect x="96" y="470" width="168" height="8" rx="4" fill="${AMBER}"/>
</svg>`;
// Подписи на превью не набираются: шрифтов в системе сборки нет, а рисовать
// текст контурами ради одной строки не стоит. Карточка держится на знаке.

console.log('иконки:');
await png(iconSvg, `${OUT_ICONS}/icon-192.png`, 192, 192);
await png(iconSvg, `${OUT_ICONS}/icon-512.png`, 512, 512);
await png(maskableSvg, `${OUT_ICONS}/icon-512-maskable.png`, 512, 512);
await png(logoSvg, `${OUT_ICONS}/logo-512.png`, 512, 512);
// apple-touch-icon: соглашение об именах Next принимает только растр, поэтому
// файл кладётся прямо в src/app — SVG там молча игнорируется и отдаёт 404.
// 192 вместо рекомендованных Apple 180: тот же размер, что у иконки PWA,
// iOS масштабирует без потерь, а в репозитории не появляется третий вариант знака.
await png(iconSvg, 'src/app/apple-icon.png', 192, 192);
console.log('og:');
await png(ogSvg, `${OUT_OG}/default.png`, 1200, 630);

writeFileSync(`${OUT_OG}/.gitkeep`, '');
