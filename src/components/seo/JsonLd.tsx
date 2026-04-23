export function JsonLd({ data }: { data: Record<string, unknown> }) {
  // Prevent XSS by escaping HTML entities in JSON-LD
  // This is critical since JSON.stringify doesn't escape HTML tags
  const safeJsonLd = JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd }}
    />
  );
}
