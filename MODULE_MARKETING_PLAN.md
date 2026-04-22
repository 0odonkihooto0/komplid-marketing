# Komplid Marketing Site — План реализации

> **Проект:** `komplid-marketing` — отдельный репозиторий, отдельный домен `komplid.ru`
> **Приложение:** `app.komplid.ru` (текущий `stroydocs/` репо — не трогаем)
> **Стек:** Next.js 15 App Router + TypeScript + Tailwind + MDX + shadcn/ui
> **Цель:** SEO + AEO + GEO трафик для B2B (Team/Corporate) и B2C (Профи-пакеты из Модуля 15)
> **Ориентир:** 3-4 недели от нуля до работающего сайта с первыми 15 статьями
> **База дизайна:** `Komplid-Landing-updated.html` (в корне репозитория `komplid-marketing/design/`) — это **эталонный HTML с правильной палитрой, токенами OKLch, актуальными ценами и новыми блоками Профи-пакетов**. Сгенерирован в Claude Design и адаптирован под наш план.
>
> **Дизайн-токены:** OKLch-переменные из `:root` лендинга (палитра Steel, light/dark темы). Идентичны тем, что в `stroydocs/src/app/globals.css` — это специально, чтобы маркетинг-сайт и приложение выглядели единообразно.

---

## 0. Контекст и стратегия

### 0.1. Зачем отдельный репо

Маркетинговый сайт и приложение — **разные ответственности**:

- Маркетинг меняется каждый день (статьи, A/B-тесты, UTM), приложение — раз в неделю
- Маркетингу нужен SSG (статическая генерация), приложению — SSR с сессиями
- Разные CI-пайплайны, разные SEO-стратегии
- Если в одном репо — любое изменение статьи запускает билд всего приложения

### 0.2. Почему komplid.ru, а не app.komplid.ru для маркетинга

- **komplid.ru** — маркетинговый домен. Главная, лендинги, блог, шаблоны. **SEO/AEO/GEO трафик сюда.**
- **app.komplid.ru** — само приложение. Авторизация, все модули. SEO для него **не нужен**.

Это стандартная схема B2B SaaS (hubspot.com + app.hubspot.com, notion.so + www.notion.so, linear.app + linear.app/settings).

### 0.3. SEO vs AEO vs GEO в одном предложении

- **SEO** — чтобы ты попал в выдачу Яндекса/Google по «скачать шаблон АОСР»
- **AEO** — чтобы Google AI Overview / Алиса цитировали тебя в готовом ответе
- **GEO** — чтобы ChatGPT / Perplexity / Claude упоминали Komplid при вопросах о ПО для стройки

Все три — **надстройка друг над другом**. Сильный SEO → сильный AEO → сильный GEO. Next.js 15 даёт фундамент из коробки; Tilda не даёт (ограничения на JSON-LD, скорость, URL-контроль).

---

## 1. Архитектура сайта

### 1.1. URL-структура

```
komplid.ru/
├── /                          — главная (B2B focus, стиль Komplid-Landing-updated.html)
│
├── /smetchik                  — посадочная Сметчик-Студио (B2C)
├── /pto                       — посадочная ИД-Мастер (B2C)
├── /prorab                    — посадочная Прораб-Журнал (B2C)
│
├── /solutions/general-contractor   — для генподрядчика
├── /solutions/customer             — для заказчика
├── /solutions/technical-supervisor — для технадзора
├── /solutions/designer             — для проектировщика
│
├── /pricing                   — все тарифы (B2B + B2C в одном месте)
├── /features                  — общий обзор возможностей
├── /modules/[slug]            — детали каждого из 18 модулей
│
├── /blog                      — блог (список)
├── /blog/[slug]               — статья
├── /blog/tag/[tag]            — фильтр по тегу
│
├── /shablony                  — каталог бесплатных шаблонов (лид-магнит)
├── /shablony/[slug]           — страница шаблона с формой «скачать → email»
│
├── /kalkulyator               — каталог калькуляторов
├── /kalkulyator/[slug]        — конкретный калькулятор (React-виджет)
│
├── /sravnenie                 — сравнения с конкурентами (критично для AEO)
├── /sravnenie/cus             — vs ЦУС
├── /sravnenie/exon            — vs Exon
├── /sravnenie/pragmacore      — vs Pragmacore
│
├── /ref/[code]                — приземление реферальных ссылок (из М15)
│
├── /signup                    — редирект на app.komplid.ru/signup (B2B)
│
├── /company/about             — о компании
├── /company/contact           — контакты
│
├── /legal/privacy             — политика конфиденциальности
├── /legal/terms               — пользовательское соглашение
├── /legal/oferta              — публичная оферта
│
├── /sitemap.xml               — автогенерация
├── /robots.txt                — автогенерация
└── /manifest.webmanifest      — web manifest
```

### 1.2. Структура репозитория

```
komplid-marketing/                 ← ОТДЕЛЬНЫЙ репозиторий, никак не связан со stroydocs
├── Dockerfile                     — production-сборка
├── Dockerfile.dev                 — dev-режим с hot reload
├── docker-compose.yml             — локальный запуск для тестирования
├── docker-compose.prod.yml        — продакшен-запуск на Timeweb
├── .dockerignore
├── deploy.sh                      — скрипт деплоя на Timeweb (запускается локально)
│
├── content/
│   ├── blog/            — статьи MDX
│   ├── shablony/        — страницы шаблонов MDX
│   ├── sravneniya/      — сравнения MDX
│   └── authors/         — авторы
│
├── public/
│   ├── shablony-files/  — реальные файлы .docx/.xlsx
│   ├── images/
│   ├── icons/
│   └── og-images/
│
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── smetchik/page.tsx
│   │   ├── pto/page.tsx
│   │   ├── prorab/page.tsx
│   │   ├── pricing/page.tsx
│   │   ├── blog/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── shablony/
│   │   ├── kalkulyator/
│   │   ├── sravnenie/
│   │   ├── ref/[code]/
│   │   ├── sitemap.ts
│   │   ├── robots.ts
│   │   ├── manifest.ts
│   │   └── api/
│   │       ├── lead/route.ts
│   │       ├── template-download/route.ts
│   │       └── newsletter/route.ts
│   │
│   ├── components/
│   │   ├── layout/        — Header, Footer, MobileNav
│   │   ├── blocks/        — Hero, Features, Pricing, Faq, Cta, Modules, Metrics, Quote
│   │   ├── seo/           — JsonLd, *Schema компоненты
│   │   ├── forms/         — LeadForm, NewsletterForm
│   │   ├── calculators/   — EstimateCalculator, AosrGenerator
│   │   └── mdx/           — Callout, StepList, ComparisonTable, DownloadCard
│   │
│   ├── content-loader/    — blog.ts, shablony.ts, sravneniya.ts
│   ├── lib/               — analytics, seo, utm, env
│   └── styles/globals.css
│
├── mdx-components.tsx
├── next.config.mjs
├── tailwind.config.ts
└── package.json
```

### 1.3. Инфраструктура

**Хостинг:** Timeweb Cloud VDS, 2 CPU / 2 GB / 40 GB NVMe Premium + DDoS = **~1 200 ₽/мес**.

**Почему мало:** сайт статический (SSG), 99% страниц пре-рендерены в HTML на этапе сборки, nginx отдаёт из файловой системы. Нагрузка минимальная.

**Workflow разработки:**

1. **Локально:** Docker Desktop — `docker compose up` запускает всё для разработки и тестирования
2. **Деплой на прод:** запускаешь `./deploy.sh` с локальной машины — скрипт сам заходит по SSH на сервер, стягивает свежий код из репозитория, пересобирает и перезапускает контейнер

Так не нужны GitHub Actions — никакой автоматики, ты сам контролируешь каждый деплой. Идеально для старта когда ты единственный разработчик.

**Отдельный репозиторий:** `komplid-marketing` — **полностью независимый** от `stroydocs`. Может лежать на любом компьютере, в любой папке. Главное — свой `.git` и свой GitHub-репозиторий. Никаких пересечений с основным приложением.

**Домены:**
- `komplid.ru` — A-запись на VPS маркетинга (отдельный VDS или тот же что у app, но с разными nginx server-блоками)
- `app.komplid.ru` — уже существует, не трогаем

---

## 2. Карта фаз

```
Фаза 1 (нед 1):   Скелет + SEO-фундамент + деплой     ⬜ 5 дней
Фаза 2 (нед 1-2): Главная + 3 B2C-посадочные          ⬜ 4-5 дней
Фаза 3 (нед 2):   Блог-движок + 5 первых статей       ⬜ 4 дня
Фаза 4 (нед 3):   Шаблоны + калькуляторы              ⬜ 3 дня
Фаза 5 (нед 3):   Сравнения с конкурентами (AEO)      ⬜ 2 дня
Фаза 6 (нед 4):   Реферальная интеграция + CRM        ⬜ 2 дня
Фаза 7 (ongoing): Производство контента               ⬜ 3-5 статей/нед
```

---

# ФАЗА 1 — Скелет и инфраструктура (5 дней) ⬜

## Шаг 1.1 — Инициализация проекта

```
📋 ЗАДАЧА: Создать Next.js 15 проект komplid-marketing

ВАЖНО: komplid-marketing — это ПОЛНОСТЬЮ ОТДЕЛЬНЫЙ проект в своей папке.
Он НЕ должен быть вложен в папку stroydocs и вообще никак с ним не связан
в файловой системе. Создавай в любом удобном месте, например:
- ~/projects/komplid-marketing (macOS/Linux)
- C:\projects\komplid-marketing (Windows)

У него будет свой отдельный GitHub-репозиторий, свой Docker-сетап,
свой деплой. Они с stroydocs общаются только по сети
(komplid-marketing делает fetch на app.komplid.ru/api/public/... когда
пользователь отправляет лид).

1. Инициализация:

```bash
npx create-next-app@latest komplid-marketing \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-eslint
```

2. Установить зависимости:

```bash
npm install @next/mdx @mdx-js/loader @mdx-js/react next-mdx-remote
npm install gray-matter remark-gfm rehype-slug rehype-autolink-headings
npm install date-fns clsx tailwind-merge lucide-react
npm install @tanstack/react-query zod
npm install -D @types/mdx @tailwindcss/typography tailwindcss-animate
```

3. Установить shadcn/ui:

```bash
npx shadcn@latest init
# style: Default, baseColor: zinc, cssVariables: yes
npx shadcn@latest add button input label textarea form dialog card badge separator accordion tabs
```

4. Копировать дизайн-токены из stroydocs/src/app/globals.css (блок :root с
   OKLch переменными) в src/styles/globals.css. Дизайн-система ДОЛЖНА
   совпадать с основным приложением.

5. next.config.mjs:

```javascript
import createMDX from '@next/mdx';

const withMDX = createMDX({
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

const nextConfig = {
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
  reactStrictMode: true,
  poweredByHeader: false,
  trailingSlash: false,
  async headers() {
    return [{
      source: '/:path*',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ],
    }];
  },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

export default withMDX(nextConfig);
```

6. tsconfig.json — добавить пути к @/content:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "paths": {
      "@/*": ["./src/*"],
      "@/content/*": ["./content/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", "**/*.mdx", "mdx-components.tsx"]
}
```

7. Создать пустую структуру папок из раздела 1.2.

8. **КРИТИЧНО: сохранить дизайн-эталон в проект.**

Создай папку `design/` в корне проекта и положи туда файл `Komplid-Landing-updated.html`
(пользователь предоставил его отдельно, он лежит рядом с файлами плана).

```bash
mkdir -p design
cp /путь/к/Komplid-Landing-updated.html design/landing-reference.html
```

Этот HTML-файл — **единственный источник правды** для дизайна маркетингового сайта.
Он содержит:
- Полный набор OKLch-переменных (`:root` блок со всеми токенами)
- Три палитры акцентов: Steel (основная), Cobalt, Lime
- Light и Dark темы
- Референс-реализацию всех 11 секций (Nav, Hero, Logos, Modules, Features, Metrics, Quote, Pricing, FAQ, CTA, Footer)
- Актуальные цены (B2C 1 900/2 900, B2B 12 000/48 000)
- AEO-оптимизированный FAQ (8 вопросов)

При портировании каждой секции в React-компонент:
1. Открой `design/landing-reference.html` в браузере — посмотри как секция выглядит
2. Скопируй HTML-разметку из нужной секции
3. Перенеси в React-компонент, заменив статические данные на props
4. CSS НЕ копируй целиком — вместо этого используй Tailwind-классы, но **цвета и отступы бери из токенов лендинга**

Токены OKLch (из `:root` лендинга) перенести в `src/styles/globals.css`:

```css
:root {
  --bg:        oklch(0.985 0.002 85);
  --bg-elev:   oklch(1 0 0);
  --bg-inset:  oklch(0.965 0.003 85);
  /* ... полный список — скопировать из landing-reference.html */
}

html[data-palette="steel"]  { --accent: oklch(0.72 0.16 62); ... }
```

Это гарантирует что цвета маркетинг-сайта идентичны тем, что в `stroydocs/src/app/globals.css`,
и обе части бренда (сайт + приложение) смотрятся как одно целое.

9. Первый коммит: "chore: initial Next.js 15 marketing project"

ПРОВЕРКА:
- npm run dev → http://localhost:3000 работает
- npx tsc --noEmit → ноль ошибок
- npm run build → успешная сборка
- Файл design/landing-reference.html открывается в браузере и отображает полный лендинг
```

## Шаг 1.2 — Layout, Header, Footer

```
📋 ЗАДАЧА: Базовый layout в стиле Komplid

КОНТЕКСТ: В папке design/ лежит landing-reference.html (полный эталонный лендинг
из Claude Design, уже адаптированный под наш план — с Профи-пакетами, правильными
ценами, AEO-FAQ). Переносим его структуру в Next.js как переиспользуемые
компоненты.

1. src/app/layout.tsx — корневой layout:

```tsx
import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { MarketingHeader } from '@/components/layout/MarketingHeader';
import { MarketingFooter } from '@/components/layout/MarketingFooter';
import { YandexMetrika } from '@/components/analytics/YandexMetrika';
import { OrganizationSchema } from '@/components/seo/OrganizationSchema';
import '@/styles/globals.css';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-sans',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://komplid.ru'),
  title: {
    default: 'Komplid — цифровое управление строительством | ERP для стройки',
    template: '%s | Komplid',
  },
  description:
    'ERP-платформа для строительных проектов: ИД, КС-2/КС-3, ОЖР, смета, стройконтроль, ТИМ. 18 модулей в одной системе. Пробный период 14 дней. Данные в РФ, ФЗ-152.',
  keywords: [
    'исполнительная документация',
    'цифровое управление строительством',
    'ИД онлайн',
    'АОСР шаблон',
    'ОЖР электронный',
    'Komplid',
    'альтернатива ЦУС',
  ],
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: 'https://komplid.ru',
    siteName: 'Komplid',
    title: 'Komplid — ERP для строительных проектов',
    description: 'Вся стройка от сметы до КС-2 в одной системе',
    images: [{
      url: '/og-images/default.png',
      width: 1200,
      height: 630,
      alt: 'Komplid',
    }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: { canonical: '/' },
  verification: {
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${inter.variable} ${mono.variable}`}>
      <body className="min-h-screen bg-[var(--bg)] text-[var(--ink)] antialiased">
        <OrganizationSchema />
        <MarketingHeader />
        <main>{children}</main>
        <MarketingFooter />
        <YandexMetrika />
      </body>
    </html>
  );
}
```

2. src/components/layout/MarketingHeader.tsx:

Взять структуру из design/landing-reference.html (секция <header class="nav">):
- Логотип Komplid (квадрат с K + "Komplid")
- Навигация: Модули | Тарифы | Сравнение | Блог | FAQ
  (якоря #modules, #pricing внутри главной; /sravnenie, /blog — отдельные страницы; #faq — якорь)
- Правая часть: переключатель темы (light/dark), "Войти" (→ app.komplid.ru/login), "Попробовать" (→ app.komplid.ru/signup)
- Sticky при скролле + backdrop-blur на фоне
- На мобильных — гамбургер-меню через Sheet из shadcn/ui

Использовать Link from 'next/link' для внутренних ссылок, обычные <a> для app.komplid.ru.

3. src/components/layout/MarketingFooter.tsx:

Из того же design/landing-reference.html (секция <footer>):
- 5-колоночная сетка: Бренд | Продукт | Для специалистов | Для компаний | Контакты
- Колонка «Продукт»: Модули, Возможности, Тарифы, Блог, Шаблоны документов
- Колонка «Для специалистов»: Сметчик-Студио (/smetchik), ИД-Мастер (/pto), Прораб-Журнал (/prorab), Калькуляторы (/kalkulyator)
- Колонка «Для компаний»: Генподрядчику, Заказчику, Проектировщику, Технадзору, Сравнение с ЦУС/Exon
- Колонка «Контакты»: email hello@komplid.ru, Telegram @komplid, «Работаем онлайн по всей России»
- Нижняя полоса: «© 2026 Komplid · ИП ФИО · ОГРНИП {env}» + «Соответствие 152-ФЗ» + «Политика · Оферта»

ВАЖНО: реквизиты ИП (ФИО, ОГРНИП) тянуть из env-переменных COMPANY_NAME, COMPANY_OGRNIP
(эти переменные определены в SUBSCRIPTION_SYSTEM.md раздел 0.4.4). Это позволит
при переходе на ООО в будущем просто поменять env, без правок кода.

4. tailwind.config.ts — настроить под дизайн-токены:

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}', './content/**/*.{md,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        bg: 'var(--bg)',
        'bg-elev': 'var(--bg-elev)',
        'bg-inset': 'var(--bg-inset)',
        ink: 'var(--ink)',
        'ink-soft': 'var(--ink-soft)',
        'ink-muted': 'var(--ink-muted)',
        border: 'var(--border-token)',
        accent: 'var(--accent-bg)',
        'accent-ink': 'var(--accent-ink)',
      },
      typography: () => ({
        DEFAULT: {
          css: {
            color: 'var(--ink)',
            maxWidth: 'none',
            a: { color: 'var(--accent-bg)' },
            h1: { color: 'var(--ink)' },
            h2: { color: 'var(--ink)' },
            h3: { color: 'var(--ink)' },
            strong: { color: 'var(--ink)' },
          },
        },
      }),
    },
  },
  plugins: [require('@tailwindcss/typography'), require('tailwindcss-animate')],
};

export default config;
```

