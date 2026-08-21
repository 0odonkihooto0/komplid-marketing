#!/usr/bin/env bash
set -euo pipefail

# Деплой на СОБСТВЕННЫЙ VDS — запасной путь.
# Основной хостинг — Timeweb App Platform: она сама тянет репозиторий и собирает
# образ из Dockerfile, этот скрипт там не нужен. Держим рабочим на случай
# переезда обратно на свой сервер (docs/timeweb-launch-plan.md).

# ─── Конфигурация ───────────────────────────────────────────────────────────
# Хост сервера Timeweb берётся из окружения, чтобы IP не лежал в репозитории:
#   export KOMPLID_DEPLOY_HOST="komplid@1.2.3.4"
SERVER_HOST="${KOMPLID_DEPLOY_HOST:-}"
PROJECT_DIR="${KOMPLID_DEPLOY_DIR:-/home/komplid/komplid-marketing}"
BRANCH="${1:-main}"
SITE_URL="${KOMPLID_SITE_URL:-https://komplid.ru/}"

if [ -z "${SERVER_HOST}" ]; then
  echo "ERROR: не задана переменная KOMPLID_DEPLOY_HOST."
  echo "       Пример: export KOMPLID_DEPLOY_HOST=\"komplid@1.2.3.4\""
  echo "       Без неё скрипт раньше молча уходил на несуществующий хост-заглушку."
  exit 1
fi

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
  # --env-file обязателен: build-args в компоузе подставляются из окружения шелла
  # или из файла .env рядом с компоузом, но НЕ из .env.production в env_file.
  # Без него сборка уходила с пустыми NEXT_PUBLIC_* и COMPANY_*, то есть без
  # Метрики и с дефолтными реквизитами в подвале.
  docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build

  echo '--- очистка старых образов ---'
  docker image prune -f
"

# ─── Проверка доступности ───────────────────────────────────────────────────
echo ">>> Ждём запуска контейнера (5 сек)..."
sleep 5

HTTP_STATUS=$(curl -o /dev/null -s -w "%{http_code}" "${SITE_URL}" || echo "000")

if [ "${HTTP_STATUS}" = "200" ]; then
  echo "OK: ${SITE_URL} отвечает 200"
else
  echo "WARN: ${SITE_URL} вернул HTTP ${HTTP_STATUS}"
  echo "      Проверь: ssh ${SERVER_HOST} 'docker logs komplid-marketing-web-1 --tail 50'"
fi

echo ">>> Деплой завершён."
