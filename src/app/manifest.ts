import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Комплид — управление строительными проектами',
    short_name: 'Комплид',
    description: 'Управление строительством: ИД, сметы, журналы, стройконтроль',
    start_url: '/',
    display: 'standalone',
    background_color: '#f8f7f5',
    // Тёмная плашка знака из брендбука
    theme_color: '#1B1F26',
    lang: 'ru',
    // Растр собирается из брендовых SVG: node scripts/make-brand-icons.mjs
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      {
        src: '/icons/icon-512-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
