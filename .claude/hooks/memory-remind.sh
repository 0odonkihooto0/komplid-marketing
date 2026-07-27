#!/usr/bin/env bash
# Stop: один раз за сессию напоминает обновить память, если в сессии правился код,
# а docs/memory/ — нет. Хук не может сам написать память, он только возвращает управление
# агенту с задачей это сделать.
set -uo pipefail

INPUT=$(cat 2>/dev/null || true)

# Защита от петли: если мы уже блокировали остановку, второй раз не вмешиваемся.
if printf '%s' "$INPUT" | grep -q '"stop_hook_active"[[:space:]]*:[[:space:]]*true'; then
  exit 0
fi

git rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0

# Есть ли правки вне памяти? Если сессия была только про чтение — молчим.
CHANGED=$(git status --porcelain 2>/dev/null | awk '{print $NF}' | grep -v '^docs/memory/' || true)
[ -n "$CHANGED" ] || exit 0

# Память уже трогали в этой сессии — напоминать не о чем.
MEMORY_TOUCHED=$(git status --porcelain -- docs/memory 2>/dev/null || true)
[ -z "$MEMORY_TOUCHED" ] || exit 0

SESSION_ID=$(printf '%s' "$INPUT" \
  | grep -o '"session_id"[[:space:]]*:[[:space:]]*"[^"]*"' \
  | head -1 | sed 's/.*"\([^"]*\)"$/\1/')
[ -n "$SESSION_ID" ] || SESSION_ID="unknown"

MARKER_DIR=".claude/.cache"
MARKER="$MARKER_DIR/memory-reminded-$SESSION_ID"
mkdir -p "$MARKER_DIR" 2>/dev/null || exit 0

# Напоминаем ровно один раз за сессию, иначе хук будет дёргать на каждом ходу.
[ -f "$MARKER" ] && exit 0
: > "$MARKER"

cat <<'JSON'
{"decision":"block","reason":"В этой сессии менялись файлы проекта, а docs/memory/ не обновлялась. Прежде чем завершать: реши, появился ли долгоживущий факт, которого нет ни в коде, ни в git, ни в CLAUDE.md (решение и его причина, договорённость, факт о смежном репозитории). Если да — заведи или обнови файл в docs/memory/ по правилам CLAUDE.md §20 и добавь строку в docs/memory/MEMORY.md. Если нет — просто скажи об этом и заверши работу, это нормальный исход."}
JSON
exit 0
