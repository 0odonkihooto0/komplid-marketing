#!/usr/bin/env bash
set -euo pipefail

# ─── Конфигурация ───────────────────────────────────────────────────────────
# Замени на реальный хост после настройки сервера Timeweb (Шаг 1.5.2)
SERVER_HOST="komplid@YOUR_SERVER_IP"
PROJECT_DIR="/home/komplid/komplid-marketing"
BRANCH="${1:-main}"

# ─── Локальные проверки ─────────────────────────────────────────────────────
echo ">>> Проверяем незакоммиченные изменения..."
if [ -n "$(git status --porcelain)" ]; then
  echo "ERROR: Есть незакоммиченные изменения. Закоммить или stash перед деплоем."
  git status --short
  exit 1
fi

echo ">>> Пушим ветку '${BRANCH}' в origin..."
git push origin "${BRANCH}"

# ─── Деплой на сервер ───────────────────────────────────────────────────────
echo ">>> Деплоим на ${SERVER_HOST}..."
ssh "${SERVER_HOST}" "
  set -euo pipefail
  cd ${PROJECT_DIR}

  echo '--- git fetch + reset ---'
  git fetch origin
  git reset --hard origin/${BRANCH}

  echo '--- docker compose build + up ---'
  docker compose -f docker-compose.prod.yml up -d --build

  echo '--- очистка старых образов ---'
  docker image prune -f
"

# ─── Проверка доступности ───────────────────────────────────────────────────
echo ">>> Ждём запуска контейнера (5 сек)..."
sleep 5

HTTP_STATUS=$(curl -o /dev/null -s -w "%{http_code}" https://komplid.ru/ || echo "000")

if [ "${HTTP_STATUS}" = "200" ]; then
  echo "OK: https://komplid.ru/ отвечает 200"
else
  echo "WARN: https://komplid.ru/ вернул HTTP ${HTTP_STATUS}"
  echo "      Проверь: ssh ${SERVER_HOST} 'docker logs komplid-marketing-web-1 --tail 50'"
fi

echo ">>> Деплой завершён."
