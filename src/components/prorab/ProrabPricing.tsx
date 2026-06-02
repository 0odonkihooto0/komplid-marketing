import { RolePricing, type PricingTierDef } from '@/components/blocks/RolePricing';

const TIERS: PricingTierDef[] = [
  {
    name: 'Бесплатно',
    subtitle: 'Попробовать без рисков.',
    monthlyPrice: 0,
    priceNote: '1 объект · до 30 записей/мес',
    features: [
      { text: '1 объект', included: true },
      { text: 'До 30 записей ОЖР в месяц', included: true },
      { text: 'Просмотр журнала', included: true },
      { text: 'Голосовой ввод и фото с GPS', included: false },
      { text: 'Дефекты и синхронизация с ПТО', included: false },
    ],
    ctaLabel: 'Начать бесплатно',
    ctaHref:
      'https://app.komplid.ru/signup?plan=free&role=prorab&utm_source=landing&utm_medium=organic&utm_campaign=prorab',
  },
  {
    name: 'Базовый',
    subtitle: 'Для активной работы на объекте.',
    monthlyPrice: 1900,
    priceNote: '3 объекта · голосовой ввод · фото с GPS',
    features: [
      { text: '3 объекта одновременно', included: true },
      { text: 'Голосовой ввод ОЖР (Yandex SpeechKit)', included: true },
      { text: 'Фото с GPS-координатами', included: true },
      { text: 'Фиксация дефектов с фото', included: true },
      { text: 'Автогенерация АОСР и синхронизация с ПТО', included: false },
    ],
    ctaLabel: 'Выбрать Базовый',
    ctaHref:
      'https://app.komplid.ru/signup?plan=prorab-base&role=prorab&utm_source=landing&utm_medium=organic&utm_campaign=prorab',
  },
  {
    name: 'Pro',
    subtitle: 'Полный арсенал прораба.',
    monthlyPrice: 2900,
    priceNote: '10 объектов · автогенерация АОСР · push-уведомления',
    features: [
      { text: 'Всё из Базового', included: true },
      { text: '10 объектов одновременно', included: true },
      { text: 'Автогенерация АОСР из записей ОЖР', included: true },
      { text: 'Push-уведомления о дефектах', included: true },
      { text: 'Синхронизация с ПТО в реальном времени', included: true },
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
      title="Начните бесплатно, платите когда нужно больше"
      description="Все тарифы включают PWA без App Store. Работает офлайн на любом смартфоне."
      tiers={TIERS}
    />
  );
}
