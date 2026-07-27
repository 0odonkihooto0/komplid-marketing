import { RolePricing, type PricingTierDef } from '@/components/blocks/RolePricing';

// Лимиты и цены — из prisma/seeds/subscription-plans.ts приложения
// (smetchik_studio_basic / smetchik_studio_pro). Постоянного бесплатного тарифа
// у Профи-пакетов нет — есть пробный период. Не выдумывать (CLAUDE.md §21).
const TIERS: PricingTierDef[] = [
  {
    name: 'Пробный период',
    subtitle: 'Посмотреть на своих сметах.',
    monthlyPrice: 0,
    priceNote: '7 дней Базовый · 14 дней Pro · без карты',
    features: [
      { text: 'Все функции выбранного тарифа', included: true },
      { text: 'Без привязки карты', included: true },
      { text: 'Импорт своих смет', included: true },
      { text: 'Продлевается автоматически', included: false },
      { text: 'Постоянный бесплатный тариф', included: false },
    ],
    ctaLabel: 'Получить ранний доступ',
    ctaHref:
      'https://app.komplid.ru/signup?plan=trial&role=smetchik&utm_source=landing&utm_medium=organic&utm_campaign=smetchik',
  },
  {
    name: 'Базовый',
    subtitle: 'Для регулярной работы со сметами.',
    monthlyPrice: 1900,
    priceNote: 'до 5 активных смет · 1 ГБ · 2 объекта',
    features: [
      { text: 'Импорт XML (Гранд-Смета, РИК)', included: true },
      { text: 'Импорт Excel', included: true },
      { text: 'Базовое сравнение версий', included: true },
      { text: 'Публичные ссылки для заказчика', included: false },
      { text: 'База ФСНБ-2022 и экспорт в Гранд-Смету', included: false },
    ],
    ctaLabel: 'Выбрать Базовый',
    ctaHref:
      'https://app.komplid.ru/signup?plan=smetchik-base&role=smetchik&utm_source=landing&utm_medium=organic&utm_campaign=smetchik',
  },
  {
    name: 'Pro',
    subtitle: 'Полный арсенал сметчика.',
    monthlyPrice: 2900,
    priceNote: 'смет без ограничений · 10 ГБ · 5 объектов',
    features: [
      { text: 'Всё из Базового', included: true },
      { text: 'Продвинутое сравнение версий (diff)', included: true },
      { text: 'Публичные ссылки для заказчика', included: true },
      { text: 'База ФСНБ-2022 внутри системы', included: true },
      { text: 'Экспорт в Гранд-Смета XML', included: true },
    ],
    ctaLabel: 'Выбрать Pro',
    ctaHref:
      'https://app.komplid.ru/signup?plan=smetchik-pro&role=smetchik&utm_source=landing&utm_medium=organic&utm_campaign=smetchik',
    featured: true,
    tag: 'Популярный',
  },
];

export function SmetchikPricing() {
  return (
    <RolePricing
      eyebrow="Тарифы Сметчик-Студио"
      title="Пробный период, дальше — по объёму работы"
      description="Все тарифы включают мобильное приложение. Годовая оплата — на 20% дешевле."
      tiers={TIERS}
    />
  );
}