ПРОВЕРКА:
- npm run dev → страница с шапкой, подвалом, палитрой Steel
- Mobile (< 760px) — hamburger работает
- npx tsc --noEmit зелёный
- Lighthouse > 90
```

## Шаг 1.3 — SEO-фундамент

```
📋 ЗАДАЧА: Schema.org разметка, sitemap, robots, аналитика

1. src/components/seo/JsonLd.tsx:

```tsx
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
```

2. src/components/seo/OrganizationSchema.tsx:

```tsx
import { JsonLd } from './JsonLd';

export function OrganizationSchema() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://komplid.ru/#organization',
    name: 'Komplid',
    alternateName: ['Комплид', 'Komplid Systems'],
    url: 'https://komplid.ru',
    logo: {
      '@type': 'ImageObject',
      url: 'https://komplid.ru/icons/logo-512.png',
      width: 512,
      height: 512,
    },
    description: 'ERP-платформа для цифрового управления строительными проектами в России. 18 модулей: ИД, сметы, журналы, стройконтроль, ТИМ.',
    foundingDate: '2026',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'RU',
      addressLocality: 'Москва',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'hello@komplid.ru',
      contactType: 'customer support',
      availableLanguage: 'Russian',
    },
    sameAs: [
      'https://t.me/komplid',
      'https://vc.ru/u/komplid',
    ],
  };
  return <JsonLd data={data} />;
}
```

3. src/components/seo/SoftwareAppSchema.tsx — критично для B2C-страниц:

```tsx
import { JsonLd } from './JsonLd';

interface Props {
  name: string;
  description: string;
  price?: { amount: number; currency: string; period?: string };
  url: string;
  ratingCount?: number;
  ratingValue?: number;
}

export function SoftwareAppSchema({ name, description, price, url, ratingCount, ratingValue }: Props) {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name,
    description,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url,
  };
  if (price) {
    data.offers = {
      '@type': 'Offer',
      price: price.amount,
      priceCurrency: price.currency,
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: price.amount,
        priceCurrency: price.currency,
        billingIncrement: price.period ?? 'P1M',
      },
    };
  }
  if (ratingCount && ratingValue) {
    data.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue,
      ratingCount,
    };
  }
  return <JsonLd data={data} />;
}
```

4. src/components/seo/FaqSchema.tsx — КРИТИЧНО для AEO:

```tsx
import { JsonLd } from './JsonLd';

interface FaqItem {
  question: string;
  answer: string;
}

export function FaqSchema({ items }: { items: FaqItem[] }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
  return <JsonLd data={data} />;
}
```

5. src/components/seo/ArticleSchema.tsx:

```tsx
import { JsonLd } from './JsonLd';

interface Props {
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  publishedAt: string;
  modifiedAt?: string;
  authorName: string;
}

export function ArticleSchema({ title, description, url, imageUrl, publishedAt, modifiedAt, authorName }: Props) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url,
    image: imageUrl ? [imageUrl] : undefined,
    datePublished: publishedAt,
    dateModified: modifiedAt ?? publishedAt,
    author: {
      '@type': 'Organization',
      name: authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Komplid',
      logo: {
        '@type': 'ImageObject',
        url: 'https://komplid.ru/icons/logo-512.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  };
  return <JsonLd data={data} />;
}
```

6. src/components/seo/BreadcrumbSchema.tsx:

```tsx
import { JsonLd } from './JsonLd';

export function BreadcrumbSchema({ items }: { items: Array<{ name: string; url: string }> }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
  return <JsonLd data={data} />;
}
```

7. src/app/sitemap.ts — динамическая генерация:

```typescript
import type { MetadataRoute } from 'next';
import { getAllBlogPosts } from '@/content-loader/blog';
import { getAllTemplates } from '@/content-loader/shablony';
import { getAllComparisons } from '@/content-loader/sravneniya';

const BASE_URL = 'https://komplid.ru';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = [
    '',
    '/smetchik', '/pto', '/prorab',
    '/pricing', '/features', '/blog', '/shablony', '/kalkulyator', '/sravnenie',
    '/company/about', '/company/contact',
    '/solutions/general-contractor', '/solutions/customer',
    '/solutions/technical-supervisor', '/solutions/designer',
  ].map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1 : 0.8,
  }));

  const posts = await getAllBlogPosts();
  const postPages = posts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.modifiedAt ?? post.publishedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const templates = await getAllTemplates();
  const templatePages = templates.map((tpl) => ({
    url: `${BASE_URL}/shablony/${tpl.slug}`,
    lastModified: new Date(tpl.publishedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const comparisons = await getAllComparisons();
  const comparisonPages = comparisons.map((cmp) => ({
    url: `${BASE_URL}/sravnenie/${cmp.slug}`,
    lastModified: new Date(cmp.publishedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...postPages, ...templatePages, ...comparisonPages];
}
```

8. src/app/robots.ts — ЯВНО разрешаем AI-боты:

```typescript
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/private/'],
      },
      // AI-боты — критично для GEO/AEO
      { userAgent: 'GPTBot', allow: '/' },
      { userAgent: 'OAI-SearchBot', allow: '/' },
      { userAgent: 'ChatGPT-User', allow: '/' },
      { userAgent: 'PerplexityBot', allow: '/' },
      { userAgent: 'ClaudeBot', allow: '/' },
      { userAgent: 'Google-Extended', allow: '/' },  // для Gemini
      { userAgent: 'YandexGPT', allow: '/' },         // для Алисы и Нейро
    ],
    sitemap: 'https://komplid.ru/sitemap.xml',
    host: 'komplid.ru',
  };
}
```

9. src/app/manifest.ts:

```typescript
import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Komplid — ERP для строительных проектов',
    short_name: 'Komplid',
    description: 'Цифровое управление строительством',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#2B3445',
    lang: 'ru',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
```

10. src/components/analytics/YandexMetrika.tsx:

```tsx
'use client';
import Script from 'next/script';

export function YandexMetrika() {
  const counterId = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID;
  if (!counterId) return null;

  return (
    <>
      <Script id="yandex-metrika" strategy="afterInteractive">
        {`
          (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
          m[i].l=1*new Date();
          for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
          k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
          (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
          ym(${counterId}, "init", {
            clickmap: true, trackLinks: true, accurateTrackBounce: true, webvisor: true
          });
        `}
      </Script>
      <noscript>
        <div><img src={`https://mc.yandex.ru/watch/${counterId}`} style={{ position: 'absolute', left: '-9999px' }} alt="" /></div>
      </noscript>
    </>
  );
}
```

11. Content-loader заглушки (src/content-loader/):
    blog.ts, shablony.ts, sravneniya.ts — пока экспортируют пустые функции
    getAllBlogPosts(), getBlogPostBySlug(), getAllTemplates(), getAllComparisons().
    Реализация в следующих фазах.

12. .env.example:

```
NEXT_PUBLIC_YANDEX_METRIKA_ID=
NEXT_PUBLIC_YANDEX_VERIFICATION=
NEXT_PUBLIC_GOOGLE_VERIFICATION=
NEXT_PUBLIC_APP_URL=https://app.komplid.ru
INTERNAL_API_URL=https://app.komplid.ru/api/public
INTERNAL_API_TOKEN=
```

ПРОВЕРКА:
- /sitemap.xml → валидный XML
- /robots.txt → AI-боты разрешены
- /manifest.webmanifest → валидный
- Google Rich Results Test на главной → Organization schema valid
- DevTools → Application → Manifest корректный
```

## Шаг 1.4 — Корневые блоки

```
📋 ЗАДАЧА: Переиспользуемые блоки для сборки страниц

Переносим основные блоки из design/landing-reference.html в React-компоненты.

Создать в src/components/blocks/:

1. Hero.tsx — главный блок:

```tsx
interface HeroProps {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  variant?: 'default' | 'compact';
}

export function Hero({ eyebrow, title, subtitle, primaryCta, secondaryCta }: HeroProps) {
  // Двухколоночная раскладка на десктопе (text + visual)
  // Eyebrow моноширинный, uppercase
  // Title с line-height 1.05
  // CTA: primary (accent) + ghost
}
```

2. Features.tsx — сетка возможностей с иконками

3. Modules.tsx — список 18 модулей Komplid. Массив модулей:

```typescript
const MODULES = [
  { slug: 'dashboard', name: 'Дашборд', description: 'Виджеты, KPI, лента событий' },
  { slug: 'info', name: 'Информация', description: 'Паспорт объекта, показатели, финансирование' },
  { slug: 'management', name: 'Управление', description: 'Контракты, мероприятия, документарий' },
  { slug: 'estimates', name: 'Сметы', description: 'Парсинг XML, сравнение версий, ФГИС ЦС' },
  { slug: 'journals', name: 'Журналы работ', description: 'ОЖР, ЖВК, спецжурналы' },
  { slug: 'id', name: 'Исполнительная документация', description: 'АОСР, КС-2, КС-3, маршруты' },
  { slug: 'sk', name: 'Стройконтроль', description: 'Дефекты, предписания, инспекции' },
  { slug: 'gantt', name: 'График работ', description: 'Ганта, критический путь, версионирование' },
  { slug: 'resources', name: 'Ресурсы и закупки', description: 'Материалы, накладные, остатки' },
  { slug: 'reports', name: 'Отчёты', description: 'PDF за период, AI-сводки' },
  { slug: 'tim', name: 'ТИМ / BIM', description: 'IFC-вьюер, привязка ИД к элементам' },
  { slug: 'ecp', name: 'ЭЦП и регуляторика', description: 'КриптоПро, ИСУП, МЧД' },
  { slug: 'planner', name: 'Планировщик задач', description: 'Задачи, роли, группы, шаблоны' },
  { slug: 'monetization', name: 'Монетизация', description: 'Подписки, рефералы, Профи-пакеты' },
  { slug: 'pwa', name: 'Мобильное приложение', description: 'Офлайн, GPS, push, геозоны' },
  { slug: 'ai', name: 'AI-ассистент', description: 'RAG-поиск, проверка ИД, подсказки' },
];

export function Modules() {
  // grid 3x6 с карточками модулей
  // каждая карточка -> Link to /modules/[slug]
}
```

4. Pricing.tsx — поддерживает B2B и B2C режимы:

```tsx
interface PricingTier {
  name: string;
  subtitle: string;
  price: string;
  priceUnit: string;
  priceNote?: string;
  features: Array<{ text: string; included: boolean }>;
  cta: { label: string; href: string };
  featured?: boolean;
}

