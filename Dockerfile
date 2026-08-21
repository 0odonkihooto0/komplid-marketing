# ─── Stage 1: builder ───────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

# NEXT_PUBLIC_* переменные встраиваются в JS-бандл во время сборки — нужны здесь
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_YANDEX_METRIKA_ID
ARG NEXT_PUBLIC_YANDEX_VERIFICATION
ARG NEXT_PUBLIC_GOOGLE_VERIFICATION
ARG NEXT_PUBLIC_WAITLIST_MODE

# Реквизиты ИП: страницы статические, значение вмерзает в HTML на сборке.
# Без этих ARG подвал каждой страницы печатал бы дефолт из src/lib/company.ts,
# а не то, что задано в окружении. Секретов здесь нет и быть не должно —
# INTERNAL_API_TOKEN, TELEGRAM_* и ключи S3 нужны только запущенному контейнеру.
ARG COMPANY_NAME
ARG COMPANY_INN
ARG COMPANY_OGRNIP
ARG COMPANY_EMAIL
ARG COMPANY_PRIVACY_EMAIL

ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_YANDEX_METRIKA_ID=$NEXT_PUBLIC_YANDEX_METRIKA_ID
ENV NEXT_PUBLIC_YANDEX_VERIFICATION=$NEXT_PUBLIC_YANDEX_VERIFICATION
ENV NEXT_PUBLIC_GOOGLE_VERIFICATION=$NEXT_PUBLIC_GOOGLE_VERIFICATION
ENV NEXT_PUBLIC_WAITLIST_MODE=$NEXT_PUBLIC_WAITLIST_MODE
ENV COMPANY_NAME=$COMPANY_NAME
ENV COMPANY_INN=$COMPANY_INN
ENV COMPANY_OGRNIP=$COMPANY_OGRNIP
ENV COMPANY_EMAIL=$COMPANY_EMAIL
ENV COMPANY_PRIVACY_EMAIL=$COMPANY_PRIVACY_EMAIL

RUN npm run build

# ─── Stage 2: runner ────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# next.config.mjs читается при next start (security headers и др.)
COPY --from=builder /app/next.config.mjs ./next.config.mjs
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
# content/ читается через fs в runtime (getAllBlogPosts, getAllTemplates и т.д.)
COPY --from=builder /app/content ./content
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json

RUN npm ci --omit=dev

EXPOSE 3000

CMD ["npm", "start"]
