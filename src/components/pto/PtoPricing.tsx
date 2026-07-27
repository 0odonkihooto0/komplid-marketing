import { RolePricing, type PricingTierDef } from '@/components/blocks/RolePricing';

// Лимиты и цены — из prisma/seeds/subscription-plans.ts приложения
// (id_master_basic / id_master_pro). УКЭП КриптоПро и МЧД здесь не заявляем:
// в приложении это ещё заглушка (CLAUDE.md §21, docs/memory/app-feature-reality.md).
const TIERS: PricingTierDef[] = [
  {
    name: 'Пробный период',
    subtitle: 'Проверить на своём объекте.',
    monthlyPrice: 0,
    priceNote: '7 дней Базовый · 14 дней Pro · без карты',
    features: [
      { text: 'Все функции выбранного тарифа', included: true },
      { text: 'Без привязки карты', included: true },
      { text: 'Свои шаблоны и реальные документы', included: true },
      { text: 'Продлевается автоматически', included: false },
      { text: 'Постоянный бесплатный тариф', included: false },
    ],
    ctaLabel: 'Получить ранний доступ',
    ctaHref:
      'https://app.komplid.ru/signup?plan=trial&role=pto&utm_source=landing&utm_medium=organic&utm_campaign=pto',
  },
  {
    name: 'Базовый',
    subtitle: 'Для активной работы с ИД.',
    monthlyPrice: 1900,
    priceNote: 'до 50 документов/мес · 5 ГБ · 1 объект',
    features: [
      { text: 'АОСР по приказу №344/пр', included: true },
      { text: 'Электронный ОЖР', included: true },
      { text: 'Подпись с привязкой к GPS и геозоне', included: true },
      { text: 'Маршруты согласования', included: false },
      { text: 'КС-2 / КС-3 и экспорт XML по схемам Минстроя', included: false },
    ],
    ctaLabel: 'Выбрать Базовый',
    ctaHref:
      'https://app.komplid.ru/signup?plan=pto-base&role=pto&utm_source=landing&utm_medium=organic&utm_campaign=pto',
  },
  {
    name: 'Pro',
    subtitle: 'Полный арсенал ПТО-инженера.',
    monthlyPrice: 2900,
    priceNote: 'документов без ограничений · 25 ГБ · 5 объектов',
    features: [
      { text: 'Всё из Базового', included: true },
      { text: 'КС-2 / КС-3 автогенерация', included: true },
      { text: 'Маршруты согласования (4 этапа)', included: true },
      { text: 'Пакетный экспорт ZIP + XML по 12 схемам Минстроя', included: true },
      { text: 'До 5 объектов одновременно', included: true },
    ],
    ctaLabel: 'Выбрать Pro',
    ctaHref:
      'https://app.komplid.ru/signup?plan=pto-pro&role=pto&utm_source=landing&utm_medium=organic&utm_campaign=pto',
    featured: true,
    tag: 'Популярный',
  },
];

export function PtoPricing() {
  return (
    <RolePricing
      eyebrow="Тарифы ИД-Мастера"
      title="Пробный период, дальше — по объёму документов"
      description="Все тарифы включают 50+ шаблонов актов по приказу №344/пр. Годовая оплата — на 20% дешевле."
      tiers={TIERS}
    />
  );
}
