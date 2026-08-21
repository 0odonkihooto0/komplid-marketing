# Источники обложек блога

Обложки статей — со стока Unsplash, из бесплатной части (не Unsplash+).
[Лицензия Unsplash](https://unsplash.com/license) разрешает использование,
включая коммерческое, и не требует указания авторства — но происхождение
каждого файла мы фиксируем здесь: доказать его через полгода иначе будет нечем.

Файлы лежат в `public/images/blog/`, размер 1200×630 — это одновременно
превью карточки в списке блога и OG-картинка при репосте.

Пересобрать всё разом: `node scripts/fetch-blog-images.mjs`.
Добавляя статью с обложкой, дописывать фото в `PHOTOS` этого скрипта,
а не класть файл руками — иначе источник снова окажется неизвестен.

| Файл | Статья | Автор | Страница фото |
|---|---|---|---|
| `shablon-aosr.jpg` | [/blog/skachat-shablon-aosr](https://komplid.ru/blog/skachat-shablon-aosr) | Fiqih Alfarish | [Unsplash](https://unsplash.com/photos/two-women-in-hard-hats-review-documents-by-window-Z5-vI_pTIhA) |
| `kak-sravnit-smety-excel.jpg` | [/blog/kak-sravnit-smety-excel](https://komplid.ru/blog/kak-sravnit-smety-excel) | FIN | [Unsplash](https://unsplash.com/photos/a-calculator-sitting-on-top-of-a-pile-of-papers-741iShluYhk) |
| `ozr-s-telefona.jpg` | [/blog/ozr-s-telefona](https://komplid.ru/blog/ozr-s-telefona) | Albert Vinas | [Unsplash](https://unsplash.com/photos/construction-worker-in-hard-hat-sits-on-bucket-using-phone-DzYT1tfcDq4) |
| `kak-vesti-id-onlayn.jpg` | [/blog/kak-vesti-id-onlayn](https://komplid.ru/blog/kak-vesti-id-onlayn) | alan boyce | [Unsplash](https://unsplash.com/photos/two-construction-workers-review-plans-on-a-tablet-gyrKtgqMChY) |
| `sravnenie-komplid-cus.jpg` | [/blog/sravnenie-komplid-cus](https://komplid.ru/blog/sravnenie-komplid-cus) | Evgeniy Surzhan | [Unsplash](https://unsplash.com/photos/person-at-desk-viewing-monitor-lVWozBOVY2M) |

Альт-тексты (их же брать при вставке картинки в статью):

- `shablon-aosr.jpg` — Инженеры в касках разбирают документы на объекте
- `kak-sravnit-smety-excel.jpg` — Калькулятор на стопке расчётов
- `ozr-s-telefona.jpg` — Строитель в каске с телефоном на площадке
- `kak-vesti-id-onlayn.jpg` — Двое строителей смотрят документацию на планшете
- `sravnenie-komplid-cus.jpg` — Инженер за монитором выбирает систему
