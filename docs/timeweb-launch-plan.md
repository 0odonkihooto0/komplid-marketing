# Запуск komplid.ru на Timeweb — пошаговый план

> Runbook первого выката. Всё, что ниже, — по состоянию репозитория на 2026-08-20.
> Правила проекта — `CLAUDE.md` §13 (деплой), §21 (честность заявлений),
> §19 (раздел `/normativ`). Локальный запуск и типовые грабли — `README.md`.

Деплой в проекте **ручной**: `./deploy.sh` с локальной машины. GitHub Actions
гоняют только проверки на PR и на сервер не ходят — это решение зафиксировано
(`CLAUDE.md` §9), план его не меняет.

---

## 0. Что уже готово в репозитории

Переделывать не нужно, только пользоваться:

| Что | Файл | Состояние |
|---|---|---|
| Прод-образ (multi-stage, `next start`) | `Dockerfile` | готов |
| Прод-запуск, порт 3100, том для лидов | `docker-compose.prod.yml` | готов |
| Деплой по SSH с проверкой доступности | `deploy.sh` | готов, хост из `KOMPLID_DEPLOY_HOST` |
| Локальный просмотр в прод-режиме | `docker-compose.preview.yml` | готов |
| Проверки на PR (tsc + test + build) | `.github/workflows/ci.yml` | готов |
| Предполётная проверка | скилл `/preflight` | готов |
| Корпус СП: 323 страницы, rewrite, sitemap | `public/normativ/**`, `next.config.mjs` | готов, 354 МБ |
| Хранилище лидов на диске + счётчик мест | `src/lib/leads-store.ts`, `/api/waitlist-seats` | готово |

Чего в репозитории нет и не будет: конфига nginx, сертификатов, `.env.production`.
Это живёт на сервере.

---

## Критический путь

```
Этап 0  Блокеры в коде и контенте        ~1 день   ← без него выкатывать нельзя
Этап 1  Подготовка вне сервера            ~1 день   ← параллельно с 0 и 2
Этап 2  Сервер Timeweb                    ~2 часа
Этап 3  DNS                               ~15 мин + до 24 ч на распространение
Этап 4  Код на сервере                    ~30 мин   (клон ~600 МБ)
Этап 5  .env.production                   ~20 мин
Этап 6  Первая сборка                     ~20 мин   (на 2 ГБ RAM — только со swap)
Этап 7  nginx + TLS                       ~1 час
Этап 8  Приёмка                           ~1 час
Этап 9  Индексация и аналитика            ~1 час
Этап 10 Эксплуатация: бэкапы, мониторинг  ~1 час
```

Этапы 1 и 2 можно вести параллельно с 0. Этап 3 запускать как можно раньше —
DNS расходится дольше всего, а сертификат без него не выпустить.

---

## Этап 0 — Блокеры: правится в коде и контенте до первой прод-сборки

Это то, что не видно локально и вылезет уже на живом домене.

### 0.1. Реквизиты ИП не попадут на страницы (высокий приоритет)

`MarketingFooter` печатает `ОГРНИП {company.ogrnip}` на **каждой** странице,
`/company/contact` — ИНН и ОГРНИП. Значения читаются из `COMPANY_*` через
`src/lib/company.ts`, дефолты — `000000000000000` и `000000000000`.

Страницы статические: значение вмерзает **на сборке**. А `COMPANY_*` в
`docker-compose.prod.yml` не передаётся в `build.args` вообще — `env_file`
задаёт окружение только запущенному контейнеру, до `next build` оно не доходит.

Итог без правки: на проде в подвале всех страниц светится `ОГРНИП 000000000000000`.

**Что сделать:** объявить в `Dockerfile` `ARG`/`ENV` для `COMPANY_NAME`,
`COMPANY_INN`, `COMPANY_OGRNIP`, `COMPANY_EMAIL`, `COMPANY_PRIVACY_EMAIL`
и добавить их в `build.args` прод-компоуза. Это не секреты — в образе им место.
`INTERNAL_API_TOKEN` и `TELEGRAM_*` в build-args **не выносить**: они рантайм-серверные.

### 0.2. Compose не читает `.env.production` при подстановке build-args

В `docker-compose.prod.yml` build-args записаны как `${NEXT_PUBLIC_SITE_URL}` и т.п.
Compose подставляет такие переменные из окружения шелла или из файла `.env`
рядом с компоузом — но **не** из `.env.production`, указанного в `env_file`.

