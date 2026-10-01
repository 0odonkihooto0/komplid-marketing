/**
 * Даты последней содержательной правки страниц, у которых своей даты в контенте нет.
 * Идут в <lastmod> раздельных sitemap (src/lib/sitemap.ts).
 *
 * Даты НЕ должны меняться от сборки к сборке: дата «на момент сборки» объявляет
 * изменённым весь сайт при каждом выкате, и Google перестаёт верить lastmod
 * вовсе — в том числе честным датам статей.
 *
 * Начальные значения 01.10.2026 сняты из истории git: дата, когда последняя
 * правка текста страницы (её page.tsx, данные, виджет) попала в main. Дальше
 * ведутся руками:
 *  - поменяли текст, формулу, FAQ страницы — обновите её дату;
 *  - добавили страницу — добавьте строку с датой публикации. Без неё
 *    упадёт тест src/lib/sitemap.test.ts;
 *  - правки вёрстки, шапки и подвала датой не считаются — это не изменение
 *    содержания для поисковика.
 *
 * Статей блога, шаблонов и документов СП здесь нет: их даты — в frontmatter
 * (publishedAt / modifiedAt) и в реестре корпуса.
 */
export const PAGE_UPDATED_AT: Readonly<Record<string, string>> = {
  // Главная и посадочные
  '/': '2026-08-23',
  '/smetchik': '2026-08-18',
  '/pto': '2026-08-21',
  '/prorab': '2026-08-21',
  '/pricing': '2026-08-17',
  '/solutions/general-contractor': '2026-08-17',
  '/solutions/customer': '2026-08-17',
  '/solutions/technical-supervisor': '2026-08-17',
  '/solutions/designer': '2026-08-17',
  '/company/about': '2026-08-23',
  '/company/contact': '2026-08-23',
  '/legal/privacy': '2026-08-21',
  '/legal/terms': '2026-08-21',
  '/legal/oferta': '2026-08-21',
  // Хабы разделов — своя дата; в sitemap берётся позднейшая из неё и дат дочерних страниц
  '/blog': '2026-08-23',
  '/shablony': '2026-08-23',
  '/normativ': '2026-08-23',
  '/kalkulyator': '2026-08-23',
  '/formy': '2026-08-17',
  '/glossariy': '2026-08-17',
  '/isup': '2026-08-17',
  // Калькуляторы — файл данных и виджет
  '/kalkulyator/smeta-avans': '2026-08-17',
  '/kalkulyator/ks2-ndsfree': '2026-08-17',
  '/kalkulyator/rabochie-dni': '2026-08-17',
  '/kalkulyator/neustoyka-podryad': '2026-08-17',
  '/kalkulyator/prosrochka-sdachi': '2026-08-17',
  '/kalkulyator/garantiynoe-uderzhanie': '2026-08-17',
  '/kalkulyator/trudozatraty': '2026-08-17',
  '/kalkulyator/zimnee-udorozhanie': '2026-08-17',
  '/kalkulyator/obem-betona': '2026-08-17',
  '/kalkulyator/armatura': '2026-08-17',
  '/kalkulyator/kirpich-na-stenu': '2026-08-17',
  '/kalkulyator/rashod-shtukaturki': '2026-08-17',
  '/kalkulyator/plitka': '2026-08-17',
  '/kalkulyator/laminat': '2026-08-17',
  '/kalkulyator/oboi': '2026-08-17',
  '/kalkulyator/kraska': '2026-08-17',
  '/kalkulyator/kotlovan': '2026-08-17',
  '/kalkulyator/krovlya': '2026-08-17',
  '/kalkulyator/snegovaya-nagruzka': '2026-08-17',
  '/kalkulyator/vetrovaya-nagruzka': '2026-08-17',
  '/kalkulyator/pandus': '2026-08-17',
  '/kalkulyator/lestnitsa': '2026-08-17',
  // Формы ИД
  '/formy/aosr': '2026-08-21',
  '/formy/aook': '2026-08-21',
  '/formy/ozhr': '2026-08-21',
  '/formy/ispolnitelnaya-shema': '2026-08-17',
  '/formy/protokol-prochnosti': '2026-08-17',
  '/formy/zhurnal-betonnyh-rabot': '2026-08-21',
  '/formy/predpisanie': '2026-08-17',
  '/formy/reestr-id': '2026-08-17',
  // Глоссарий
  '/glossariy/aosr': '2026-08-17',
  '/glossariy/aook': '2026-08-17',
  '/glossariy/zahvatka': '2026-08-17',
  '/glossariy/ispolnitelnaya-shema': '2026-08-17',
  '/glossariy/ozhr': '2026-08-17',
  '/glossariy/predpisanie': '2026-08-17',
  '/glossariy/protokol-prochnosti': '2026-08-17',
  '/glossariy/reestr-id': '2026-08-17',
  '/glossariy/skrytye-raboty': '2026-08-17',
  '/glossariy/stroitelnyj-kontrol': '2026-08-18',
  // Схемы ИСУП
  '/isup/aosr': '2026-08-17',
  '/isup/aook': '2026-08-17',
  '/isup/ozhr': '2026-08-17',
  '/isup/ks2': '2026-08-17',
  '/isup/ks3': '2026-08-17',
  '/isup/geo': '2026-08-17',
  // Разборы пунктов СП
  '/normativ/sp-48-13330-2019/p-6-13': '2026-08-17',
  '/normativ/sp-48-13330-2019/p-6-14': '2026-08-17',
  '/normativ/sp-48-13330-2019/p-7-6': '2026-08-17',
  '/normativ/sp-70-13330-2012/p-5-18': '2026-08-17',
  '/normativ/sp-70-13330-2012/p-5-25': '2026-08-17',
  '/normativ/sp-45-13330-2017/p-6-4': '2026-08-17',
  '/normativ/sp-126-13330-2017/p-5-12': '2026-08-17',
};
