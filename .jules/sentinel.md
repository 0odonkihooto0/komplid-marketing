## 2026-04-23 - JSON-LD XSS Vulnerability
**Vulnerability:** XSS via unsafe JSON serialization in `<script type="application/ld+json">` tag.
**Learning:** `JSON.stringify` does not escape HTML control characters (`<`, `>`, `&`). If user input contains a closing script tag `</script>` followed by an opening tag `<script>`, it breaks out of the JSON context resulting in XSS.
**Prevention:** Sanitize the serialized JSON string by replacing dangerous characters (`<`, `>`, `&`, line terminators) with their unicode escape sequences before passing it to `dangerouslySetInnerHTML`.