Итог без правки: сборка идёт с пустыми `NEXT_PUBLIC_*` — не работает Яндекс.Метрика,
в `<head>` нет meta-подтверждений Вебмастера и Search Console, а compose ещё и
ругается `variable is not set`.

**Что сделать:** в `deploy.sh` (и в ручных командах на сервере) вызывать compose с
`--env-file .env.production`:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```

Тогда один файл работает и источником подстановки, и окружением контейнера.

### 0.3. `NEXT_PUBLIC_WAITLIST_MODE` не объявлен в `Dockerfile`

Переменная передаётся в `build.args`, но `ARG` для неё в `Dockerfile` нет — значение
молча игнорируется. Сейчас это не мешает: `WAITLIST_MODE` включён по умолчанию
(`!== '0'`), а нам как раз нужен пре-лонч. Сломается позже — в день, когда флаг
поставят в `0` и удивятся, что кнопки не вернулись на регистрацию.

**Что сделать:** добавить `ARG`/`ENV` заодно с п. 0.1 и записать это в память проекта.

### 0.4. Контейнер слушает `0.0.0.0:3100`

`ports: "3100:3000"` публикует порт на все интерфейсы: сайт будет доступен по
`http://IP:3100` в обход nginx и TLS. Такой адрес попадает в индекс дублем и
светит происхождение.

**Что сделать:** либо `"127.0.0.1:3100:3000"` в компоузе, либо закрыть 3100
файрволом Timeweb (этап 2.4). Лучше и то и другое.

### 0.5. Файлы шаблонов пустые — 0 байт

```
public/shablony-files/shablon-aosr-344pr.docx   0
public/shablony-files/shablon-ozr-1026pr.docx   0
public/shablony-files/shablon-ks2.docx          0
public/shablony-files/shablon-ks3.docx          0
public/shablony-files/shablon-ks6a.docx         0
```

Лид-магнит — главный сборщик базы на пре-лонче. Пустой .docx в обмен на почту
хуже, чем отсутствие кнопки: это первое впечатление о продукте.

**Что сделать:** положить настоящие файлы либо временно убрать соответствующие
страницы из `/shablony` и из sitemap. Промежуточного варианта нет.

### 0.6. Картинки статей пустые — 0 байт

Все семь файлов в `public/images/blog/` нулевые, а на них ссылается `image:`
во фронтматтере пяти статей: это и превью в списке блога, и OG-картинка при
репосте. Дополнительно: `id-onlayn.jpg` и `sravnit-smety-excel.jpg` не совпадают
ни с одним `image:` — мусор, который можно удалить.

**Что сделать:** сгенерировать пять картинок 1200×630 или убрать поле `image`
из фронтматтера (тогда карточки рендерятся без превью, а OG падает на
`/og-images/default.png` — он настоящий).

### 0.7. Кнопка «Войти» ведёт в закрытое приложение

`MarketingHeader` даёт `https://app.komplid.ru/login` без оглядки на
`WAITLIST_MODE`. Пока приложения нет — это тупик прямо в шапке.

**Что сделать:** решение владельца — скрывать кнопку при `WAITLIST_MODE` или
оставить как есть (кто-то из беты может уже иметь доступ).

### 0.8. `/api/lead` без ограничения частоты

Открытый POST, который пишет в файл на диске. Скриптом набивается и база лидов,
и место на диске, и счётчик мест на главной (а он — публичное обещание).

**Что сделать:** ограничение на уровне nginx (этап 7), это дешевле кода.

**Готово, когда:** `npx tsc --noEmit`, `npm test`, `npx next build` зелёные;
`docker compose -f docker-compose.preview.yml up --build` показывает локально
настоящие ИНН/ОГРНИП в подвале и живые ссылки на шаблоны.

---

## Этап 1 — Подготовка вне сервера

Можно вести параллельно с этапами 0 и 2.

**1.1. Реквизиты и 152-ФЗ.**
- Взять точные ИНН (12 знаков) и ОГРНИП (15 знаков) — они пойдут в env.
- Убедиться, что уведомление оператора ПДн подано в Роскомнадзор **до** начала
  сбора почт, и что текст `/legal/privacy` совпадает с поданной редакцией
  (`docs/memory/privacy-policy-decisions.md`).
- Проверить `/legal/oferta`: «НДС не облагается (ИП на УСН)», никаких ООО.

**1.2. Домен.** Доступ в панель регистратора komplid.ru. Решить, где держать
DNS-зону: у регистратора или на DNS Timeweb (второе удобнее — записи рядом с сервером).

