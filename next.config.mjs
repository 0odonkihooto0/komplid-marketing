import createMDX from '@next/mdx';

// Turbopack требует serializable-опции — плагины передаются в next-mdx-remote на уровне страниц
const withMDX = createMDX({});

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
  reactStrictMode: true,
  poweredByHeader: false,
  trailingSlash: false,
  // Корпус СП — статические HTML в public/normativ/<slug>.html.
  // Чистый URL /normativ/<slug> — публичный контракт (canonical в каждом файле);
  // .html-вариант навсегда редиректится на чистый, чтобы не плодить дубли в SEO.
  async redirects() {
    return [
      {
        source: '/normativ/:slug(sp-[a-z0-9-]+)\\.html',
        destination: '/normativ/:slug',
        permanent: true,
      },
      // В тексте политики (п. 12.3 исходного документа) фигурировал адрес
      // komplid.ru/privacy. Канонический адрес на сайте — /legal/privacy
      // (он же в футере, sitemap и чекбоксах форм), короткий ведёт на него.
      {
        source: '/privacy',
        destination: '/legal/privacy',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return {
      afterFiles: [
        // afterFiles: хаб /normativ (роут) и /normativ/img/* (файлы) в маску
        // не попадают и обслуживаются до этого правила
        {
          source: '/normativ/:slug(sp-[a-z0-9-]+)',
          destination: '/normativ/:slug.html',
        },
      ],
    };
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          // HSTS. На собственном VDS его ставил бы nginx, но основной хостинг —
          // App Platform, и там веб-сервер платформы этого заголовка не добавляет:
          // проверено на живом домене после первого выката. Без него первый заход
          // по http остаётся перехватываемым, несмотря на 308 редирект, — а сайт
          // принимает персональные данные через форму.
          //
          // includeSubDomains намеренно нет: заголовок обяжет каждый будущий
          // поддомен иметь валидный TLS, а app.komplid.ru ещё не поднят.
          // preload тоже нет — это односторонняя дверь: попадание в список
          // браузеров откатывается месяцами.
          { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
        ],
      },
    ];
  },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

export default withMDX(nextConfig);
