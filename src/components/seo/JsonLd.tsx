// Line terminators ECMAScript (U+2028/U+2029) — недопустимы в JS-строках внутри
// <script>, поэтому их (как и &, <, >) экранируем юникод-эскейпами. Символы строим
// через fromCharCode, чтобы не вставлять реальные U+2028/U+2029 в исходник.
const LS = String.fromCharCode(0x2028);
const PS = String.fromCharCode(0x2029);

const ESCAPE_MAP: Record<string, string> = {
  '&': '\\u0026',
  '<': '\\u003c',
  '>': '\\u003e',
  [LS]: '\\u2028',
  [PS]: '\\u2029',
};

const SCRIPT_UNSAFE = new RegExp('[&<>' + LS + PS + ']', 'g');

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  // JSON.stringify не экранирует <, >, &, поэтому злоумышленник мог бы закрыть тег
  // через title/description статьи. Юникод-эскейпы безопасны для JSON-парсеров.
  const safeJson = JSON.stringify(data).replace(SCRIPT_UNSAFE, (c) => ESCAPE_MAP[c] ?? c);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJson }}
    />
  );
}
