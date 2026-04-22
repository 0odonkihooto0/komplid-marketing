import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { MarketingHeader } from '@/components/layout/MarketingHeader';
import { MarketingFooter } from '@/components/layout/MarketingFooter';
import { OrganizationSchema } from '@/components/seo/OrganizationSchema';
import { YandexMetrika } from '@/components/analytics/YandexMetrika';
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
    default: 'Komplid — ERP для строительных проектов | ИД, Сметы, Журналы онлайн',
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
    'программа для сметчика',
    'KS-2 KS-3',
  ],
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: 'https://komplid.ru',
    siteName: 'Komplid',
    title: 'Komplid — ERP для строительных проектов',
    description: 'Вся стройка от сметы до КС-2 в одной системе',
    images: [
      {
        url: '/og-images/default.png',
        width: 1200,
        height: 630,
        alt: 'Komplid',
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
      className={`${inter.variable} ${mono.variable}`}
    >
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
