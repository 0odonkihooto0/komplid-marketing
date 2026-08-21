/**
 * Обложки статей блога — со стока Unsplash, одним прогоном.
 *
 * Картинка статьи работает дважды: превью карточки в списке блога и OG-картинка
 * при репосте в мессенджер. До этого все пять файлов лежали пустыми (0 байт),
 * то есть репост статьи выглядел битым.
 *
 * Прямые ссылки на файлы зашиты, а не вычисляются из страницы фото: страницы
 * unsplash.com отдают анти-бот заглушку (HTTP 401 «Making sure you're not a
 * bot»), тогда как CDN images.unsplash.com открыт. Адрес страницы и автор
 * хранятся рядом — из них собирается docs/blog-images-sources.md.
 *
 * Прогон разовый, результат коммитится:
 *   node scripts/fetch-blog-images.mjs
 */
import { writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';

const OUT = 'public/images/blog';

/**
 * Тянем curl'ом, а не встроенным fetch: на рабочей машине undici упирается
 * в ConnectTimeoutError на images.unsplash.com, а curl тот же адрес открывает.
 */
function download(url) {
  return execFileSync('curl', ['-sL', '--max-time', '60', '-A', 'Mozilla/5.0', url], {
    encoding: 'buffer',
    maxBuffer: 64 * 1024 * 1024,
  });
}

/** Все пять — из бесплатной части Unsplash. Файлы с plus.unsplash.com брать нельзя. */
const PHOTOS = [
  {
    file: 'shablon-aosr.jpg',
    article: '/blog/skachat-shablon-aosr',
    src: 'https://images.unsplash.com/photo-1774600166588-1db444bda799',
    page: 'https://unsplash.com/photos/two-women-in-hard-hats-review-documents-by-window-Z5-vI_pTIhA',
    author: 'Fiqih Alfarish',
    alt: 'Инженеры в касках разбирают документы на объекте',
  },
  {
    // Два кандидата отпали: на ноутбуке с таблицей читались «Google Analytics»
    // и «Facebook Ads» (чужие бренды, а Meta в РФ признана экстремистской),
    // на втором кадре лежали американские налоговые формы IRS — к сметам
    // отношения не имеющие. Нужен нейтральный кадр расчётов без текста.
    file: 'kak-sravnit-smety-excel.jpg',
    article: '/blog/kak-sravnit-smety-excel',
    src: 'https://images.unsplash.com/photo-1642043175009-5997b3a078d8',
    page: 'https://unsplash.com/photos/a-calculator-sitting-on-top-of-a-pile-of-papers-741iShluYhk',
    author: 'FIN',
    alt: 'Калькулятор на стопке расчётов',
  },
  {
    // Все кадры «прораб со смартфоном на объекте», подходившие идеально,
    // оказались из платного Unsplash+ (Getty). Из бесплатных перебраны ещё
    // два: у одного обрезка съедала каску и площадку, у другого рабочий стоял
    // на ярко-красном студийном фоне — с палитрой сайта он не сходится вовсе.
    // Этот снят на реальной площадке: каска, барьеры, телефон в руках.
    file: 'ozr-s-telefona.jpg',
    article: '/blog/ozr-s-telefona',
    src: 'https://images.unsplash.com/photo-1758876734777-dcc6981f3671',
    page: 'https://unsplash.com/photos/construction-worker-in-hard-hat-sits-on-bucket-using-phone-DzYT1tfcDq4',
    author: 'Albert Vinas',
    alt: 'Строитель в каске с телефоном на площадке',
  },
  {
    file: 'kak-vesti-id-onlayn.jpg',
    article: '/blog/kak-vesti-id-onlayn',
    src: 'https://images.unsplash.com/photo-1778074762022-c33cc42f79ae',
    page: 'https://unsplash.com/photos/two-construction-workers-review-plans-on-a-tablet-gyrKtgqMChY',
    author: 'alan boyce',
    alt: 'Двое строителей смотрят документацию на планшете',
  },
  {
    file: 'sravnenie-komplid-cus.jpg',
    article: '/blog/sravnenie-komplid-cus',
    src: 'https://images.unsplash.com/photo-1618385455730-2571c38966b7',
    page: 'https://unsplash.com/photos/person-at-desk-viewing-monitor-lVWozBOVY2M',
    author: 'Evgeniy Surzhan',
    alt: 'Инженер за монитором выбирает систему',
  },
];

for (const photo of PHOTOS) {
  // Кадрирование просим у самого Unsplash: их imgix режет по содержимому,
  // а не по центру, и лица не обрезаются пополам.
  const buf = download(`${photo.src}?w=1200&h=630&fit=crop&crop=entropy&q=85&fm=jpg`);
  if (buf.length < 10_000) throw new Error(`подозрительно маленький ответ: ${photo.src}`);

  // Через sharp — чтобы размер был гарантированно 1200×630 (OG-формат),
  // а не тем, что вернул сток.
  const out = await sharp(buf)
    .resize(1200, 630, { fit: 'cover' })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
  writeFileSync(`${OUT}/${photo.file}`, out);

  console.log(`  ${photo.file} · ${(out.length / 1024).toFixed(0)} КБ · ${photo.author}`);
}

const doc = `# Источники обложек блога

Обложки статей — со стока Unsplash, из бесплатной части (не Unsplash+).
[Лицензия Unsplash](https://unsplash.com/license) разрешает использование,
включая коммерческое, и не требует указания авторства — но происхождение
каждого файла мы фиксируем здесь: доказать его через полгода иначе будет нечем.

Файлы лежат в \`public/images/blog/\`, размер 1200×630 — это одновременно
превью карточки в списке блога и OG-картинка при репосте.

Пересобрать всё разом: \`node scripts/fetch-blog-images.mjs\`.
Добавляя статью с обложкой, дописывать фото в \`PHOTOS\` этого скрипта,
а не класть файл руками — иначе источник снова окажется неизвестен.

| Файл | Статья | Автор | Страница фото |
|---|---|---|---|
${PHOTOS.map((r) => `| \`${r.file}\` | [${r.article}](https://komplid.ru${r.article}) | ${r.author} | [Unsplash](${r.page}) |`).join('\n')}

Альт-тексты (их же брать при вставке картинки в статью):

${PHOTOS.map((r) => `- \`${r.file}\` — ${r.alt}`).join('\n')}
`;

writeFileSync('docs/blog-images-sources.md', doc);
console.log('\ndocs/blog-images-sources.md обновлён');