export function Pricing({ title, description, tiers }: {
  title: string;
  description?: string;
  tiers: PricingTier[];
}) { /* 3-колоночная сетка карточек */ }
```

5. Faq.tsx — АВТОМАТИЧЕСКИ рендерит FaqSchema:

```tsx
import { FaqSchema } from '@/components/seo/FaqSchema';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export function Faq({ title, items }: {
  title: string;
  items: Array<{ question: string; answer: string }>;
}) {
  return (
    <section className="section">
      <div className="wrap">
        <h2>{title}</h2>
        <Accordion type="single" collapsible>
          {items.map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent>{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
      <FaqSchema items={items} />
    </section>
  );
}
```

ВАЖНО: Faq-блок ВСЕГДА рендерит FaqSchema — критический AEO-сигнал.

6. Cta.tsx — финальный призыв к действию

7. Metrics.tsx — блок «Komplid в цифрах» (поддерживает light/dark)

8. Quote.tsx — блок с цитатой клиента + статистикой

9. SocialProof.tsx — логотипы клиентов (пока с заглушками)

10. ProfiPackagesTeaser.tsx — блок с 3 карточками B2C Профи-пакетов:

```tsx
// Используется на главной komplid.ru — показывает что кроме B2B-тарифов
// есть и индивидуальные подписки от 1 900 ₽/мес
//
// Референс: в design/landing-reference.html секция "B2C PROFI PACKAGES"
// внутри блока #pricing — 3 карточки Сметчик-Студио / ИД-Мастер / Прораб-Журнал
// с hover-эффектом, ссылками на /smetchik /pto /prorab

interface ProfiPackage {
  slug: 'smetchik' | 'pto' | 'prorab';
  eyebrow: string;
  title: string;
  description: string;
  priceFrom: number;  // 1900
}

export function ProfiPackagesTeaser() {
  const packages: ProfiPackage[] = [
    {
      slug: 'smetchik',
      eyebrow: 'Сметчик-Студио',
      title: 'Для сметчика',
      description: 'Импорт из Гранд-Сметы, сравнение версий, публичные ссылки для заказчика, ФГИС ЦС',
      priceFrom: 1900,
    },
    {
      slug: 'pto',
      eyebrow: 'ИД-Мастер',
      title: 'Для ПТО-инженера',
      description: 'АОСР, ОЖР, КС-2/КС-3 по приказу №344/пр, маршруты согласования, ЭЦП',
      priceFrom: 1900,
    },
    {
      slug: 'prorab',
      eyebrow: 'Прораб-Журнал',
      title: 'Для прораба',
      description: 'Мобильный ОЖР, фото с GPS, дефекты, голосовой ввод, работает офлайн',
      priceFrom: 1900,
    },
  ];

  return (
    <div className="...">
      {/* Заголовок: "Для одиночных специалистов · Профи-пакеты от 1 900 ₽/мес" */}
      {/* Grid 3 карточки → Link href={`/${pkg.slug}`} с hover:translate-y-[-2px] + border-accent */}
    </div>
  );
}
```

Этот блок — ключевая дифференциация Komplid от ЦУС/Exon. Показывает что у нас есть B2C
tier для одиночных специалистов (которого у конкурентов нет). Критично для конверсии
с органического трафика «программа для сметчика онлайн», «приложение прораба» и т.п.

Все блоки:
- Используют дизайн-токены через var(--accent), var(--ink)
- Responsive (mobile-first)
- Принимают props, нулевой хардкод
- **Разметка скопирована из design/landing-reference.html** — не придумывать с нуля

ПРОВЕРКА:
- Создать src/app/__test/page.tsx с использованием всех блоков
- Открыть /__test → всё отрисовано
- Проверить на мобилке
- Удалить __test перед коммитом
```

## Шаг 1.5 — Docker для разработки и деплой на Timeweb

В этом шаге настраиваем **локальный запуск через Docker Desktop** для тестирования и **ручной деплой** на Timeweb через скрипт. Никаких GitHub Actions — ты сам контролируешь когда заливать обновления на прод.

### 1.5.1. Локальный Docker для разработки

```
📋 ЗАДАЧА: Настроить Docker Desktop для локального запуска

ПРЕДВАРИТЕЛЬНО:
- Установи Docker Desktop с https://www.docker.com/products/docker-desktop
- Убедись что он запущен (значок в трее)

В корне проекта komplid-marketing создай:

1. Файл .dockerignore (чтобы не копировать лишнее в образ):

```
node_modules
.next
.env.local
.env.production
.git
.github
*.md
npm-debug.log
.vscode
.idea
.DS_Store
coverage
*.log
```

2. Файл Dockerfile.dev — для локальной разработки с hot reload:

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Копируем зависимости отдельно для лучшего кэширования
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 3000

# В dev-режиме запускаем next dev с hot reload
CMD ["npm", "run", "dev"]
```

3. Файл docker-compose.yml — запуск одной командой:

```yaml
services:
  web:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      # Пробрасываем код внутрь контейнера — изменения видны сразу
      - .:/app
      # Исключаем node_modules и .next — они должны быть из контейнера
      - /app/node_modules
      - /app/.next
    environment:
      - NODE_ENV=development
      - NEXT_PUBLIC_APP_URL=http://localhost:3000
      # Остальные переменные из .env.local (Docker Compose читает его автоматически)
    env_file:
      - .env.local
```

4. Файл Dockerfile — для production-сборки (не dev):

```dockerfile
# Стадия 1: сборка
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Build-time переменные Next.js
ARG NEXT_PUBLIC_YANDEX_METRIKA_ID
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_YANDEX_VERIFICATION
ARG NEXT_PUBLIC_GOOGLE_VERIFICATION
ENV NEXT_PUBLIC_YANDEX_METRIKA_ID=$NEXT_PUBLIC_YANDEX_METRIKA_ID
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_YANDEX_VERIFICATION=$NEXT_PUBLIC_YANDEX_VERIFICATION
ENV NEXT_PUBLIC_GOOGLE_VERIFICATION=$NEXT_PUBLIC_GOOGLE_VERIFICATION

RUN npm run build

# Стадия 2: production runtime
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Копируем только то что нужно для production
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/content ./content

RUN npm ci --omit=dev

EXPOSE 3000

CMD ["npm", "start"]
```

5. Файл docker-compose.prod.yml — запуск на сервере:

```yaml
services:
  web:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        NEXT_PUBLIC_YANDEX_METRIKA_ID: ${NEXT_PUBLIC_YANDEX_METRIKA_ID}
        NEXT_PUBLIC_APP_URL: https://app.komplid.ru
        NEXT_PUBLIC_YANDEX_VERIFICATION: ${NEXT_PUBLIC_YANDEX_VERIFICATION}
        NEXT_PUBLIC_GOOGLE_VERIFICATION: ${NEXT_PUBLIC_GOOGLE_VERIFICATION}
    restart: unless-stopped
    ports:
      - "3100:3000"
    env_file:
      - .env.production
```

ПРОВЕРКА локального запуска:

Запусти в терминале из папки проекта:

```bash
docker compose up --build
```

Открой http://localhost:3000 — должен увидеть страницу komplid-marketing.
Попробуй изменить что-то в src/app/page.tsx — изменения должны сразу подгрузиться
(hot reload). Это твой основной режим разработки.

Остановить: Ctrl+C или в другом терминале `docker compose down`.
```

### 1.5.2. Настройка сервера Timeweb

```
📋 ЗАДАЧА: Подготовить VDS на Timeweb к приёму Docker-приложения

1. В личном кабинете Timeweb Cloud создай новый VDS:
   - 2 CPU / 2 GB RAM / 40 GB NVMe Premium + DDoS (~1 200 ₽/мес)
   - Ubuntu 24.04 LTS
   - Выбери «Docker» в шаблонах (Timeweb уже предустановит Docker + Docker Compose)
     — если нет шаблона, берём чистый Ubuntu и ставим Docker вручную (см. шаг 3)
   - SSH-доступ по ключу (загружаешь свой публичный ключ)

2. Зарегистрируй DNS: в панели твоего регистратора домена komplid.ru добавь A-запись
   komplid.ru и www.komplid.ru → IP твоего VDS. Ожидание распространения 1-24 часа.

3. Подключись к серверу по SSH:

```bash
ssh root@ТВОЙ_IP_VDS
```

Выполни на сервере (если Docker не предустановлен):

```bash
# Установка Docker (если не из шаблона Timeweb)
curl -fsSL https://get.docker.com | sh
apt install -y docker-compose-plugin

# Nginx и Certbot для SSL
apt update
apt install -y nginx certbot python3-certbot-nginx

# Пользователь для деплоя (безопаснее чем root)
adduser komplid --disabled-password --gecos ""
usermod -aG docker komplid
usermod -aG sudo komplid

# Разрешить komplid заходить по SSH — копируем твой публичный ключ
mkdir -p /home/komplid/.ssh
cp /root/.ssh/authorized_keys /home/komplid/.ssh/
chown -R komplid:komplid /home/komplid/.ssh
chmod 700 /home/komplid/.ssh
chmod 600 /home/komplid/.ssh/authorized_keys
```

4. Создай папку для проекта:

```bash
su - komplid
mkdir -p /home/komplid/komplid-marketing
exit  # вернись в root
```

5. Настрой nginx как reverse proxy на Docker-контейнер.
   Создай /etc/nginx/sites-available/komplid.ru:

```nginx
server {
    listen 443 ssl http2;
    server_name komplid.ru www.komplid.ru;

    ssl_certificate /etc/letsencrypt/live/komplid.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/komplid.ru/privkey.pem;

    if ($host = www.komplid.ru) {
        return 301 https://komplid.ru$request_uri;
    }

    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Content-Type-Options "nosniff" always;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;
    gzip_min_length 1000;

    # Всё проксируем в Docker-контейнер на порт 3100
    location / {
        proxy_pass http://127.0.0.1:3100;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name komplid.ru www.komplid.ru;
    return 301 https://komplid.ru$request_uri;
}
```

6. Активируй конфиг и получи SSL-сертификат:

```bash
ln -s /etc/nginx/sites-available/komplid.ru /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default  # убрать дефолтный
nginx -t   # проверить синтаксис
certbot --nginx -d komplid.ru -d www.komplid.ru
systemctl reload nginx
```

ПРОВЕРКА:
- Открой https://komplid.ru в браузере — увидишь 502 Bad Gateway
  (потому что контейнер ещё не запущен — это нормально)
- В DNS Checker видно что A-запись разошлась
- SSL-сертификат валидный (замочек в браузере)
```

### 1.5.3. Скрипт деплоя

```
📋 ЗАДАЧА: Скрипт deploy.sh для быстрого обновления прода

Идея: ты работаешь локально, тестируешь через docker compose up,
когда готов к деплою — коммитишь в Git, пушишь в GitHub, и запускаешь
./deploy.sh с локальной машины. Скрипт сам заходит на сервер,
обновляет код и перезапускает контейнер.

1. Создай GitHub-репозиторий komplid-marketing (можно приватный).

2. На локальной машине:

```bash
cd ~/projects/komplid-marketing  # или где у тебя проект
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin git@github.com:ТВОЙЛОГИН/komplid-marketing.git
git push -u origin main
```

3. На сервере (зайди по SSH как пользователь komplid):

```bash
ssh komplid@ТВОЙ_IP_VDS

# Сгенерировать deploy-ключ на сервере
ssh-keygen -t ed25519 -f ~/.ssh/github_deploy -N ""

# Показать публичный ключ (его добавим в GitHub)
cat ~/.ssh/github_deploy.pub
```

Скопируй вывод и добавь на GitHub:
- Репо komplid-marketing → Settings → Deploy keys → Add deploy key
- Title: "Timeweb server"
- Key: вставь публичный ключ
- Allow write access: НЕ ставь галку (нам нужно только читать)

4. Настрой SSH на сервере использовать этот ключ для github.com:

```bash
cat > ~/.ssh/config <<'EOF'
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/github_deploy
  StrictHostKeyChecking no
EOF

chmod 600 ~/.ssh/config

# Проверь что SSH работает
ssh -T git@github.com
# Должно быть: "Hi ТВОЙЛОГИН/komplid-marketing! You've successfully..."

# Склонируй репозиторий
cd /home/komplid
rm -rf komplid-marketing  # если там была пустая папка
git clone git@github.com:ТВОЙЛОГИН/komplid-marketing.git
cd komplid-marketing

# Создай production env (значения подставь свои!)
cat > .env.production <<'EOF'
NEXT_PUBLIC_YANDEX_METRIKA_ID=12345678
NEXT_PUBLIC_APP_URL=https://app.komplid.ru
NEXT_PUBLIC_YANDEX_VERIFICATION=abc...
NEXT_PUBLIC_GOOGLE_VERIFICATION=xyz...
INTERNAL_API_URL=https://app.komplid.ru/api/public
INTERNAL_API_TOKEN=ТОКЕН
EOF

chmod 600 .env.production  # только komplid может читать

# Первый запуск
docker compose -f docker-compose.prod.yml up -d --build

# Проверь что контейнер работает
docker ps  # должен увидеть komplid-marketing-web-1
curl http://localhost:3100/  # вернёт HTML главной
```

Открой https://komplid.ru в браузере — теперь должен работать.

5. На локальной машине создай файл deploy.sh в корне проекта:

```bash
#!/bin/bash

# Скрипт деплоя komplid-marketing на Timeweb
# Запускается локально: ./deploy.sh
set -e

# Настройки — подставь свой IP
SERVER_HOST="komplid@ТВОЙ_IP_VDS"
PROJECT_DIR="/home/komplid/komplid-marketing"
BRANCH="${1:-main}"   # можно вызвать ./deploy.sh dev для другой ветки

echo "🚀 Деплоим ветку '$BRANCH' на $SERVER_HOST..."

# 1. Убедимся что локально всё закоммичено
if [[ -n $(git status --porcelain) ]]; then
  echo "❌ В локальном репозитории есть незакоммиченные изменения"
  echo "Сделай git commit или git stash перед деплоем"
  exit 1
fi

# 2. Запушить в GitHub
echo "📤 Пушим свежий код в GitHub..."
git push origin "$BRANCH"

# 3. Зайти на сервер и обновить
echo "🔄 Обновляем сервер..."
ssh "$SERVER_HOST" bash <<EOF
  set -e
  cd $PROJECT_DIR
  echo "  📥 Стягиваем обновления..."
  git fetch origin
  git reset --hard origin/$BRANCH
  
  echo "  🐳 Пересобираем Docker-образ..."
  docker compose -f docker-compose.prod.yml up -d --build
  
  echo "  🧹 Чистим старые образы..."
  docker image prune -f
EOF

# 4. Проверка что сайт доступен
echo "🔍 Проверяем что сайт работает..."
sleep 5
if curl -sf https://komplid.ru/ > /dev/null; then
  echo "✅ Успех! https://komplid.ru обновлён"
else
  echo "⚠️  Сайт не отвечает. Проверь: ssh $SERVER_HOST docker logs komplid-marketing-web-1"
  exit 1
fi
```

Сделай исполняемым:

```bash
chmod +x deploy.sh
```

ИСПОЛЬЗОВАНИЕ:

Твой типичный рабочий день:
1. Открываешь VS Code
2. Пишешь код
3. `docker compose up` — видишь на localhost:3000 как выглядит
4. Доволен → `git add . && git commit -m "описание"`
5. `./deploy.sh` — всё. Через 2-3 минуты https://komplid.ru обновлён.

Первый деплой займёт 5-7 минут (Docker качает базовые образы, ставит зависимости).
Последующие — 2-3 минуты (кэш Docker).

ПРОВЕРКА Фазы 1:
- [x] Проект запускается локально через `docker compose up`
- [x] TypeScript без ошибок
- [x] Header + Footer в стиле Komplid
- [x] SEO-фундамент: sitemap, robots, JSON-LD
- [x] Яндекс Метрика
- [x] Сайт задеплоен на komplid.ru через SSL
- [x] `./deploy.sh` работает — изменения уезжают на прод за 2-3 минуты
- [x] Lighthouse > 90
- [x] Яндекс Вебмастер + Google Search Console подтверждены
```


---

# ФАЗА 2 — Главная + B2C-посадочные (4-5 дней) ⬜

## Шаг 2.1 — Главная страница

```
📋 ЗАДАЧА: Главная komplid.ru — B2B focus, в стиле design/landing-reference.html

ИЗМЕНЕНИЯ ОТ ОРИГИНАЛА:
1. Цены актуальные из Модуля 15 + упоминание Профи-пакетов
2. FAQ-блок (7 вопросов) с FaqSchema — КРИТИЧНО для AEO
3. Секция с последними постами блога (внутренняя перелинковка)

src/app/page.tsx:

```tsx
import type { Metadata } from 'next';
import { Hero } from '@/components/blocks/Hero';
import { Modules } from '@/components/blocks/Modules';
import { Features } from '@/components/blocks/Features';
import { Metrics } from '@/components/blocks/Metrics';
import { Quote } from '@/components/blocks/Quote';
import { Pricing } from '@/components/blocks/Pricing';
import { Faq } from '@/components/blocks/Faq';
import { Cta } from '@/components/blocks/Cta';
import { SoftwareAppSchema } from '@/components/seo/SoftwareAppSchema';
import { ProfiPackagesTeaser } from '@/components/blocks/ProfiPackagesTeaser';
import { LatestPosts } from '@/components/blocks/LatestPosts';

export const metadata: Metadata = {
  title: 'Komplid — ERP для строительных проектов · ИД, Сметы, Журналы онлайн',
  description:
    'Цифровое управление строительством: 18 модулей в одной системе. ИД, КС-2/КС-3, ОЖР, смета, стройконтроль, ТИМ. От 12 000 ₽/мес для команды, от 1 900 ₽ для специалиста. Пробный период 14 дней.',
  alternates: { canonical: 'https://komplid.ru/' },
};

export default function HomePage() {
  return (
    <>
      <SoftwareAppSchema
        name="Komplid"
        description="ERP для строительных проектов"
        url="https://komplid.ru"
      />

      <Hero
        eyebrow="ERP для строительных проектов"
        title={<>
          <span className="line">Стройка</span>
          <span className="line">без <em>бумаг, потерь</em></span>
          <span className="line">и недельных сверок.</span>
        </>}
        subtitle="Komplid ведёт объект от ПИР и сметы до КС-2 и ввода в эксплуатацию. 18 модулей в одной системе: ИД, ГПР, СК, ТИМ, журналы, отчёты — с реальным числом полей, подписей и ссылок между документами по СП и СНиП."
        primaryCta={{ label: 'Попробовать 14 дней', href: 'https://app.komplid.ru/signup' }}
        secondaryCta={{ label: 'Посмотреть демо', href: '/demo' }}
      />

      <Metrics
        eyebrow="Komplid в цифрах"
        title="Данные, которые команды собрали за первый год"
        variant="dark"
        items={[
          { number: '−42%', label: 'Время на выпуск КС-2', description: 'За счёт автозаполнения из АОСР, журналов и ГПР.' },
          { number: '3.4×', label: 'Скорость согласования', description: 'Параллельные маршруты вместо писем «по цепочке».' },
          { number: '152', label: 'Действующих строек', description: 'От ИЖС до ЖК на 1200+ квартир.' },
          { number: '99.98%', label: 'Доступность SaaS', description: 'Серверы в РФ, ФЗ-152.' },
        ]}
      />

      <Modules />

      <Features
        title="Главные возможности"
        items={[
          /* 6-9 ключевых фич */
        ]}
      />

      <ProfiPackagesTeaser />

      <Quote
        eyebrow="История команды"
        text="Раньше чтобы закрыть месяц, мы собирали журналы, АОСР и КС три дня. В Komplid — нажал «Сформировать пакет» и получил архив. Инспектор перестал возвращать документы."
        author={{ name: 'Михаил Иванов', role: 'Руководитель проектов, АО «СевЗапСтрой»', initials: 'МИ' }}
        stats={[
          { label: 'Объектов в Komplid', value: '8' },
          { label: 'Экономия времени', value: '12 ч/нед' },
          { label: 'Снижение возвратов ИД', value: '−68%' },
          { label: 'Окупилось за', value: '2.5 мес' },
        ]}
      />

      <Pricing
        title="Прозрачные цены. Без скрытых лимитов на объекты."
        description="Любой тариф включает все 18 модулей."
        tiers={[
          {
            name: 'Старт',
            subtitle: 'Одна команда, один объект.',
            price: '12 000',
            priceUnit: '₽/мес',
            priceNote: 'до 10 пользователей · 50 ГБ',
            features: [
              { text: 'Все 18 модулей', included: true },
              { text: 'Мобильное приложение', included: true },
              { text: 'Базовые шаблоны КС, АОСР, ОЖР', included: true },
              { text: 'ЭЦП маршруты', included: false },
              { text: 'Приоритетная поддержка', included: false },
            ],
            cta: { label: 'Начать пробный период', href: 'https://app.komplid.ru/signup?plan=start' },
          },
          {
            name: 'Команда',
            subtitle: 'Генподрядчик и заказчик с несколькими объектами.',
            price: '48 000',
            priceUnit: '₽/мес',
            priceNote: 'до 50 пользователей · 1 ТБ · до 10 объектов',
            features: [
              { text: 'Всё из «Старт»', included: true },
              { text: 'ЭЦП + маршруты согласований', included: true },
              { text: 'ТИМ · IFC, BCF, коллизии', included: true },
              { text: 'Интеграция с 1С, Гранд-сметой', included: true },
              { text: 'SLA 8×5, чат и менеджер', included: true },
            ],
            cta: { label: 'Выбрать «Команду»', href: 'https://app.komplid.ru/signup?plan=team' },
            featured: true,
          },
          {
            name: 'Корпоративный',
            subtitle: 'Группы компаний и холдинги.',
            price: 'По запросу',
            priceUnit: '',
            features: [
              { text: 'Всё из «Команды»', included: true },
              { text: 'On-premise в вашем контуре', included: true },
              { text: 'Кастомизация под процессы', included: true },
              { text: 'SLA 24×7, менеджер внедрения', included: true },
              { text: 'SSO, ActiveDirectory', included: true },
            ],
            cta: { label: 'Связаться', href: '/company/contact' },
          },
        ]}
      />

      {/* FAQ — КРИТИЧНО ДЛЯ AEO */}
      <Faq
        title="Частые вопросы"
        items={[
          {
            question: 'Что такое Komplid?',
            answer: 'Komplid — это облачная ERP-система для управления строительными проектами в России. Она объединяет 18 модулей: исполнительную документацию, сметы, журналы работ, стройконтроль, ТИМ, управление ресурсами. Подходит для генподрядчиков, заказчиков, технадзора и одиночных специалистов.',
          },
          {
            question: 'Чем Komplid отличается от ЦУС и Exon?',
            answer: 'Komplid отличается тремя ключевыми особенностями. Во-первых, это единственная платформа в России с Профи-пакетами для одиночных специалистов от 1 900 ₽ в месяц (сметчики, ПТО, прорабы). Во-вторых, у Komplid работает PWA с полноценным offline-режимом для объектов без связи. В-третьих, цены фиксированные и публичные.',
          },
          {
            question: 'Сколько стоит Komplid?',
            answer: 'Для компаний: «Старт» 12 000 ₽/мес до 10 пользователей, «Команда» 48 000 ₽/мес до 50 пользователей, «Корпоративный» индивидуально. Для специалистов: Профи-пакеты (Сметчик-Студио, ИД-Мастер, Прораб-Журнал) 1 900-2 900 ₽/мес. Годовая подписка со скидкой 20%.',
          },
          {
            question: 'Хранятся ли данные в России?',
            answer: 'Да. Вся инфраструктура Komplid размещена в российских дата-центрах Timeweb Cloud (Москва, Санкт-Петербург). Платформа соответствует требованиям ФЗ-152 о персональных данных. Данные не передаются в зарубежные юрисдикции.',
          },
          {
            question: 'Есть ли бесплатный период?',
            answer: 'Да, 14 дней полного доступа ко всем функциям тарифа Pro без привязки карты. После окончания вы можете выбрать тариф или остаться на бесплатном уровне Freemium с базовыми возможностями.',
          },
          {
            question: 'Работает ли Komplid офлайн на стройке?',
            answer: 'Да, мобильное приложение Komplid работает как PWA с полноценным offline-режимом. Прораб может вести ОЖР, делать фото с GPS-координатами, фиксировать дефекты без интернета. При появлении связи всё синхронизируется автоматически.',
          },
          {
            question: 'Можно ли использовать Komplid на одном объекте?',
            answer: 'Да. Тариф «Старт» рассчитан именно на один объект и подходит для пилотного проекта. Также у нас есть Профи-пакеты для одиночных специалистов, которые ведут собственные сметы или исполнительную документацию без привязки к компании.',
          },
        ]}
      />

      <LatestPosts limit={3} />

      <Cta
        title="Готовы попробовать?"
        description="14 дней полного доступа без карты. Настройка за 1 день."
        primary={{ label: 'Начать бесплатно', href: 'https://app.komplid.ru/signup' }}
        secondary={{ label: 'Заказать демо', href: '/demo' }}
      />
    </>
  );
}
```

Создать также ProfiPackagesTeaser.tsx и LatestPosts.tsx.

ProfiPackagesTeaser — блок с 3 карточками (Сметчик-Студио, ИД-Мастер, Прораб-Журнал)
с ценами от 1 900 ₽ и ссылками на /smetchik, /pto, /prorab.

LatestPosts — загружает 3 последние статьи через getAllBlogPosts() из content-loader.

ВАЖНО ДЛЯ AEO:
- Hero subtitle = прямой ответ "что такое Komplid"
- FAQ содержит все 7 главных вопросов, по которым люди спрашивают AI
- Цены конкретные — AI любит конкретику
- Упоминание конкурентов в FAQ — GEO-сигнал "мы в этой категории"

ПРОВЕРКА:
- Lighthouse > 90 (Performance, SEO, Accessibility)
- Rich Results Test: FAQPage, Organization, SoftwareApplication valid
- Все внутренние ссылки работают
- На мобилке читается, CTA в зоне большого пальца
```

## Шаг 2.2 — Посадочная /smetchik

```
📋 ЗАДАЧА: B2C-посадочная Сметчик-Студио

ЦЕЛЕВАЯ АУДИТОРИЯ: Сметчик в частной практике или небольшой компании.
ГЛАВНЫЙ PAIN: Excel + Гранд-Смета = неудобно сравнивать версии, сложно делиться.
ГЛАВНАЯ ВЫГОДА: Публичная ссылка на смету за 1 клик, версии с визуальным diff.

SEO-запросы:
- "программа для сметчика онлайн"
- "аналог гранд смета онлайн"
- "сравнение смет онлайн"
- "смета в облаке"
- "сметчик фрилансер ПО"

AEO-вопросы, на которые отвечаем:
- "Какая лучшая программа для сметчика?"
- "Как сравнить две сметы онлайн?"
- "Есть ли облачный аналог Гранд-Сметы?"
- "Сколько стоит программа для сметчика?"

src/app/smetchik/page.tsx — структура:

1. BreadcrumbSchema: Главная → Сметчик-Студио
2. SoftwareAppSchema с price 1900 ₽

3. Hero:
   - Eyebrow: "Профи-пакет Komplid · Для сметчиков"
   - Title: "Сметчик-Студио — программа для сметчика от 1 900 ₽/мес"
   - Subtitle: ПРЯМОЙ ОТВЕТ в первом абзаце:
     "Облачная альтернатива Гранд-Смете для одиночных сметчиков. Импорт XML 
     из Гранд-Смета/РИК, сравнение двух версий за один клик, публичная ссылка 
     для подрядчика без регистрации. Триал 14 дней без карты."
   - CTA: "Попробовать бесплатно" → app.komplid.ru/signup/solo?role=smetchik&utm_source=smetchik_landing

4. Features (6 штук, каждая = отдельный AEO-ответ):
   - Импорт XML/Excel/PDF (распознавание через ИИ)
   - Сравнение версий в один клик (визуальный diff)
   - Публичная ссылка на смету (без регистрации заказчика)
   - ФГИС ЦС прямо в приложении
   - Библиотека расценок и шаблонов
   - Экспорт в Гранд-Смета XML

5. ComparisonTable — критично для AEO:
   "Сметчик-Студио vs Гранд-Смета vs Excel"
   8-10 строк с конкретными возможностями.

6. Скриншоты интерфейса (2-3 штуки).

7. Quote от сметчика: "Раньше я открывал Excel двух версий на двух мониторах..."

8. Pricing (B2C для сметчика):
   - Бесплатно (0 ₽): до 5 смет, просмотр
   - Базовый (1 900 ₽/мес): импорт XML/Excel, базовое сравнение
   - Pro (2 900 ₽/мес): безлимит, продвинутое сравнение, публичные ссылки, ФГИС ЦС
   
   Тумблер "Месяц/Год −20%".

9. Faq — 8 вопросов специфично для сметчиков:
   - "Можно ли импортировать смету из Гранд-Сметы?"
   - "Как сравнить две версии сметы?"
   - "Что такое публичная ссылка на смету?"
   - "Подходит ли Сметчик-Студио для ИП и самозанятых?"
   - "Есть ли ФГИС ЦС?"
   - "Можно ли работать офлайн?"
   - "Сколько стоит Сметчик-Студио?"
   - "Можно ли использовать вместе с Гранд-Сметой?"

10. CTA: "Попробуйте Сметчик-Студио бесплатно"

UTM-метки на все CTA:
?utm_source=landing&utm_medium=organic&utm_campaign=smetchik&role=smetchik

ПРОВЕРКА:
- Rich Results Test → SoftwareApplication, FAQPage, Breadcrumb valid
- Через 1-2 недели индексации: в Perplexity/ChatGPT по запросу 
  "какая программа для сметчика онлайн дешевле Гранд-Сметы" — упоминается Сметчик-Студио
- Lighthouse > 90
```

## Шаг 2.3 — Посадочная /pto

```
📋 ЗАДАЧА: B2C-посадочная ИД-Мастер

ЦЕЛЕВАЯ АУДИТОРИЯ: Инженер ПТО в частной практике или небольшой компании.
ГЛАВНЫЙ PAIN: Ручное заполнение АОСР/ОЖР в Word, возвраты от инспекторов.
ГЛАВНАЯ ВЫГОДА: Автогенерация АОСР из ОЖР, 50+ шаблонов по приказу №344/пр, ЭЦП.

SEO-запросы:
- "исполнительная документация онлайн"
- "АОСР скачать шаблон"
- "ОЖР электронный"
- "программа для ПТО"
- "КС-2 автоматически"

src/app/pto/page.tsx — по структуре как /smetchik, но с фичами под ПТО:

Hero:
- Title: "ИД-Мастер — исполнительная документация онлайн от 1 900 ₽/мес"
- Subtitle: "Автоматическая генерация АОСР, КС-2, КС-3 из записей журналов. 
  50+ шаблонов по приказу №344/пр. Маршруты согласования с ЭЦП. Пакетный экспорт 
  ИД в PDF. Для ПТО-инженеров и небольших отделов. Триал 14 дней."

Features (6 штук):
1. 50+ шаблонов АОСР по приказу №344/пр
2. Автогенерация АОСР из записей ОЖР одной кнопкой
3. Маршруты согласования (Подрядчик → Генподрядчик → Технадзор → Заказчик)
4. ЭЦП КриптоПро + Машиночитаемая доверенность (МЧД)
5. Пакетный экспорт ИД в PDF/ZIP
6. Электронный ОЖР по приказу №1026/пр Ростехнадзора

ComparisonTable: "ИД-Мастер vs Word+Excel vs Корпоративный ЦУС"

FAQ (8 вопросов):
- "Как сгенерировать АОСР автоматически?"
- "Какие виды актов поддерживает ИД-Мастер?"
- "Можно ли подписать АОСР электронной подписью?"
- "Что такое маршрут согласования?"
- "Соответствует ли формат приказу №344/пр?"
- "Сколько стоит ИД-Мастер для ПТО?"
- "Можно ли экспортировать в XML для ИСУП Минстроя?"
- "Работает ли в небольших компаниях (до 5 человек)?"

Pricing:
- Бесплатно: до 10 АОСР/мес
- Базовый (1 900 ₽): АОСР + ОЖР + ЭЦП, до 50 актов/мес, 1 объект
- Pro (2 900 ₽): Безлимит, КС-2/КС-3, маршруты, XML ИСУП, 5 объектов

CTA: utm_source=landing&role=pto
```

## Шаг 2.4 — Посадочная /prorab

```
📋 ЗАДАЧА: B2C-посадочная Прораб-Журнал

ЦЕЛЕВАЯ АУДИТОРИЯ: Прораб, мастер СМР. На объекте, с телефона.
ГЛАВНЫЙ PAIN: Бумажный ОЖР неудобен, плохо работает со связью на объекте.
ГЛАВНАЯ ВЫГОДА: Mobile PWA с offline, голосовой ввод, фото с GPS.

SEO-запросы:
- "ОЖР с телефона"
- "электронный журнал работ"
- "мобильное приложение прораба"
- "программа для прораба"

src/app/prorab/page.tsx:

Hero:
- Title: "Прораб-Журнал — мобильное приложение прораба от 1 900 ₽/мес"
- Subtitle: "Ведите ОЖР, делайте фото с GPS, фиксируйте дефекты прямо со 
  стройки. Работает офлайн — записи синхронизируются при появлении связи. 
  PWA-приложение без App Store и Google Play."

Features (6 штук) — мобильный фокус:
1. Полный офлайн-режим с автосинком
2. Голосовой ввод ОЖР (Yandex SpeechKit)
3. Фото с GPS + аннотациями
4. Дефекты с фото и сроками
5. Bottom-tab навигация — 3 тапа до любой задачи
6. Автопередача данных в ПТО-модуль

БЛОК "Как установить":
- Android: 3 скриншота + инструкция
- iPhone: 3 скриншота + инструкция (Safari → Поделиться → На главный)

ComparisonTable: "Прораб-Журнал vs бумажный ОЖР vs ЦУС мобильный"

Quote — реальный сценарий прораба:
"Раньше на стройке я делал заметки в телефоне, потом вечером переписывал 
в бумажный журнал. Забывал половину. Сейчас сразу диктую голосом, фото 
с GPS прикрепляется, вечером просто проверяю — журнал готов."

FAQ (7 вопросов):
- "Как установить без Google Play или App Store?"
- "Работает ли без интернета?"
- "Соответствует ли приказу №1026/пр?"
- "Можно ли голосовой ввод?"
- "Что такое фото с GPS?"
- "Как передать журнал в ПТО?"
- "Сколько стоит Прораб-Журнал?"

Pricing:
- Бесплатно: 1 объект, до 30 записей/мес
- Базовый (1 900 ₽): 3 объекта, голосовой ввод, фото, дефекты
- Pro (2 900 ₽): 10 объектов, автогенерация АОСР из записей, push-уведомления

CTA: utm_source=landing&role=prorab
```

---

# ФАЗА 3 — Блог и первые статьи (4 дня) ⬜

## Шаг 3.1 — MDX-движок

```
📋 ЗАДАЧА: Настроить MDX-блог с кастомными компонентами

1. mdx-components.tsx в корне:

```tsx
import type { MDXComponents } from 'mdx/types';
import Image from 'next/image';
import Link from 'next/link';
import { Callout } from '@/components/mdx/Callout';
import { StepList, Step } from '@/components/mdx/StepList';
import { ComparisonTable } from '@/components/mdx/ComparisonTable';
import { DownloadCard } from '@/components/mdx/DownloadCard';
import { Quote } from '@/components/mdx/Quote';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => <h1 className="text-4xl font-semibold mt-0 mb-6">{children}</h1>,
    h2: ({ children, id }) => (
      <h2 id={id} className="text-2xl font-semibold mt-12 mb-4 scroll-mt-20">{children}</h2>
    ),
    h3: ({ children, id }) => (
      <h3 id={id} className="text-xl font-semibold mt-8 mb-3 scroll-mt-20">{children}</h3>
    ),
    p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
    a: ({ href, children, ...props }) => {
      const isExternal = href?.startsWith('http');
      if (isExternal) return <a href={href} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>;
      return <Link href={href ?? '#'} {...props}>{children}</Link>;
    },
    img: ({ src, alt, ...props }) => (
      <Image src={src ?? ''} alt={alt ?? ''} width={800} height={450} className="rounded-lg my-8" {...props} />
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-accent pl-4 italic my-6">{children}</blockquote>
    ),
    // Custom
    Callout,
    StepList,
    Step,
    ComparisonTable,
    DownloadCard,
    Quote,
    ...components,
  };
}
```

2. src/components/mdx/Callout.tsx:

```tsx
interface Props {
  type?: 'info' | 'warning' | 'tip' | 'success';
  title?: string;
  children: React.ReactNode;
}

export function Callout({ type = 'info', title, children }: Props) {
  const styles = {
    info: 'bg-blue-50 border-blue-500',
    warning: 'bg-amber-50 border-amber-500',
    tip: 'bg-emerald-50 border-emerald-500',
    success: 'bg-green-50 border-green-500',
  };
  return (
    <div className={`p-4 border-l-4 rounded-r-lg my-6 ${styles[type]}`}>
      {title && <div className="font-semibold mb-1">{title}</div>}
      <div>{children}</div>
    </div>
  );
}
```

3. src/components/mdx/ComparisonTable.tsx (для AEO):

```tsx
interface Props {
  columns: string[];
  rows: Array<{ feature: string; values: Array<string | boolean> }>;
}

export function ComparisonTable({ columns, rows }: Props) {
  return (
    <div className="overflow-x-auto my-8">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-ink">
            <th className="text-left py-2 px-4">Возможность</th>
            {columns.map(col => <th key={col} className="py-2 px-4 text-center">{col}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-border">
              <td className="py-2 px-4 font-medium">{row.feature}</td>
              {row.values.map((v, j) => (
                <td key={j} className="py-2 px-4 text-center">
                  {typeof v === 'boolean' ? (v ? '✓' : '✗') : v}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

4. src/content-loader/blog.ts:

```typescript
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

const CONTENT_DIR = path.join(process.cwd(), 'content', 'blog');

export interface BlogPostFrontmatter {
  title: string;
  description: string;
  slug: string;
  publishedAt: string;
  modifiedAt?: string;
  author: string;
  tags: string[];
  image?: string;
  // AEO-специфичные поля
  primaryQuestion: string;      // главный вопрос статьи (AEO)
  keyTakeaway: string;           // короткий ответ — цитируется AI
  readingTime?: number;
  featured?: boolean;
}

export interface BlogPost extends BlogPostFrontmatter {
  content: string;
}

export async function getAllBlogPosts(): Promise<BlogPostFrontmatter[]> {
  const files = await fs.readdir(CONTENT_DIR);
  const mdxFiles = files.filter(f => f.endsWith('.mdx'));
  const posts = await Promise.all(
    mdxFiles.map(async (file) => {
      const filePath = path.join(CONTENT_DIR, file);
      const source = await fs.readFile(filePath, 'utf-8');
      const { data } = matter(source);
      return { ...data, slug: data.slug ?? file.replace(/\.mdx$/, '') } as BlogPostFrontmatter;
    })
  );
  return posts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const filePath = path.join(CONTENT_DIR, `${slug}.mdx`);
    const source = await fs.readFile(filePath, 'utf-8');
    const { data, content } = matter(source);
    return { ...data, slug, content } as BlogPost;
  } catch { return null; }
}

export async function getRelatedPosts(slug: string, limit = 3): Promise<BlogPostFrontmatter[]> {
  const current = await getBlogPostBySlug(slug);
  if (!current) return [];
  const all = await getAllBlogPosts();
  return all
    .filter(p => p.slug !== slug)
    .map(p => ({ post: p, score: p.tags.filter(t => current.tags.includes(t)).length }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(x => x.post);
}
```

5. src/app/blog/page.tsx — список:

```tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllBlogPosts } from '@/content-loader/blog';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';

export const metadata: Metadata = {
  title: 'Блог — исполнительная документация, сметы, стройконтроль',
  description: 'Гайды для инженеров стройки: шаблоны АОСР и ОЖР, сравнение смет, нормативы.',
  alternates: { canonical: 'https://komplid.ru/blog' },
};

export default async function BlogPage() {
  const posts = await getAllBlogPosts();

  return (
    <>
      <BreadcrumbSchema items={[
        { name: 'Главная', url: 'https://komplid.ru' },
        { name: 'Блог', url: 'https://komplid.ru/blog' },
      ]} />
      <div className="wrap section">
        <h1>Блог Komplid</h1>
        <p className="text-ink-soft mb-12">Гайды, шаблоны и нормативы для инженеров стройки</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map(post => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
              <article className="space-y-3">
                {post.image && (
                  <div className="aspect-[16/9] bg-bg-inset rounded-lg overflow-hidden">
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                )}
                <div className="flex gap-2 text-xs text-ink-muted">
                  {post.tags.map(tag => <span key={tag}>#{tag}</span>)}
                </div>
                <h2 className="text-xl font-semibold group-hover:text-accent transition-colors">{post.title}</h2>
                <p className="text-ink-soft text-sm">{post.description}</p>
                <div className="text-xs text-ink-muted">
                  {new Date(post.publishedAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
```

6. src/app/blog/[slug]/page.tsx — статья:

```tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getAllBlogPosts, getBlogPostBySlug, getRelatedPosts } from '@/content-loader/blog';
import { useMDXComponents } from '@/mdx-components';
import { ArticleSchema } from '@/components/seo/ArticleSchema';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';
import { TableOfContents } from '@/components/blog/TableOfContents';
import { ShareButtons } from '@/components/blog/ShareButtons';
import { RelatedPosts } from '@/components/blog/RelatedPosts';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

interface Params { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const posts = await getAllBlogPosts();
  return posts.map(post => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    keywords: post.tags,
    alternates: { canonical: `https://komplid.ru/blog/${slug}` },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.description,
      publishedTime: post.publishedAt,
      modifiedTime: post.modifiedAt,
      authors: [post.author],
      tags: post.tags,
      images: post.image ? [post.image] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: Params) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();
  const related = await getRelatedPosts(slug);
  const components = useMDXComponents({});
  const url = `https://komplid.ru/blog/${slug}`;

  return (
    <>
      <BreadcrumbSchema items={[
        { name: 'Главная', url: 'https://komplid.ru' },
        { name: 'Блог', url: 'https://komplid.ru/blog' },
        { name: post.title, url },
      ]} />
      <ArticleSchema
        title={post.title}
        description={post.description}
        url={url}
        imageUrl={post.image}
        publishedAt={post.publishedAt}
        modifiedAt={post.modifiedAt}
        authorName={post.author}
      />

      <article className="wrap max-w-3xl section">
        <header className="mb-12">
          <div className="flex gap-2 text-sm text-ink-muted mb-4">
            {post.tags.map(tag => <span key={tag} className="px-2 py-1 bg-bg-inset rounded">#{tag}</span>)}
          </div>
          <h1 className="text-4xl font-semibold mb-6">{post.title}</h1>
          <p className="text-xl text-ink-soft">{post.description}</p>
          <div className="flex items-center gap-4 mt-6 text-sm text-ink-muted">
            <span>{post.author}</span>
            <span>·</span>
            <time dateTime={post.publishedAt}>
              {new Date(post.publishedAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
            </time>
            {post.readingTime && (<><span>·</span><span>{post.readingTime} мин чтения</span></>)}
          </div>
        </header>

        {/* Key takeaway — КРИТИЧНО ДЛЯ AEO */}
        {post.keyTakeaway && (
          <div className="bg-bg-inset border-l-4 border-accent p-4 rounded-r-lg mb-8">
            <div className="text-xs uppercase font-mono text-ink-muted mb-1">Главное</div>
            <div className="font-medium">{post.keyTakeaway}</div>
          </div>
        )}

        <TableOfContents content={post.content} />

        {post.image && (
          <img src={post.image} alt={post.title} className="w-full aspect-[16/9] object-cover rounded-lg mb-12" />
        )}

        <div className="prose prose-lg">
          <MDXRemote
            source={post.content}
            components={components}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm],
                rehypePlugins: [rehypeSlug, [rehypeAutolinkHeadings, { behavior: 'wrap' }]],
              },
            }}
          />
        </div>

        <ShareButtons url={url} title={post.title} />
        {related.length > 0 && <RelatedPosts posts={related} />}
      </article>
    </>
  );
}
```

ПРОВЕРКА:
- Создать тестовый content/blog/hello-world.mdx
- /blog → список, /blog/hello-world → рендерится
- MDX-компоненты работают
- Article + Breadcrumb schemas валидны
```

## Шаг 3.2 — Правила написания SEO/AEO/GEO-статей

```
📋 ЗАДАЧА: Написать 5 первых SEO/AEO-оптимизированных статей

ПРИНЦИПЫ КАЖДОЙ СТАТЬИ (это правила для всех будущих статей):

1. ПРЯМОЙ ОТВЕТ в первых 2-3 предложениях. НЕ "В этой статье рассмотрим...",
   а сразу ответ на главный вопрос. AI берёт отсюда цитату.

2. СТРУКТУРА H2 = вопросы из семантики. Например для "шаблон АОСР":
   - "Что такое АОСР и для чего он нужен?"
   - "Как правильно заполнить АОСР?"
   - "Какой приказ регламентирует форму АОСР?"
   - "Где скачать актуальный шаблон?"

3. ЗАВЕРШЕНИЕ СТАТЬИ — FAQ-блок с FaqSchema (5-7 вопросов).

4. КЛЮЧЕВЫЕ ФАКТЫ выделены как Callout — AI их забирает как цитаты.

5. ТАБЛИЦЫ И СПИСКИ — AI любит структурированный контент.

6. АВТОРИТЕТНЫЕ ССЫЛКИ — Минстрой РФ, Ростехнадзор, ГОСТы, приказы.

7. ВНУТРЕННИЕ ССЫЛКИ — минимум 3 на другие страницы сайта (посадочные,
   статьи, калькуляторы, шаблоны).

8. ШАБЛОН FRONTMATTER для каждой статьи:

```yaml
---
title: "Скачать шаблон АОСР 2026 (по приказу №344/пр) — образец .docx"
description: "Бесплатный шаблон акта освидетельствования скрытых работ по приказу Минстроя №344/пр. Форма 2026 года, готова к заполнению. Инструкция по заполнению и типичные ошибки."
slug: "skachat-shablon-aosr"
publishedAt: "2026-05-01"
modifiedAt: "2026-05-01"
author: "Komplid"
tags: ["шаблоны", "АОСР", "исполнительная-документация", "приказ-344пр"]
image: "/images/blog/shablon-aosr.jpg"
primaryQuestion: "Где скачать актуальный шаблон АОСР в 2026 году?"
keyTakeaway: "Актуальная форма АОСР регламентируется приказом Минстроя РФ №344/пр от 2015 года с последними изменениями. Бесплатный шаблон .docx и .xlsx можно скачать по ссылке ниже, либо генерировать автоматически в Komplid ИД-Мастер."
readingTime: 5
---
```

ТЕМЫ ПЕРВЫХ 5 СТАТЕЙ (приоритет по SEO-трафику):

1. "Скачать шаблон АОСР 2026 (приказ №344/пр)" — slug: skachat-shablon-aosr
   - Поисковик трафик: ~5 000 запросов/мес на "скачать шаблон АОСР"
   - CTA: → /shablony/aosr и → /pto

2. "Как сравнить две сметы в Excel (3 способа) — и почему все они медленные"
   - slug: kak-sravnit-smety-excel
   - CTA: → /smetchik

3. "Электронный ОЖР с телефона: инструкция по приказу №1026/пр"
   - slug: ozr-s-telefona
   - CTA: → /prorab

4. "Komplid vs ЦУС: подробное сравнение для выбора в 2026"
   - slug: sravnenie-komplid-cus
   - CTA: → /signup?ref=comparison

5. "Как вести исполнительную документацию онлайн: полный гайд 2026"
   - slug: kak-vesti-id-onlayn
   - CTA: → /pto
```

## Шаг 3.3 — Первая статья как пример

```
📋 ЗАДАЧА: Написать первую статью как эталон структуры

content/blog/skachat-shablon-aosr.mdx:

```mdx
---
title: "Скачать шаблон АОСР 2026 по приказу №344/пр — образец .docx"
description: "Бесплатный шаблон акта освидетельствования скрытых работ по приказу Минстроя №344/пр. Форма 2026 года. Инструкция по заполнению и типичные ошибки."
slug: "skachat-shablon-aosr"
publishedAt: "2026-05-01"
author: "Komplid"
tags: ["шаблоны", "АОСР", "исполнительная-документация", "приказ-344пр"]
image: "/images/blog/shablon-aosr.jpg"
primaryQuestion: "Где скачать актуальный шаблон АОСР?"
keyTakeaway: "Актуальная форма АОСР регламентируется приказом Минстроя РФ №344/пр. Бесплатный шаблон .docx доступен по ссылке ниже, либо может генерироваться автоматически в Komplid ИД-Мастер."
readingTime: 5
---

АОСР (акт освидетельствования скрытых работ) — это обязательный документ исполнительной документации, который фиксирует факт освидетельствования работ, скрываемых последующими строительными работами или конструкциями. Актуальная форма АОСР установлена **приказом Минстроя РФ №344/пр от 2015 года** с последующими изменениями.

<Callout type="success" title="Бесплатный шаблон">
Скачайте готовый шаблон АОСР в формате .docx по ссылке ниже — в нём уже заполнены реквизиты, таблицы и ссылки на нормативные документы.
</Callout>

<DownloadCard
  title="Шаблон АОСР 2026 (приказ №344/пр)"
  description="Готовый для заполнения документ. Формат .docx, 95 КБ."
  filename="shablon-aosr-344pr.docx"
  format="docx"
  size="95 КБ"
  downloadUrl="/api/template-download?slug=aosr"
/>

## Что такое АОСР и для чего он нужен

АОСР составляется после завершения работ, которые будут скрыты последующими этапами строительства. Пример: арматурный каркас фундамента до заливки бетоном, гидроизоляция до устройства стяжки, электропроводка до штукатурки стен.

**Основная функция АОСР:**

- Зафиксировать факт выполнения работ в объёме и качестве проектной документации
- Подтвердить право производить последующие работы
- Войти в комплект исполнительной документации по объекту

Без оформленного АОСР дальнейшие работы не могут быть приняты по акту КС-2, а объект не будет принят в эксплуатацию.

## Какой приказ регламентирует АОСР в 2026 году

Форма АОСР установлена приложением к **приказу Министерства строительства и жилищно-коммунального хозяйства РФ №344/пр** от 5 июня 2015 года [«Об утверждении формы журнала учёта выполненных работ и требований к заполнению актов освидетельствования скрытых работ»](https://minstroyrf.gov.ru/).

<Callout type="info" title="Актуальность формы">
С 2015 года форма АОСР изменялась трижды. В 2026 году действует редакция с учётом поправок, введённых приказом №1198/пр от 2023 года.
</Callout>

## Как правильно заполнить АОСР: пошаговая инструкция

<StepList>
  <Step number={1} title="Заполнение шапки документа">
    Укажите наименование объекта строительства, номер договора, дату составления акта. Эти данные должны точно соответствовать разрешению на строительство.
  </Step>
  <Step number={2} title="Участники освидетельствования">
    Перечислите представителей: Подрядчика (отв. производитель работ), Заказчика/Технического заказчика, Лица, осуществляющего строительный контроль. Для каждого — ФИО, должность, реквизиты приказа о назначении.
  </Step>
  <Step number={3} title="Описание освидетельствованных работ">
    Детальное описание работ со ссылкой на раздел проектной документации. Например: «Арматурный каркас фундаментной плиты, раздел КЖ-1 листы 3-5».
  </Step>
  <Step number={4} title="Материалы и конструкции">
    Список применённых материалов с реквизитами сертификатов качества, паспортов, деклараций соответствия.
  </Step>
  <Step number={5} title="Решение комиссии">
    Вывод о соответствии работ проекту и разрешение на производство последующих работ.
  </Step>
  <Step number={6} title="Подписи участников">
    Для бумажного варианта — живые подписи. Для электронного — квалифицированные электронные подписи (КЭП) с машиночитаемой доверенностью.
  </Step>
</StepList>

## Где скачать актуальный шаблон АОСР

Существует несколько источников получения шаблона:

1. **Официальный сайт Минстроя РФ** — первоисточник формы, но в формате приложения к приказу (неудобно для заполнения).
2. **Komplid — бесплатный шаблон** (скачайте выше) — готовый .docx с заполненными реквизитами и таблицами.
3. **Автоматическая генерация в [ИД-Мастер](/pto)** — система сгенерирует АОСР из записей ОЖР одним кликом. Триал 14 дней бесплатно.

## Типичные ошибки при заполнении АОСР

<Callout type="warning" title="Частая ошибка">
**Расхождение даты АОСР с датой начала работ по КС-6а.** Инспекторы технадзора обращают внимание на последовательность дат: АОСР не может быть составлен раньше, чем работы начаты.
</Callout>

Другие распространённые ошибки:

- Использование устаревшей формы (до редакции 2023 года)
- Ссылка на несуществующий раздел проектной документации
- Отсутствие реквизитов сертификатов применённых материалов
- Неполный перечень участников (забыли представителя Заказчика)
- Использование факсимильных подписей вместо живых или КЭП

## Чем Komplid отличается от ручного заполнения

Komplid — облачная платформа для цифрового управления строительством в РФ. Профи-пакет [ИД-Мастер](/pto) автоматизирует создание АОСР из записей [журнала работ (ОЖР)](/blog/ozr-s-telefona):

<ComparisonTable
  columns={["Word + шаблон", "Komplid ИД-Мастер"]}
  rows={[
    { feature: "Время на составление одного АОСР", values: ["20-30 минут", "2-3 минуты"] },
    { feature: "Актуальность формы", values: ["вручную обновлять", "автоматически"] },
    { feature: "Автозаполнение из ОЖР", values: [false, true] },
    { feature: "Маршруты согласования с ЭЦП", values: [false, true] },
    { feature: "Экспорт в XML для ИСУП", values: [false, true] },
    { feature: "Цена", values: ["бесплатно", "от 1 900 ₽/мес"] },
  ]}
/>

## Частые вопросы

_Эти вопросы автоматически станут FAQPage Schema для AEO — см. шаг 3.4_

**Какой приказ регламентирует форму АОСР в 2026 году?**

Приказ Минстроя РФ №344/пр от 5 июня 2015 года с поправками, внесёнными приказом №1198/пр от 2023 года. Это основной нормативный документ, определяющий форму и порядок заполнения АОСР в Российской Федерации.

**Кто подписывает АОСР?**

Обязательные подписи: ответственный производитель работ (от Подрядчика), представитель Заказчика или Технического заказчика, специалист, осуществляющий строительный контроль. При работах, затрагивающих безопасность объектов капитального строительства — дополнительно представитель авторского надзора.

**Можно ли подписать АОСР электронной подписью?**

Да. С 2022 года разрешено использование квалифицированной электронной подписи (КЭП) с машиночитаемой доверенностью (МЧД) для всех документов исполнительной документации. Это предусмотрено ФЗ «Об электронной подписи» и приказом Минстроя №344/пр.

**Сколько хранится АОСР?**

АОСР является частью исполнительной документации и хранится в течение срока эксплуатации объекта капитального строительства согласно ГОСТ Р 51872-2019. Обычно это не менее 50 лет.

**Что делать, если выявлены отклонения от проекта?**

При обнаружении отклонений АОСР не составляется до их устранения. Фиксируется замечание в ОЖР с указанием сроков устранения, после чего работы повторно освидетельствуются.

**Можно ли составить АОСР задним числом?**

Нет. АОСР должен составляться непосредственно после завершения скрываемых работ. Составление задним числом является нарушением и может привести к отказу в приёмке всего объекта.
```

АВТОМАТИЧЕСКАЯ ОБРАБОТКА FAQ:
FAQ-вопросы в конце статьи должны автоматически конвертироваться в FaqSchema.
Это делает следующий шаг.

ПРОВЕРКА:
- /blog/skachat-shablon-aosr открывается
- Все MDX-компоненты отрисованы (Callout, StepList, DownloadCard, ComparisonTable)
- Внутренние ссылки работают (/pto, /shablony/aosr)
- Внешняя ссылка на Минстрой открывается в новом окне
- Rich Results Test: Article, Breadcrumb схемы валидны
```

## Шаг 3.4 — Авто-извлечение FAQ в Schema

```
📋 ЗАДАЧА: Автоматически извлекать FAQ из статей в FaqSchema

Авторы статей пишут FAQ-раздел в конце MDX-файла, но не должны вручную
дублировать эти вопросы в отдельную Schema-разметку.

Решение: парсинг контента перед рендером.

src/lib/extract-faq.ts:

```typescript
export interface ExtractedFaq {
  question: string;
  answer: string;
}

/**
 * Извлекает FAQ из контента статьи.
 * Ожидает секцию "## Частые вопросы" с форматом:
 * **Вопрос?**
 * 
 * Ответ...
 */
export function extractFaqFromContent(content: string): ExtractedFaq[] {
  const faqSectionMatch = content.match(
    /##\s+Частые\s+вопросы([\s\S]*?)(?=\n##\s|$)/i
  );
  if (!faqSectionMatch) return [];
  
  const section = faqSectionMatch[1];
  const faqs: ExtractedFaq[] = [];
  
  // Pattern: **Вопрос?**\n\nОтвет до следующего **...** или конца
  const pattern = /\*\*(.+?\?)\*\*\s*\n+([^*]+?)(?=\n\*\*|$)/g;
  let match;
  while ((match = pattern.exec(section)) !== null) {
    const question = match[1].trim();
    const answer = match[2].trim().replace(/\n+/g, ' ');
    if (question && answer) {
      faqs.push({ question, answer });
    }
  }
  
  return faqs;
}
```

Обновить src/app/blog/[slug]/page.tsx — добавить FaqSchema:

```tsx
import { FaqSchema } from '@/components/seo/FaqSchema';
import { extractFaqFromContent } from '@/lib/extract-faq';

// внутри BlogPostPage:
const faqs = extractFaqFromContent(post.content);

return (
  <>
    <BreadcrumbSchema items={[...]} />
    <ArticleSchema ... />
    {faqs.length > 0 && <FaqSchema items={faqs} />}
    {/* остальной JSX */}
  </>
);
```

Теперь авторы просто пишут FAQ-раздел в MDX, и он автоматически:
1. Рендерится как обычный контент в статье
2. Конвертируется в FaqPage Schema для AEO

ПРОВЕРКА:
- Открыть статью skachat-shablon-aosr
- DevTools → View Source → найти <script type="application/ld+json"> с FaqPage
- Проверить Rich Results Test — FaqPage valid
- Минимум 6 вопросов должны попасть в schema
```

## Шаг 3.5 — Ещё 4 статьи

```
📋 ЗАДАЧА: Написать ещё 4 статьи по шаблону

По аналогии с skachat-shablon-aosr.mdx создать:

1. content/blog/kak-sravnit-smety-excel.mdx
   - primaryQuestion: "Как быстро сравнить две сметы в Excel?"
   - keyTakeaway: "Сравнение смет в Excel возможно через формулы VLOOKUP или сводные таблицы, но занимает часы. Облачные инструменты вроде Сметчик-Студио делают это за один клик."
   - Структура:
     * Что сравнивать в двух версиях сметы
     * Способ 1: VLOOKUP (и почему он медленный)
     * Способ 2: Сводные таблицы
     * Способ 3: Плагин Inquire (недостатки)
     * Альтернатива: облачные инструменты
     * Сравнение времени на 300 позиций
     * ComparisonTable
     * FAQ (7 вопросов)

2. content/blog/ozr-s-telefona.mdx
   - primaryQuestion: "Как вести ОЖР с телефона по приказу №1026/пр?"
   - keyTakeaway: "Электронный ОЖР по приказу №1026/пр можно вести с телефона через PWA-приложения вроде Komplid Прораб-Журнал. Приказ допускает электронную форму при подписании КЭП."
   - Структура:
     * Что такое ОЖР и зачем он нужен
     * Можно ли вести ОЖР в электронной форме (да, приказ №1026/пр)
     * Требования к мобильному приложению для ОЖР
     * 5 способов вести ОЖР с телефона
     * Обязательные поля в записи
     * Сроки внесения записей (не позднее 3 дней)
     * FAQ

3. content/blog/sravnenie-komplid-cus.mdx
   - primaryQuestion: "Чем Komplid отличается от ЦУС?"
   - keyTakeaway: "Komplid и ЦУС — обе российские ERP для стройки, но Komplid на 40% дешевле, имеет B2C-тарифы для одиночных специалистов (от 1 900 ₽/мес) и работает офлайн через PWA."
   - Структура:
     * Обзор Komplid
     * Обзор ЦУС
     * Большая ComparisonTable (20-30 строк)
     * Цены
     * Кому что подходит
     * FAQ

4. content/blog/kak-vesti-id-onlayn.mdx
   - primaryQuestion: "Как вести исполнительную документацию онлайн в 2026?"
   - keyTakeaway: "Вести ИД онлайн в 2026 году можно в специализированных платформах (Komplid, ЦУС, Exon). Электронная форма разрешена приказом Минстроя №344/пр при условии подписания КЭП."
   - Структура:
     * Что такое электронная ИД
     * Законодательная база 2026
     * 5 шагов перехода на электронную ИД
     * Требования к платформе (ФЗ-152, ГОСТ)
     * Сравнение платформ
     * Частые ошибки при внедрении
     * FAQ

Для каждой статьи:
- Минимум 5-7 H2-подзаголовков в виде вопросов
- Минимум 2-3 Callout (info/tip/warning)
- Минимум 1 ComparisonTable или StepList
- FAQ в конце (минимум 5 вопросов)
- Минимум 3 внутренние ссылки на посадочные или другие статьи
- Минимум 1 авторитетная внешняя ссылка (Минстрой, Ростехнадзор, ГОСТ)

ПРОВЕРКА:
- Все 5 статей открываются через /blog/[slug]
- Rich Results Test для каждой: Article + Breadcrumb + FAQPage валидны
- Lighthouse > 90 на каждой
- /sitemap.xml обновлён — все 5 статей там
- /blog показывает 5 карточек
```

---

# ФАЗА 4 — Шаблоны и калькуляторы (3 дня) ⬜

## Шаг 4.1 — Раздел /shablony

```
📋 ЗАДАЧА: Каталог бесплатных шаблонов как главный лид-магнит

ЛОГИКА: SEO-запросы типа "скачать шаблон АОСР", "бланк ОЖР" — самые
высокочастотные в нише. Отдаём файл в обмен на email → лид в воронке.

1. content/shablony/aosr.mdx, ozr.mdx, ks2.mdx, ks3.mdx, ks6a.mdx (5 штук):

Пример content/shablony/aosr.mdx:

```mdx
---
title: "Шаблон АОСР 2026 — акт освидетельствования скрытых работ"
description: "Бесплатный шаблон АОСР по приказу №344/пр Минстроя. Формат .docx и .xlsx. Скачать за 1 клик."
slug: "aosr"
publishedAt: "2026-05-01"
filename: "shablon-aosr-344pr.docx"
format: "docx"
size: "95 КБ"
formats: ["docx", "xlsx"]
regulation: "Приказ Минстроя №344/пр"
category: "Исполнительная документация"
relatedTemplates: ["ozr", "ks2"]
---

Шаблон АОСР соответствует приказу Минстроя РФ №344/пр с последними изменениями 2023 года.

## Что включено в шаблон

- Заполненные реквизиты документа
- Таблица участников освидетельствования
- Раздел «Описание освидетельствованных работ»
- Таблица применённых материалов и сертификатов
- Раздел «Решение комиссии»
- Подписи и реквизиты ЭЦП (при использовании)

## Как заполнить

Подробная инструкция в нашей статье: [Как правильно заполнить АОСР](/blog/skachat-shablon-aosr).
```

2. src/content-loader/shablony.ts — аналогично blog.ts, но с доп. полями:
   filename, format, size, formats (массив доступных форматов), regulation, category.

3. src/app/shablony/page.tsx — каталог:

```tsx
import { getAllTemplates } from '@/content-loader/shablony';
import Link from 'next/link';

export const metadata = {
  title: 'Бесплатные шаблоны документов для стройки',
  description: 'Шаблоны АОСР, ОЖР, КС-2, КС-3, КС-6а. Актуальные формы 2026 года. Бесплатно, форматы .docx и .xlsx.',
  alternates: { canonical: 'https://komplid.ru/shablony' },
};

export default async function TemplatesPage() {
  const templates = await getAllTemplates();
  // Группировка по category
  // Отрисовка карточек с кнопкой "Скачать"
}
```

4. src/app/shablony/[slug]/page.tsx — страница конкретного шаблона:

Структура:
- Заголовок, описание
- Форма "Email → получить файл"
- Контент из MDX (что включено, инструкция)
- Related templates
- CTA: "Хотите автоматизировать? → /pto"

5. src/app/api/template-download/route.ts — API скачивания:

```typescript
import { NextRequest } from 'next/server';
import { z } from 'zod';

const schema = z.object({
  slug: z.string(),
  email: z.string().email(),
  role: z.enum(['prorab', 'pto', 'smetchik', 'other']).optional(),
  newsletterConsent: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: 'Validation error' }, { status: 400 });
  }

  // 1. Отправить лид в app.komplid.ru/api/public/leads
  await fetch(`${process.env.INTERNAL_API_URL}/leads`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.INTERNAL_API_TOKEN}`,
    },
    body: JSON.stringify({
      email: parsed.data.email,
      role: parsed.data.role,
      source: 'template_download',
      metadata: { template: parsed.data.slug },
    }),
  });

  // 2. Подписать на рассылку если согласие
  if (parsed.data.newsletterConsent) {
    // await subscribeToNewsletter(parsed.data.email);
  }

  // 3. Вернуть ссылку на файл
  return Response.json({
    downloadUrl: `/shablony-files/${parsed.data.slug}.docx`,
  });
}
```

6. src/components/forms/TemplateDownloadForm.tsx — UX формы:
   - Email (required)
   - Роль (radio: Прораб / ПТО / Сметчик / Другое)
   - Чекбокс "Получать новости" (optional)
   - Кнопка "Получить файл"
   - После submit: auto-download + toast "Файл отправлен на email"

ПРОВЕРКА:
- /shablony → список 5 шаблонов с категориями
- /shablony/aosr → форма работает
- Submit формы → лид в app.komplid.ru, файл скачивается
- Rich Results Test → BreadcrumbList + Article валидны
```

## Шаг 4.2 — Раздел /kalkulyator

```
📋 ЗАДАЧА: Интерактивные калькуляторы — мощный AEO-сигнал

Калькуляторы привлекают ссылки от других сайтов (бэклинки), прямые переходы
из AI-ответов ("используйте калькулятор на komplid.ru"), и работают как
лид-магнит.

Первые 3 калькулятора:

1. /kalkulyator/smeta-avans — Калькулятор аванса подрядчику
   Входы: сумма контракта, % аванса (обычно 15-30%), НДС
   Вывод: сумма аванса, остаток после аванса, сумма к выплате с НДС

2. /kalkulyator/ks2-ndsfree — Калькулятор КС-2 с НДС/без НДС
   Входы: сумма без НДС, ставка НДС (20%/10%/0%)
   Вывод: сумма с НДС, разбивка

3. /kalkulyator/rabochie-dni — Рабочие дни до даты
   Входы: дата начала, дата окончания, регион (для праздников)
   Вывод: количество рабочих дней
   Применение: для расчёта сроков по договору, уведомлений инспектору за 3 раб.дня

Структура src/app/kalkulyator/[slug]/page.tsx:
- H1: название калькулятора
- Описание (для SEO)
- React-виджет калькулятора
- "Как использовать" (для контекста)
- FAQ
- CTA: "Упростите работу — попробуйте Komplid"

src/components/calculators/EstimateCalculator.tsx (пример):

```tsx
'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function EstimateCalculator() {
  const [amount, setAmount] = useState<number>(0);
  const [advancePercent, setAdvancePercent] = useState<number>(20);
  const [vat, setVat] = useState<number>(20);

  const advance = (amount * advancePercent) / 100;
  const remaining = amount - advance;
  const totalWithVat = amount * (1 + vat / 100);

  return (
    <div className="border border-border rounded-lg p-6 max-w-2xl">
      <div className="grid gap-4">
        <div>
          <Label htmlFor="amount">Сумма контракта (₽, без НДС)</Label>
          <Input
            id="amount"
            type="number"
            value={amount || ''}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="advance">Процент аванса</Label>
          <Input
            id="advance"
            type="number"
            value={advancePercent}
            onChange={(e) => setAdvancePercent(Number(e.target.value))}
            max={100}
          />
        </div>
        <div>
          <Label htmlFor="vat">Ставка НДС</Label>
          <select
            id="vat"
            value={vat}
            onChange={(e) => setVat(Number(e.target.value))}
            className="w-full border border-border rounded p-2"
          >
            <option value="20">20%</option>
            <option value="10">10%</option>
            <option value="0">0% (без НДС)</option>
          </select>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-border grid gap-3">
        <div className="flex justify-between">
          <span>Сумма аванса:</span>
          <strong>{advance.toLocaleString('ru-RU')} ₽</strong>
        </div>
        <div className="flex justify-between">
          <span>Остаток после аванса:</span>
          <strong>{remaining.toLocaleString('ru-RU')} ₽</strong>
        </div>
        <div className="flex justify-between">
          <span>Итого с НДС {vat}%:</span>
          <strong className="text-lg">{totalWithVat.toLocaleString('ru-RU')} ₽</strong>
        </div>
      </div>
    </div>
  );
}
```

ПРОВЕРКА:
- /kalkulyator открывается, 3 карточки калькуляторов
- Каждый калькулятор считает правильно
- Страница ранжируется по запросам ("рассчитать аванс подрядчику онлайн")
- Rich Results Test → Breadcrumb + SoftwareApplication валидны
```

---

# ФАЗА 5 — Страницы сравнения с конкурентами (2 дня) ⬜

## Шаг 5.1 — /sravnenie/[competitor]

```
📋 ЗАДАЧА: Страницы сравнения с конкурентами — ключевой AEO-элемент

Когда пользователь спрашивает ChatGPT "сравни Komplid и ЦУС" или гуглит 
"Komplid vs Exon" — важно иметь прицельные страницы под эти запросы.

content/sravneniya/cus.mdx, exon.mdx, pragmacore.mdx (3 штуки).

Пример content/sravneniya/cus.mdx:

```mdx
---
title: "Komplid vs ЦУС — подробное сравнение в 2026"
description: "Сравнение платформ Komplid и ЦУС по 25 критериям: функциональность, цены, внедрение, поддержка."
slug: "cus"
publishedAt: "2026-05-01"
competitor: "ЦУС"
competitorFullName: "Цифровое Управление Строительством (Цифрострой Групп)"
---

Komplid и ЦУС — две российские платформы для цифрового управления строительством. Обе соответствуют ФЗ-152, хранят данные в РФ и предлагают функциональность для ИД, смет и журналов работ. Основные различия — в подходе к ценообразованию (Komplid ~40% дешевле), наличии B2C-тарифов для одиночных специалистов (у ЦУС их нет) и модели лицензирования.

<Callout type="info" title="Короткий ответ">
Komplid дешевле (от 12 000 ₽/мес vs 50 000+ ₽/мес у ЦУС), имеет Профи-пакеты для одиночных специалистов (от 1 900 ₽/мес) и полноценный PWA-офлайн. ЦУС — более устоявшийся игрок с большей базой клиентов в госсекторе и более развитым BIM-функционалом через партнёрство с Tangl.
</Callout>

## Обзор Komplid

[Структура с описанием Komplid]

## Обзор ЦУС

[Структура с описанием ЦУС]

## Сравнение по 25 критериям

<ComparisonTable
  columns={["Komplid", "ЦУС"]}
  rows={[
    { feature: "Год основания", values: ["2026", "2018"] },
    { feature: "Количество модулей", values: ["18", "12"] },
    { feature: "Цена от", values: ["12 000 ₽/мес (команда)", "50 000+ ₽/мес"] },
    { feature: "B2C тариф для специалистов", values: ["Есть (от 1 900 ₽/мес)", "Нет"] },
    { feature: "Исполнительная документация", values: [true, true] },
    { feature: "Сметы (парсинг XML)", values: [true, true] },
    { feature: "ОЖР электронный", values: [true, true] },
    { feature: "ТИМ/BIM", values: [true, "через партнёра"] },
    { feature: "PWA офлайн", values: [true, false] },
    { feature: "Голосовой ввод ОЖР", values: [true, false] },
    { feature: "GPS-фото", values: [true, "частично"] },
    { feature: "Геозоны подписания", values: [true, false] },
    { feature: "ЭЦП КриптоПро", values: [true, true] },
    { feature: "Машиночитаемая доверенность (МЧД)", values: [true, true] },
    { feature: "Интеграция с ИСУП Минстроя", values: ["план", true] },
    { feature: "1С интеграция", values: [true, true] },
    { feature: "Гранд-Смета импорт/экспорт", values: [true, true] },
    { feature: "Реферальная программа", values: [true, false] },
    { feature: "Бесплатный уровень", values: [true, false] },
    { feature: "Триал без карты", values: ["14 дней", "по согласованию"] },
    { feature: "Публичные цены", values: [true, "по запросу"] },
    { feature: "Внедрение", values: ["самообслуживание", "обязательное внедрение"] },
    { feature: "Время выхода в работу", values: ["минуты", "недели"] },
    { feature: "Контракты for enterprise", values: ["есть", "в основном"] },
    { feature: "Отечественное ПО в реестре Минцифры", values: ["план", true] },
  ]}
/>

## Кому лучше подойдёт Komplid

- **Одиночным специалистам** — у ЦУС нет B2C-тарифа
- **Малому и среднему бизнесу** — вход от 12 000 ₽/мес без обязательного внедрения
- **Прорабам на объектах** — полноценный PWA с офлайн-режимом
- **Командам, которые хотят попробовать без длительных переговоров** — триал 14 дней без карты

## Кому лучше подойдёт ЦУС

- **Крупным государственным заказчикам** — в реестре Минцифры, опыт с госпроектами
- **Компаниям с глубоким BIM** — партнёрство с Tangl даёт развитый IFC-инструментарий
- **Организациям, требующим обязательного внедрения** — у ЦУС формальный процесс интеграции

## Частые вопросы

**Какая платформа дешевле?**

Komplid значительно дешевле для малого и среднего бизнеса. «Старт» 12 000 ₽/мес vs 50 000+ ₽/мес у ЦУС. Для специалистов разница ещё больше: у Komplid Профи-пакеты от 1 900 ₽/мес, у ЦУС нет B2C-тарифов.

**Можно ли мигрировать с ЦУС на Komplid?**

Да. Komplid поддерживает импорт ИД из Excel и XML-форматов, которые ЦУС может экспортировать. Также есть возможность импорта смет в формате Гранд-Сметы и 1С. Миграция типично занимает 1-2 недели для активных проектов.

**Что надёжнее: Komplid или ЦУС?**

Обе платформы соответствуют ФЗ-152 и хранят данные в РФ (дата-центры Tier III). ЦУС — более устоявшийся игрок с большим количеством enterprise-клиентов. Komplid моложе, но имеет современный стек (Next.js 15, PWA) и SLA 99.98%.

**У Komplid есть ТИМ (BIM)?**

Да, Komplid имеет собственный модуль ТИМ с IFC-вьюером, привязкой элементов к ИД, управлением моделями и коллизиями. ЦУС работает с BIM через партнёрство с Tangl.

**Сколько пользователей в Komplid и ЦУС?**

Конкретные цифры обе компании не раскрывают. По оценкам отраслевых источников, ЦУС обслуживает несколько сотен крупных клиентов. Komplid на старте запуска (2026) и ориентируется на малый/средний бизнес и B2C-сегмент.

**Есть ли бесплатный уровень?**

У Komplid есть уровень Freemium (1 проект, ограниченная функциональность) и триал Pro 14 дней. У ЦУС бесплатного уровня нет, но возможен пилотный период по согласованию.

## Попробуйте Komplid бесплатно

14 дней полного доступа ко всем 18 модулям. Без карты, без обязательств.

[Начать триал →](https://app.komplid.ru/signup?utm_source=comparison&utm_campaign=vs_cus)
```

Создать аналогичные страницы:
- content/sravneniya/exon.mdx (Komplid vs Exon — упор на "Exon под ПИК-проекты, Komplid для всех")
- content/sravneniya/pragmacore.mdx (Komplid vs Pragmacore — упор на "Pragmacore ближе к BIM, Komplid шире")

Для страницы /sravnenie создать /sravnenie/page.tsx — общий список сравнений.

ПРОВЕРКА:
- Все 3 страницы сравнения открываются
- По запросу "Komplid vs ЦУС" в Яндексе/Google через 2-4 недели — наша страница в топе
- Rich Results Test → FAQPage + Article валидны
- В ChatGPT через 4-6 недель после индексации по вопросу "сравни Komplid и ЦУС" — 
  упоминается наша страница как источник
```

---

# ФАЗА 6 — Реферальная программа и CRM (2 дня) ⬜

## Шаг 6.1 — /ref/[code] — приземление

```
📋 ЗАДАЧА: Приземление реферальных ссылок из Модуля 15

Когда пользователь делится ссылкой вида komplid.ru/ref/ABC123, он приземляется
на эту страницу. Мы должны:
1. Cохранить реферальный код в cookie
2. Отобразить приглашение
3. Перевести на app.komplid.ru/signup с сохранённым кодом

src/app/ref/[code]/page.tsx:

```tsx
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { cookies } from 'next/headers';
import { Hero } from '@/components/blocks/Hero';
import { validateRefCode } from '@/lib/referral';

interface Params {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: Params) {
  const { code } = await params;
  return {
    title: 'Вы приглашены в Komplid',
    description: `Приглашение в ERP Komplid. Активируйте код ${code} для получения бонуса.`,
    robots: { index: false, follow: false },
  };
}

export default async function ReferralPage({ params }: Params) {
  const { code } = await params;
  
  const cookieStore = await cookies();
  cookieStore.set('komplid_ref', code, {
    maxAge: 30 * 24 * 60 * 60,  // 30 дней
    httpOnly: false,  // чтобы JS мог прокинуть в app.komplid.ru
    sameSite: 'lax',
    path: '/',
  });
  
  const info = await validateRefCode(code);
  
  return (
    <Hero
      eyebrow={`Реферальный код · ${code}`}
      title={<>
        <span>Вы приглашены в <em>Komplid</em></span>
        {info?.inviterName && <span>от {info.inviterName}</span>}
      </>}
      subtitle={`Активируйте код и получите ${info?.discount ?? 30}% скидку на первый месяц подписки. Попробуйте 14 дней бесплатно, затем — скидка автоматически применится при оплате.`}
      primaryCta={{
        label: 'Зарегистрироваться',
        href: `https://app.komplid.ru/signup?ref=${code}&utm_source=referral`,
      }}
      secondaryCta={{ label: 'Узнать больше о Komplid', href: '/' }}
    />
  );
}
```

src/lib/referral.ts:

```typescript
export async function validateRefCode(code: string): Promise<{
  valid: boolean;
  inviterName?: string;
  discount?: number;
} | null> {
  try {
    const res = await fetch(`${process.env.INTERNAL_API_URL}/referrals/${code}`, {
      headers: { 'Authorization': `Bearer ${process.env.INTERNAL_API_TOKEN}` },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
```

ПРОВЕРКА:
- /ref/TEST123 → открывается страница с кодом в Hero
- Cookie komplid_ref установлен
- Клик CTA → app.komplid.ru/signup?ref=TEST123
- При невалидном коде — показываем общую главную
```

## Шаг 6.2 — API endpoints и интеграция с приложением

```
📋 ЗАДАЧА: API роуты для передачи данных в основное приложение

1. src/app/api/lead/route.ts — универсальный endpoint для форм:

```typescript
import { NextRequest } from 'next/server';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  role: z.enum(['director', 'pto', 'prorab', 'smetchik', 'sk', 'other']).optional(),
  interest: z.string().optional(),
  source: z.string(),
  utm: z.record(z.string()).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: 'Validation error', issues: parsed.error.issues }, { status: 400 });
  }

  // Отправляем в основное приложение (там CRM, базы, BullMQ-уведомления)
  const res = await fetch(`${process.env.INTERNAL_API_URL}/leads`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.INTERNAL_API_TOKEN}`,
    },
    body: JSON.stringify(parsed.data),
  });

  if (!res.ok) {
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }

  return Response.json({ success: true });
}
```

2. src/app/api/newsletter/route.ts — подписка на рассылку:

```typescript
import { NextRequest } from 'next/server';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  tags: z.array(z.string()).optional(),  // например ["smetchik", "pto"]
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: 'Validation error' }, { status: 400 });
  }

  // Интеграция с Unisender/SendGrid
  // Либо внутренняя рассылка через app.komplid.ru

  return Response.json({ success: true });
}
```

3. В основном приложении (stroydocs/) создать endpoint:
   POST /api/public/leads
   - Принимает header Authorization: Bearer <INTERNAL_API_TOKEN>
   - Создаёт запись Lead в БД
   - Запускает BullMQ worker для рассылки приветственных писем
   - Опционально: уведомление в отдельный Slack/Telegram канал

Это уже делается в Модуле 15, просто убедитесь что endpoint готов.

ПРОВЕРКА:
- Форма на /shablony/aosr отправляет → лид попадает в основное приложение
- В БД основного приложения появляется Lead с source=template_download
- Триггерится приветственное письмо через BullMQ
```

---

# ФАЗА 7 — Ongoing: производство контента ⬜

## Как поддерживать рост

```
📋 ЗАДАЧА: Регулярный выпуск статей + мониторинг AEO/GEO

РИТМ: 3-5 статей в неделю. Это 150-250 статей за год.
Это реалистично при использовании Claude Code + твоей экспертизы.

ПРОЦЕСС ДЛЯ КАЖДОЙ СТАТЬИ:

1. Выбрать тему из списка (создать в начале массив 100-200 тем)
2. Тебе: 15-минутный брейнсторм основных пойнтов
3. Claude Code: генерация черновика по шаблону (structure из Шаг 3.3)
4. Тебе: редактура, добавление конкретики из практики
5. Добавить в content/blog/
6. Commit + push → автоматический деплой
7. Добавить в Яндекс Вебмастер "переобход URL"

СПИСОК ТЕМ (первые 50):

SEO-приоритет высокий (высокочастотные запросы):
1. Скачать шаблон АОСР 2026 (уже есть)
2. Образец ОЖР — бланк + инструкция
3. Как заполнить КС-2 — пошагово с примерами
4. Справка КС-3 — образец и инструкция
5. Журнал КС-6а — обязательные поля
6. Акт технической готовности — шаблон
7. Журнал общих работ — ведение
8. Акт скрытых работ — ошибки заполнения
9. ЭЦП для стройки — какую выбрать в 2026
10. МЧД в строительстве — пошагово

Сравнения (AEO-критичны):
11. Komplid vs ЦУС (уже есть)
12. Komplid vs Exon
13. Komplid vs Pragmacore
14. Комплид vs 1С Управление Строительством
15. Облачная СМР vs локальная — что лучше
16. Как выбрать платформу для стройки — чеклист
17. СЭД для стройки — обзор 2026
18. BIM vs ТИМ — есть ли разница

Инструкции для ролей:
19. Руководство прораба — как вести ОЖР в 2026
20. Сметчик онлайн — лучшие инструменты
21. Инженер ПТО — как упростить ИД
22. Техник стройконтроля — цифровой обход
23. Начальник участка — как цифровизовать

Нормативка:
24. Приказ Минстроя 344пр — что надо знать
25. Приказ 1026пр Ростехнадзора — как применять
26. ГОСТ Р 51872-2019 — обзор
27. СП 48.13330 — исполнительная документация
28. 152-ФЗ в стройке — как соблюсти
29. ФЗ-44 для подрядчика — гайд
30. ФЗ-223 для подрядчика — гайд

Процессы и боли:
31. Как сократить сроки подготовки ИД в 10 раз
32. Ошибки в АОСР, из-за которых возвращают акты
33. Чеклист подготовки пакета ИД к сдаче
34. Как избежать штрафов Ростехнадзора
35. Цифровой документооборот на стройке — с чего начать

Кейсы и аналитика:
36. Как ЖК на 500 квартир перешёл на Komplid за месяц
37. Экономия 30 часов в неделю: кейс ПТО-инженера
38. Реферальная программа Komplid — как работает
39. Обзор рынка стройПО России 2026
40. Цифровизация строек — барьеры и решения

Мобильное и технологии:
41. Приложение прораба на Android — установка PWA
42. Голосовой ввод на стройке — когда это работает
43. Фото с GPS — зачем нужно и как внедрить
44. Геозоны подписания АОСР — новый тренд
45. Офлайн-режим на стройке — как настроить

AI и автоматизация:
46. AI в стройке — что умеет в 2026
47. Автогенерация АОСР — как это работает
48. Распознавание смет ИИ — сравнение решений
49. NLP-поиск по проекту — новые возможности
50. ChatGPT для инженера — 10 примеров

РИТМ ПУБЛИКАЦИЙ:
- Понедельник: статья SEO-приоритет
- Среда: сравнение или нормативка
- Пятница: инструкция для роли или кейс

РАСПРОСТРАНЕНИЕ КАЖДОЙ СТАТЬИ:
1. Публикация на komplid.ru/blog
2. Cross-post на Хабр (выборочно, 1 из 4 статей)
3. Cross-post на vc.ru (ещё реже, 1 из 6)
4. Пост в Telegram @komplid
5. Упоминания в релевантных Telegram-чатах (аккуратно, не спам)
6. Email-рассылка подписчикам блога (раз в неделю, дайджест)

МОНИТОРИНГ AEO/GEO (раз в неделю):
- ChatGPT: "какая программа для ведения ОЖР в России"
- Perplexity: "сравнение систем управления строительством"
- Яндекс с Алисой: "скачать шаблон АОСР"
- Google AI Overview: те же запросы

Цель за 3 месяца: хотя бы 1 упоминание Komplid в ответах ChatGPT/Perplexity
по профильным запросам.

Через 6 месяцев: Komplid появляется в AI Overview по 5+ ключевым запросам.

Платные мониторинг-инструменты на первые 3-6 мес НЕ НУЖНЫ — ручная проверка
даёт понимание. Если вырастет — Frase / AthenaHQ / Snezzi (от $99/мес).
```

---

# ENV-ПЕРЕМЕННЫЕ

```bash
# .env.local

# Аналитика
NEXT_PUBLIC_YANDEX_METRIKA_ID=12345678
NEXT_PUBLIC_YANDEX_VERIFICATION=abcdef1234567890
NEXT_PUBLIC_GOOGLE_VERIFICATION=abcdef1234567890

# Ссылка на основное приложение
NEXT_PUBLIC_APP_URL=https://app.komplid.ru

# API-интеграция с основным приложением
INTERNAL_API_URL=https://app.komplid.ru/api/public
INTERNAL_API_TOKEN=eyJhbGc...  # генерируется в app.komplid.ru, используется для доверенных запросов

# Site URL (для sitemap, schemas)
NEXT_PUBLIC_SITE_URL=https://komplid.ru
```

---

# ИТОГО: метрики успеха

После 4 недель (конец Фазы 6):
- [x] komplid.ru работает, все страницы открываются
- [x] 5+ статей в блоге
- [x] 5+ шаблонов скачиваются
- [x] 3+ страницы сравнения с конкурентами
- [x] 3 посадочные (/smetchik, /pto, /prorab)
- [x] Реферальные ссылки /ref/[code] работают
- [x] Лиды из форм попадают в app.komplid.ru
- [x] Lighthouse > 90 на всех страницах
- [x] Rich Results Test валиден для всех schema-разметок

После 3 месяцев:
- [x] 40-60 статей в блоге
- [x] Первые позиции в Яндексе по 10+ низкочастотным запросам
- [x] 1-2 цитирования в ChatGPT/Perplexity по профильным запросам
- [x] 500+ лидов в месяц с маркетингового сайта

После 6 месяцев:
- [x] 100+ статей
- [x] Топ-10 в Яндексе по 20+ ключевым запросам
- [x] Регулярные цитирования в AI-ответах (AEO работает)
- [x] 1500+ лидов в месяц
- [x] 300+ платящих клиентов из органики + реферал

---

# ЗАВИСИМОСТИ

Основные пакеты которые нужно установить:

```bash
# Ядро Next.js
npm install next@latest react@latest react-dom@latest

# MDX
npm install @next/mdx @mdx-js/loader @mdx-js/react next-mdx-remote
npm install gray-matter remark-gfm rehype-slug rehype-autolink-headings

# UI & стили
npm install tailwindcss @tailwindcss/typography tailwindcss-animate
npm install clsx tailwind-merge
npm install lucide-react

# Shadcn компоненты (установить через npx shadcn add)
# button, input, label, textarea, form, dialog, card, badge, separator, accordion, tabs

# Утилиты
npm install date-fns
npm install @tanstack/react-query
npm install zod

# Dev
npm install -D @types/mdx
npm install -D typescript
npm install -D @types/node @types/react @types/react-dom
```

---

# ПРИЛОЖЕНИЕ A: Чек-лист AEO/GEO для каждой статьи

- [ ] Прямой ответ в первых 2-3 предложениях
- [ ] `primaryQuestion` в frontmatter
- [ ] `keyTakeaway` — короткий ответ для отображения в блоке "Главное"
- [ ] H2-подзаголовки в форме вопросов
- [ ] FAQ-секция в конце (5-7 вопросов с `**Вопрос?**` → ответ)
- [ ] FaqSchema автоматически через `extractFaqFromContent`
- [ ] Минимум 1 ComparisonTable или StepList
- [ ] Минимум 2 Callout для ключевых фактов
- [ ] Минимум 3 внутренние ссылки (на посадочные, другие статьи, шаблоны)
- [ ] Минимум 1 авторитетная внешняя ссылка (Минстрой, ГОСТ, приказ)
- [ ] Изображение в `image` frontmatter (OG + hero)
- [ ] Теги (3-5) в `tags`
- [ ] ArticleSchema + BreadcrumbSchema рендерятся автоматически

# ПРИЛОЖЕНИЕ B: Чек-лист технического SEO

- [ ] URL-структура ЧПУ (/blog/skachat-shablon-aosr, не /post/123)
- [ ] H1 уникальный на каждой странице, одной штукой
- [ ] `<title>` и `<meta description>` уникальные, под запрос
- [ ] `alternates.canonical` на каждой странице
- [ ] OpenGraph meta + Twitter Card meta
- [ ] `robots.txt` разрешает AI-боты (GPTBot, ChatGPT-User, PerplexityBot, ClaudeBot, Google-Extended, YandexGPT)
- [ ] `sitemap.xml` динамический, включает все статьи и посадочные
- [ ] `next/image` для оптимизации (WebP/AVIF)
- [ ] `next/font` для локальных шрифтов (без FOUT)
- [ ] Core Web Vitals: LCP < 2.5s, CLS < 0.1, INP < 200ms
- [ ] HTTPS + HSTS
- [ ] www → без www редирект
- [ ] 404 страница с полезными ссылками

# ПРИЛОЖЕНИЕ C: Источники и ссылки

Все расчёты, данные и ссылки на актуальные нормативы:

- Приказ Минстроя РФ №344/пр — https://minstroyrf.gov.ru/
- Приказ Ростехнадзора №1026/пр — https://www.gosnadzor.ru/
- ГОСТ Р 51872-2019 — https://protect.gost.ru/
- ФЗ-152 о персональных данных — https://fz152.ru/
- Реестр российского ПО Минцифры — https://reestr.digital.gov.ru/
- Единый реестр НОСТРОЙ (СРО) — https://reestr.nostroy.ru/

---

_План готов к передаче в Claude Code. Рекомендуемый порядок:_
_Фаза 1 (5 дней) → Фаза 2 (4-5 дней) → Фаза 3 (4 дня) → Фазы 4-5 параллельно (5 дней) → Фаза 6 (2 дня) → Фаза 7 (ongoing)_
