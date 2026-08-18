# komplid-marketing

Маркетинговый сайт [komplid.ru](https://komplid.ru) на Next.js 16.
Правила работы над проектом — в [`CLAUDE.md`](CLAUDE.md), полный план — в
[`MODULE_MARKETING_PLAN.md`](MODULE_MARKETING_PLAN.md).

## Локальный запуск

Перед первым запуском нужен `.env.local` — без него `docker compose` не стартует
вовсе (файл указан в `env_file`, а в репозиторий он не коммитится):

```bash
cp .env.example .env.local
```

Значения можно оставить пустыми: сайт поднимется, отвалятся только аналитика
и пересылка лидов в приложение.

```bash
docker compose up          # http://localhost:3200, hot reload
docker compose down        # остановить
```

Без Docker — то же самое напрямую:

```bash
npm ci
npm run dev
```

## Проверки

```bash
npx tsc --noEmit   # типы
npm test           # Vitest
npx next build     # финальная сборка
```

## Если после `git pull` сайт выглядит не так

Контейнер хранит `node_modules` в томе, который переживает пересоздание
контейнера, а Turbopack — кэш сборки, который не замечает правок, сделанных
пока контейнер стоял. Оба случая выглядят одинаково: страница открывается,
но часть стилей или зависимостей старые.

`docker/dev-entrypoint.sh` разбирается с этим сам — сверяет `package-lock.json`
с содержимым тома и чистит кэш сборки при старте. Если что-то всё же осталось:

```bash
docker compose down -v && docker compose up --build
```

`-v` сносит том с зависимостями; без него `--build` пересоберёт образ, но том
останется прежним.

## Деплой

Только вручную, с локальной машины: `./deploy.sh`. GitHub Actions гоняют
проверки на PR и на прод не ходят (`CLAUDE.md` §9, §13).