**1.3. Почта на домене.** `hello@komplid.ru` печатается в подвале, контактах и
политике — ящик должен существовать до запуска. Яндекс 360 или аналог; MX, SPF,
DKIM, DMARC. С самого VDS почту не отправляем.

**1.4. Счётчики — коды нужны ДО сборки.**
`NEXT_PUBLIC_YANDEX_METRIKA_ID`, `NEXT_PUBLIC_YANDEX_VERIFICATION`,
`NEXT_PUBLIC_GOOGLE_VERIFICATION` вмерзают в бандл на сборке. Порядок:
1) завести счётчик Метрики и получить ID; 2) в Вебмастере и Search Console взять
коды подтверждения; 3) положить в env; 4) собрать. Иначе придётся пересобирать.

> Обход: Яндекс.Вебмастер и Search Console умеют подтверждать домен **TXT-записью
> в DNS**. Тогда meta-теги не нужны и пересборка тоже — на первый выкат это проще.

**1.5. Telegram-уведомления (по желанию).** Бот через @BotFather, `chat_id` —
в `TELEGRAM_BOT_TOKEN` и `TELEGRAM_CHAT_ID`. Без них заявки просто копятся в файле.

**1.6. SSH-ключ.** Пара `ed25519` на рабочей машине — публичную часть загрузим
в Timeweb при создании сервера.

---

## Этап 2 — Сервер Timeweb

**2.1. Заказ.** Панель Timeweb Cloud → Облачные серверы → создать:
- Конфигурация: 2 CPU / 2 ГБ / 40 ГБ NVMe — минимум из плана. Сборка Next.js
  на 2 ГБ проходит только со swap (п. 2.5); если хочется без плясок — 4 ГБ.
- Регион: **РФ** (Москва или Санкт-Петербург) — требование 152-ФЗ и заявление
  сайта «данные в РФ».
- Образ: Ubuntu 24.04 LTS. Шаблон с Docker — если есть, иначе поставим сами.
- SSH-ключ из п. 1.6. Пароль root не использовать.
- Защита от DDoS — включить.

**2.2. Плавающий IP.** Заказать и привязать к серверу. Стоит копейки и избавляет
от правки DNS при пересоздании сервера — в DNS пишем именно его.

**2.3. Базовая настройка.**
```bash
ssh root@IP
apt update && apt upgrade -y
adduser komplid --disabled-password --gecos ""
usermod -aG sudo komplid
mkdir -p /home/komplid/.ssh && cp /root/.ssh/authorized_keys /home/komplid/.ssh/
chown -R komplid:komplid /home/komplid/.ssh && chmod 700 /home/komplid/.ssh
chmod 600 /home/komplid/.ssh/authorized_keys
```
В `/etc/ssh/sshd_config`: `PermitRootLogin no`, `PasswordAuthentication no` →
`systemctl restart ssh`. **Не закрывать текущую сессию, пока не проверен вход
новым пользователем в соседнем окне.**

**2.4. Файрвол.** В панели Timeweb (или `ufw`) оставить открытыми только 22, 80, 443.
Порт 3100 наружу закрыт — см. п. 0.4.

**2.5. Swap — обязательно при 2 ГБ.** `next build` собирает ~400 маршрутов и
падает по памяти без запаса:
```bash
fallocate -l 4G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

**2.6. Docker + ротация логов.** Если нет из шаблона:
```bash
curl -fsSL https://get.docker.com | sh
apt install -y docker-compose-plugin
usermod -aG docker komplid
```
`/etc/docker/daemon.json` — иначе лог контейнера со временем съест диск:
```json
{ "log-driver": "json-file", "log-opts": { "max-size": "10m", "max-file": "3" } }
```
`systemctl restart docker`.

**2.7. Бэкапы и снапшоты.** Включить автобэкап сервера в панели Timeweb. Снапшот
руками — перед каждым рискованным изменением инфраструктуры. Бэкап лидов — отдельно
(этап 10), это не то же самое.

**Готово, когда:** вход по SSH пользователем `komplid`, `docker run hello-world`
работает, `free -h` показывает swap, root по паролю не пускает.

---

## Этап 3 — DNS

Запускать раньше остальных этапов: распространение — до 24 часов.

| Тип | Имя | Значение |
|---|---|---|
| A | `komplid.ru` | плавающий IP |
| A | `www` | тот же IP |
| TXT | по инструкции Вебмастера | подтверждение домена (см. 1.4) |
| MX/TXT | по инструкции почты | почта на домене (п. 1.3) |

Канонические ссылки, `metadataBase`, sitemap и robots в коде **жёстко** указывают
`https://komplid.ru` — сайт живёт на голом домене, `www` только редиректом.

