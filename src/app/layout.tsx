import type { Metadata } from 'next';
import { Geologica, Onest, JetBrains_Mono } from 'next/font/google';
import { MarketingHeader } from '@/components/layout/MarketingHeader';
import { MarketingFooter } from '@/components/layout/MarketingFooter';
import { OrganizationSchema } from '@/components/seo/OrganizationSchema';
import { YandexMetrika } from '@/components/analytics/YandexMetrika';
import { THEME_INIT_SCRIPT } from '@/lib/theme';
import '@/styles/globals.css';

/**
 * Шрифты брендбука: Geologica — заголовки и крупные цифры, Onest — весь
 * остальной текст, JetBrains Mono — надзаголовки, метки и коды документов.
 * next/font хостит файлы у нас: до Google Fonts из России ходить не надо.
 */
const display = Geologica({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-geologica',
  display: 'swap',
});

const sans = Onest({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-onest',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://komplid.ru'),
  title: {
    default: 'Комплид — управление строительством | ИД, сметы, журналы онлайн',
    template: '%s | Комплид',
  },
  description:
    'Система управления строительными проектами: ИД, КС-2/КС-3, ОЖР, смета, стройконтроль, ТИМ. 21 модуль в одном контуре. Данные в РФ, ФЗ-152.',
  keywords: [
    'исполнительная документация',
    'цифровое управление строительством',
    'ИД онлайн',
    'АОСР шаблон',
    'ОЖР электронный',
    'Комплид',
    // Латиницей ищут не реже: домен и логотип приложения на ней
    'Komplid',
    'система управления строительством',
    'программа для сметчика',
    'КС-2 КС-3',
  ],
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: 'https://komplid.ru',
    siteName: 'Комплид',
    title: 'Комплид — управление строительными проектами',
    description: 'Вся стройка от сметы до КС-2 в одном контуре',
    images: [
      {
        url: '/og-images/default.png',
        width: 1200,
        height: 630,
        alt: 'Комплид',
      },
    ],
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
    <html
      lang="ru"
      data-theme="light"
      data-palette="steel"
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
      // data-theme правится скриптом ниже до гидратации — предупреждение о
      // расхождении с серверной разметкой здесь ожидаемо и не информативно.
      suppressHydrationWarning
    >
      <head>
        {/*
          Тема ставится до первой отрисовки, иначе выбранная тёмная моргает
          светлой на каждой перезагрузке и каждом переходе между страницами.
          Атрибут data-theme на <html> выше — только SSR-значение по умолчанию.
        */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg)',
          color: 'var(--ink)',
        }}
      >
        <OrganizationSchema />
        <MarketingHeader />
        <main style={{ flex: 1 }}>{children}</main>
        <MarketingFooter />
        <YandexMetrika />
      </body>
    </html>
  );
}
