#!/usr/bin/env bash
# SessionStart: кладёт индекс памяти проекта в контекст новой сессии.
# Только индекс — сами факты агент читает по мере надобности, чтобы не жечь контекст.
set -uo pipefail

INDEX="docs/memory/MEMORY.md"
[ -f "$INDEX" ] || exit 0

echo "## Память проекта — индекс (docs/memory/)"
echo
cat "$INDEX"
echo
echo "Файлы памяти читать по ссылкам выше при необходимости. Правила ведения — CLAUDE.md §20."
exit 0