Проверка: `dig +short komplid.ru`, `dig +short www.komplid.ru` → ваш IP.

---

## Этап 4 — Код на сервере

Репозиторий тяжёлый: рабочая копия ~600 МБ (354 МБ статики корпуса СП + история
233 МБ). Первый клон идёт минуты — это нормально, дальше `deploy.sh` тянет только дельты.

Доступ — по SSH-ключу развёртывания (`origin` сейчас на HTTPS, для сервера удобнее SSH):
```bash
ssh komplid@IP
ssh-keygen -t ed25519 -f ~/.ssh/github_deploy -N ""
cat ~/.ssh/github_deploy.pub    # → GitHub → репозиторий → Settings → Deploy keys
                                #   Allow write access НЕ ставить
printf 'Host github.com\n  HostName github.com\n  User git\n  IdentityFile ~/.ssh/github_deploy\n  StrictHostKeyChecking accept-new\n' > ~/.ssh/config
chmod 600 ~/.ssh/config
ssh -T git@github.com           # ждём приветствие GitHub
git clone git@github.com:0odonkihooto0/komplid-marketing.git /home/komplid/komplid-marketing
```

Путь `/home/komplid/komplid-marketing` — дефолт из `deploy.sh`; другой путь
задаётся переменной `KOMPLID_DEPLOY_DIR`.

---

## Этап 5 — `.env.production` на сервере

```bash
cd /home/komplid/komplid-marketing
nano .env.production      # содержимое ниже
chmod 600 .env.production # там токены
```

| Переменная | Нужна на | Что будет, если пусто |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | сборке | в коде не используется, но compose ругается |
| `NEXT_PUBLIC_APP_URL` | сборке | ссылки на приложение по умолчанию |
| `NEXT_PUBLIC_WAITLIST_MODE` | сборке (после п. 0.3) | режим пре-лонча остаётся включён |
| `NEXT_PUBLIC_YANDEX_METRIKA_ID` | сборке | Метрика не подключится вовсе |
| `NEXT_PUBLIC_YANDEX_VERIFICATION` | сборке | нет meta-подтверждения Вебмастера |
| `NEXT_PUBLIC_GOOGLE_VERIFICATION` | сборке | нет meta-подтверждения GSC |
| `COMPANY_NAME` / `COMPANY_INN` / `COMPANY_OGRNIP` | сборке (после п. 0.1) | в подвале и контактах нули |
| `COMPANY_EMAIL` / `COMPANY_PRIVACY_EMAIL` | сборке | дефолты из `src/lib/company.ts` |
| `INTERNAL_API_URL` / `INTERNAL_API_TOKEN` | рантайме | пересылка лидов в приложение молча пропускается |
| `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` | рантайме | уведомлений о заявках не будет |
| `LEADS_DATA_DIR` | рантайме | **не задавать здесь** — прописан в компоузе как `/data` |

Шаблон — `.env.example` в репозитории, он актуален.

---

## Этап 6 — Первая сборка и запуск

```bash
cd /home/komplid/komplid-marketing
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml ps
curl -sI http://127.0.0.1:3100/ | head -3        # ждём 200
```

Сборка идёт 10–20 минут: `npm ci` дважды (builder и runner) плюс `next build`.

Типичные падения:
- **Убито по памяти** (`Killed`, exit 137) — не сделан swap (п. 2.5).
- **No space left** — проверить `df -h`; чистить `docker builder prune`.
- **`variable is not set`** — забыт `--env-file .env.production` (п. 0.2).
- **502 позже** — контейнер поднялся, но упал: `docker compose -f docker-compose.prod.yml logs --tail 100`.

**Готово, когда:** `curl` локально отдаёт 200, а в HTML подвала видно настоящий ОГРНИП.

---

## Этап 7 — nginx и TLS

**7.1.** `apt install -y nginx certbot python3-certbot-nginx`

**7.2.** `/etc/nginx/sites-available/komplid.ru` — сначала только HTTP,
сертификат certbot допишет сам:

```nginx
limit_req_zone $binary_remote_addr zone=leadforms:10m rate=12r/m;

server {
    listen 80;
    server_name komplid.ru www.komplid.ru;

    client_max_body_size 1m;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript
               application/xml text/xml image/svg+xml;
    gzip_min_length 1000;

    # Формы, пишущие лиды на диск: защита от набивки (п. 0.8).
    # Счётчик мест /api/waitlist-seats сюда НЕ попадает — его дёргает
    # каждый посетитель главной, и общий лимит резал бы живых людей за NAT.
    location ~ ^/api/(lead|template-download|newsletter)$ {
        limit_req zone=leadforms burst=5 nodelay;
        proxy_pass http://127.0.0.1:3100;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://127.0.0.1:3100;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**7.3.** Включить и выпустить сертификат:
```bash
ln -s /etc/nginx/sites-available/komplid.ru /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
certbot --nginx -d komplid.ru -d www.komplid.ru
```
Certbot сам добавит блок 443 и редирект с 80.

**7.4.** После того как HTTPS проверен — редирект `www` на голый домен
(канонические ссылки ведут туда) и HSTS:
```nginx
if ($host = www.komplid.ru) { return 301 https://komplid.ru$request_uri; }
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```
HSTS включать **последним**: пока сайт не открывается по HTTPS уверенно, откатить
его в браузерах посетителей уже нельзя.

**7.5.** Автопродление: `systemctl status certbot.timer`, `certbot renew --dry-run`.

> Необязательная оптимизация на потом: 12 728 картинок корпуса СП сейчас идут
> через Node. Их можно раздавать nginx напрямую, примонтировав `public/` в хост
> и добавив `location /normativ/img/ { alias ...; expires 30d; }`. На старте
> не нужно — трафика нет.

---

## Этап 8 — Приёмка

```bash
curl -sI https://komplid.ru/                                   # 200
curl -sI http://komplid.ru/                                    # 301 → https
curl -sI https://www.komplid.ru/                               # 301 → komplid.ru
curl -sI https://komplid.ru/normativ/sp-48-13330-2019          # 200, статика корпуса
curl -sI https://komplid.ru/normativ/sp-48-13330-2019.html     # 308 на чистый URL
curl -sI https://komplid.ru/normativ/sp-48-13330-2019/p-6-13   # 200, страница пункта
curl -s  https://komplid.ru/sitemap.xml | grep -c '<loc>'      # ~400 URL
curl -s  https://komplid.ru/robots.txt | grep -c YandexGPT     # 1 — AI-боты пущены
curl -s  https://komplid.ru/api/waitlist-seats                 # {"left":100,"total":100}
curl -sI https://komplid.ru/ | grep -i 'x-frame-options'       # заголовки из next.config
curl -sI --max-time 5 http://IP:3100/                          # не должно отвечать (п. 0.4)
```

Руками в браузере:
- Главная: переключаются вкладки этапов, ролей, аудитории, тема, бургер на телефоне.
- Форма раннего доступа: отправить тестовую заявку → проверить на сервере
  `docker compose -f docker-compose.prod.yml exec web cat /data/leads.jsonl`
  → счётчик мест на главной уменьшился → пришло в Telegram (если настроен).
- Скачивание шаблона: файл приходит **непустой** (п. 0.5).
- `/legal/privacy`, `/legal/oferta`, `/company/contact` — настоящие ИНН и ОГРНИП.
- Подвал на любой странице — настоящий ОГРНИП, не нули.
- Статья блога: превью, OG-картинка, JSON-LD (`Article`, `Breadcrumb`, `FAQPage`).
- Lighthouse на главной и на статье > 90.
- Тестовую заявку из `/data/leads.jsonl` после проверки удалить — счётчик мест
  публичный, а лишняя строка занижает остаток.

---

## Этап 9 — Индексация и аналитика

1. **Яндекс.Вебмастер:** подтвердить домен, отдать `https://komplid.ru/sitemap.xml`,
   отправить на переобход главную, `/normativ`, `/shablony`, `/blog`.
2. **Google Search Console:** то же самое.
3. **Метрика:** проверить, что счётчик виден в реальном времени; завести цели —
   отправка формы раннего доступа и скачивание шаблона.
4. **robots.txt:** убедиться, что `GPTBot`, `PerplexityBot`, `ClaudeBot`,
   `YandexGPT`, `Google-Extended` разрешены (для AEO/GEO это и есть весь смысл).
5. **Rich Results Test** на статье и на посадочной — схемы валидны.
6. **OG-превью:** отправить ссылку себе в Telegram и посмотреть карточку.
7. Записать дату старта в `docs/aeo-monitoring.md` — от неё считаются сроки
   появления в AI-ответах (`CLAUDE.md` §18).

---

## Этап 10 — Эксплуатация

**10.1. Бэкап лидов — важнее бэкапа кода.** Код есть в GitHub, база заявок —
только в томе Docker. Имя тома уточнить (`docker volume ls`, обычно
`komplid-marketing_leads`):
```bash
docker run --rm -v komplid-marketing_leads:/data -v /home/komplid/backups:/backup \
  alpine tar czf /backup/leads-$(date +%F).tar.gz -C /data .
```
В cron ежедневно, хранить 30 копий, забирать с сервера. В архиве персональные
данные: права 600, каталог только для `komplid`, копия — на носитель в РФ.

**10.2. Мониторинг.** Внешняя проверка `https://komplid.ru/` и
`https://komplid.ru/api/waitlist-seats` раз в 5 минут (любой uptime-сервис).
Внутри — оповещения панели Timeweb по CPU и диску.

**10.3. Диск.** Раз в месяц: `df -h`, `docker system df`,
`docker builder prune -f` (сборочный кэш растёт быстрее всего).
`deploy.sh` уже чистит образы через `docker image prune -f`.

**10.4. Обновления.** `unattended-upgrades` для безопасности ОС;
`certbot renew --dry-run` раз в квартал; перезагрузка сервера — со снапшотом.

**10.5. Логи.** Ротация Docker настроена в п. 2.6; nginx ротирует logrotate сам.

---

## Этап 11 — Обычный деплой и откат

**Деплой** (с локальной машины):
```bash
export KOMPLID_DEPLOY_HOST="komplid@IP"   # один раз в профиль, в репозиторий IP не коммитим
/preflight                                # tsc + test + build + проверка разметки
./deploy.sh                               # ветка по умолчанию — main
```
Скрипт не пустит незакоммиченные изменения, запушит ветку, обновит сервер,
пересоберёт образ и проверит, что сайт отвечает 200.

**Откат.** `deploy.sh` умеет только ветки, поэтому откат — руками:
```bash
ssh komplid@IP
cd /home/komplid/komplid-marketing
git log --oneline -5
git reset --hard <sha предыдущего рабочего коммита>
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```
Занимает столько же, сколько деплой (10–20 мин). Поэтому дешевле не откатываться,
а не выкатывать сломанное: `/preflight` и `docker-compose.preview.yml` локально.

**После обновления корпуса СП** деплой заметно дольше — 354 МБ статики
(`docs/normativ-razdel.md`). Ассеты коммитить отдельным коммитом от кода.

---

## Этап 12 — Выход из пре-лонча (позже)

Когда откроется app.komplid.ru:
1. `NEXT_PUBLIC_WAITLIST_MODE=0` в `.env.production` — **работает только после п. 0.3.**
2. Пересобрать: `./deploy.sh`.
3. Проверить: кнопки ведут на `app.komplid.ru/signup` с UTM, `/signup` редиректит,
   блок раннего доступа исчез, кнопка «Войти» больше не тупик.
4. Снять со страниц обещания, которые всё ещё не поставлены
   (`docs/memory/app-feature-reality.md`, `CLAUDE.md` §21).
5. Обновить `docs/memory/prelaunch-status.md` — этап закрыт.

---

## Чек-лист одной страницей

```
Этап 0  □ COMPANY_* в build-args + ARG в Dockerfile   □ --env-file в deploy.sh
        □ ARG для WAITLIST_MODE                        □ порт 3100 закрыт
        □ шаблоны .docx непустые                       □ картинки статей
        □ решение по кнопке «Войти»
Этап 1  □ ИНН/ОГРНИП        □ РКН       □ почта на домене
        □ ID Метрики        □ коды Вебмастера и GSC    □ SSH-ключ
Этап 2  □ VDS в РФ    □ плавающий IP   □ пользователь komplid   □ файрвол 22/80/443
        □ swap 4 ГБ   □ Docker + ротация логов         □ автобэкап
Этап 3  □ A komplid.ru   □ A www   □ TXT подтверждения   □ MX почты
Этап 4  □ deploy key   □ клон репозитория
Этап 5  □ .env.production, chmod 600
Этап 6  □ образ собрался   □ curl 127.0.0.1:3100 = 200
Этап 7  □ nginx   □ сертификат   □ www → apex   □ limit_req   □ HSTS последним
Этап 8  □ все curl-проверки   □ тестовый лид дошёл и удалён   □ Lighthouse > 90
Этап 9  □ Вебмастер   □ GSC   □ sitemap   □ цели Метрики   □ дата в aeo-monitoring
Этап 10 □ бэкап лидов в cron   □ uptime-мониторинг   □ напоминание про диск
```
