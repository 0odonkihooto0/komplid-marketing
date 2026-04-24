export function JsonLd({ data }: { data: Record<string, unknown> }) {
  // Экранируем символы, которые могут закрыть тег <script> и запустить произвольный JS.
  // JSON.stringify не экранирует <, > и &, поэтому злоумышленник мог бы вставить </script>
  // через title/description статьи. Unicode-эскейпы безопасны для JSON-парсеров.
  // U+2028/2029 — line terminators в ECMAScript, недопустимы в JS-строках внутри <script>.
  const safeJson = JSON.stringify(data)
    .replace(/[&<>]/g, (c) => (c === '&' ? '\\u0026' : c === '<' ? '\\u003c' : '\\u003e'))
    .split(' ')
    .join('\\u2028')
    .split(' ')
    .join('\\u2029');

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJson }}
    />
  );
}
