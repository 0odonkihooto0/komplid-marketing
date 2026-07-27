#!/usr/bin/env bash
# SessionEnd: коммитит и пушит только docs/memory/.
# Всё остальное — код, ассеты, чужие staged-правки — не трогает ни при каких условиях.
# Любая нештатная ситуация = молчаливый выход 0: хук не должен ломать завершение сессии.
set -uo pipefail

git rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0

# Пушим только с main. На ветке фичи память уедет вместе с её PR.
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")
[ "$BRANCH" = "main" ] || exit 0

[ -d "docs/memory" ] || exit 0

# Индексируем только память (нужно, чтобы подхватились новые файлы).
git add -A -- docs/memory >/dev/null 2>&1 || exit 0

# Нечего коммитить — выходим.
git diff --cached --quiet -- docs/memory 2>/dev/null && exit 0

# Форма `git commit -- <pathspec>` фиксирует только указанный путь и оставляет
# чужие staged-правки в индексе нетронутыми.
git commit -q -m "memory: обновление памяти проекта" -- docs/memory >/dev/null 2>&1 || exit 0

# Пуш без интерактива: при запросе логина git упадёт, а не подвиснет до таймаута.
# Не ушло — коммит остался локально и уедет со следующим пушем.
GIT_TERMINAL_PROMPT=0 timeout 25 git push -q origin main >/dev/null 2>&1 || exit 0

exit 0
