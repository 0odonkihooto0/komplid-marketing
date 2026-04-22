import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Komplid — ERP для строительных проектов',
    short_name: 'Komplid',
    description: 'Цифровое управление строительством: ИД, сметы, журналы, стройконтроль',
    start_url: '/',
    display: 'standalone',
    background_color: '#f8f7f5',
    theme_color: '#2B3445',
    lang: 'ru',
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
