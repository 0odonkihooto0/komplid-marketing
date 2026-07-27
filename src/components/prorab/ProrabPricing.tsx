import { RolePricing, type PricingTierDef } from '@/components/blocks/RolePricing';

// Лимиты и цены — из prisma/seeds/subscription-plans.ts приложения
// (foreman_journal_basic / foreman_journal_pro). Постоянного бесплатного тарифа нет.
const TIERS: PricingTierDef[] = [
  {
    name: 'Пробный период',
    subtitle: 'Проверить прямо на стройке.',
    monthlyPrice: 0,
    priceNote: '7 дней Базовый · 14 дней Pro · без карты',
    features: [
      { text: 'Все функции выбранного тарифа', included: true },
      { text: 'Без привязки карты', included: true },
      { text: 'Офлайн-режим и синхронизация', included: true },
      { text: 'Продлевается автоматически', included: false },
      { text: 'Постоянный бесплатный тариф', included: false },
    ],
    ctaLabel: 'Получить ранний доступ',
    ctaHref:
      'https://app.komplid.ru/signup?plan=trial&role=prorab&utm_source=landing&utm_medium=organic&utm_campaign=prorab',
  },
  {
    name: 'Базовый',
    subtitle: 'Для активной работы на объекте.',
    monthlyPrice: 1900,
    priceNote: '1 объект · 5 ГБ · до 500 фото/мес',
    features: [
      { text: 'Электронный ОЖР с телефона', included: true },
      { text: 'Голосовой ввод (Yandex SpeechKit)', included: true },
      { text: 'Фото с GPS-координатами', included: true },
      { text: 'Фиксация дефектов с фото', included: true },
      { text: 'Автогенерация АОСР и передача в ПТО', included: false },
    ],
    ctaLabel: 'Выбрать Базовый',
    ctaHref:
      'https://app.komplid.ru/signup?plan=prorab-base&role=prorab&utm_source=landing&utm_medium=organic&utm_campaign=prorab',
  },
  {
    name: 'Pro',
    subtitle: 'Полный арсенал прораба.',
    monthlyPrice: 2900,
    priceNote: '5 объектов · 25 ГБ · фото без ограничений',
    features: [
      { text: 'Всё из Базового', included: true },
      { text: '5 объектов одновременно', included: true },
      { text: 'Фото без месячного лимита', included: true },
      { text: 'Автогенерация АОСР из записей ОЖР', included: true },
      { text: 'Push-уведомления о дефектах', included: true },
    ],
    ctaLabel: 'Выбрать Pro',
    ctaHref:
      'https://app.komplid.ru/signup?plan=prorab-pro&role=prorab&utm_source=landing&utm_medium=organic&utm_campaign=prorab',
    featured: true,
    tag: 'Популярный',
  },
];

export function ProrabPricing() {
  return (
    <RolePricing
      eyebrow="Тарифы Прораб-Журнала"
      title="Пробный период, дальше — по числу объектов"
      description="Все тарифы включают PWA без App Store. Работает офлайн на любом смартфоне. Годовая оплата — на 20% дешевле."
      tiers={TIERS}
    />
  );
}
