/**
 * Сообщить Яндексу о страницах сайта через IndexNow — без ожидания,
 * пока робот сам дойдёт до sitemap.
 *
 * Зачем: за первый месяц Яндекс загрузил 7 страниц из 427. Sitemap у него
 * висел с «0 ссылок» от 25.08.2026, а обычный переобход в Вебмастере ограничен
 * дневным лимитом. IndexNow принимает до 10 000 адресов за запрос, и Яндекс
 * ставит их в обход в течение нескольких дней. Протокол общий: Яндекс сам
 * пересылает адреса остальным участникам (Bing, Seznam, Naver). Google его
 * не поддерживает — там только sitemap и «Запросить индексирование».
 *
 * Ключ — файл public/<KEY>.txt, отдаётся по https://komplid.ru/<KEY>.txt.
 * Ключ не секрет: протокол требует, чтобы он был публичным. Им доказывается
 * только то, что отправитель управляет сайтом.
 *
 * Запускается с машины владельца ПОСЛЕ выката (файл ключа должен быть уже
 * на проде, иначе Яндекс ответит 403):
 *   node scripts/indexnow.mjs                  все адреса из живого sitemap —
 *                                              один раз, при первом подключении
 *   node scripts/indexnow.mjs <url> [<url>…]   только новые и изменённые
 *                                              страницы — так в дальнейшем
 *   node scripts/indexnow.mjs --dry-run        показать, что ушло бы, без отправки
 *   node scripts/indexnow.mjs --sitemap=http://localhost:3200/sitemap.xml --dry-run
 *
 * Весь sitemap повторно не отправлять: IndexNow — сигнал об изменениях,
 * а не список сайта. Слать неизменившиеся адреса снова и снова бесполезно.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const HOST = 'komplid.ru';
const KEY = '26cde43e216153bd01a3813acc364e2d';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const ENDPOINT = 'https://yandex.com/indexnow';
// Предел протокола на один запрос
const BATCH = 10_000;

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const sitemapArg = args.find((a) => a.startsWith('--sitemap='));
const sitemapUrl = sitemapArg ? sitemapArg.slice('--sitemap='.length) : `https://${HOST}/sitemap.xml`;
const explicitUrls = args.filter((a) => !a.startsWith('--'));

/** Файл ключа в репозитории и константа выше не должны разъехаться. */
function checkLocalKeyFile() {
  const path = fileURLToPath(new URL(`../public/${KEY}.txt`, import.meta.url));
  const content = readFileSync(path, 'utf-8').trim();
  if (content !== KEY) {
    throw new Error(`public/${KEY}.txt содержит не тот ключ`);
  }
}

/** Файл ключа уже на проде? Без него Яндекс вернёт 403 на весь пакет. */
async function checkLiveKeyFile() {
  try {
    const res = await fetch(KEY_LOCATION);
    const text = (await res.text()).trim();
    return res.ok && text === KEY;
  } catch {
    return false;
  }
}

async function urlsFromSitemap(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`sitemap ${url} ответил ${res.status}`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1].replaceAll('&amp;', '&'));
}

/** Только наш хост: один чужой адрес — и Яндекс отклоняет пакет целиком (422). */
function ownUrls(urls) {
  const seen = new Set();
  const out = [];
  for (const raw of urls) {
    let u;
    try {
      u = new URL(raw);
    } catch {
      console.warn(`  пропущен, не адрес: ${raw}`);
      continue;
    }
    if (u.protocol !== 'https:' || u.hostname !== HOST) {
      console.warn(`  пропущен, чужой хост: ${raw}`);
      continue;
    }
    if (!seen.has(u.href)) {
      seen.add(u.href);
      out.push(u.href);
    }
  }
  return out;
}

const RESPONSES = {
  200: 'принято, ключ проверен',
  202: 'принято, ключ ещё проверяется — повторять не нужно',
  400: 'неверный формат запроса',
  403: `ключ не подтверждён — открывается ли ${KEY_LOCATION}? Сначала выкатите сайт`,
  422: 'адреса не относятся к хосту или ключ не подходит к ним',
  429: 'слишком часто — повторите позже',
};

async function submit(urlList) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList }),
  });
  const note = RESPONSES[res.status] ?? (await res.text()).slice(0, 300);
  return { ok: res.status === 200 || res.status === 202, status: res.status, note };
}

async function main() {
  checkLocalKeyFile();

  const source = explicitUrls.length > 0 ? explicitUrls : await urlsFromSitemap(sitemapUrl);
  const urls = ownUrls(source);
  console.log(`Адресов к отправке: ${urls.length}` + (explicitUrls.length ? '' : ` (из ${sitemapUrl})`));
  if (urls.length === 0) return;

  if (!(await checkLiveKeyFile())) {
    const msg = `Файл ключа ${KEY_LOCATION} не отдаётся или не совпадает с ключом.`;
    if (!dryRun) throw new Error(`${msg} Выкатите сайт и повторите.`);
    console.warn(`  внимание: ${msg}`);
  }

  if (dryRun) {
    for (const u of urls.slice(0, 20)) console.log(`  ${u}`);
    if (urls.length > 20) console.log(`  … и ещё ${urls.length - 20}`);
    console.log('--dry-run: ничего не отправлено');
    return;
  }

  let failed = false;
  for (let i = 0; i < urls.length; i += BATCH) {
    const chunk = urls.slice(i, i + BATCH);
    const { ok, status, note } = await submit(chunk);
    console.log(`  ${chunk.length} адресов → ${status}: ${note}`);
    if (!ok) failed = true;
  }
  if (failed) process.exitCode = 1;
}

main().catch((err) => {
  console.error(`Ошибка: ${err.message}`);
  process.exitCode = 1;
});
