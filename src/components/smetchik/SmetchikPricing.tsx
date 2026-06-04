import { RolePricing, type PricingTierDef } from '@/components/blocks/RolePricing';

const TIERS: PricingTierDef[] = [
  {
    name: 'Бесплатно',
    subtitle: 'Попробовать без рисков.',
    monthlyPrice: 0,
    priceNote: 'до 5 смет · только просмотр',
    features: [
      { text: 'До 5 смет в проекте', included: true },
      { text: 'Просмотр и экспорт PDF', included: true },
      { text: 'Импорт XML/Excel', included: false },
      { text: 'Сравнение версий', included: false },
      { text: 'Публичные ссылки', included: false },
    ],
    ctaLabel: 'Начать бесплатно',
    ctaHref:
      'https://app.komplid.ru/signup?plan=free&role=smetchik&utm_source=landing&utm_medium=organic&utm_campaign=smetchik',
  },
  {
    name: 'Базовый',
    subtitle: 'Для активной работы со сметами.',
    monthlyPrice: 1900,
    priceNote: '1 специалист · до 50 смет',
    features: [
      { text: 'Импорт XML (Гранд-Смета, РИК)', included: true },
      { text: 'Импорт Excel', included: true },
      { text: 'Базовое сравнение версий', included: true },
      { text: 'Публичные ссылки для заказчика', included: false },
      { text: 'ФГИС ЦС и экспорт в Гранд-Смета', included: false },
    ],
    ctaLabel: 'Выбрать Базовый',
    ctaHref:
      'https://app.komplid.ru/signup?plan=smetchik-base&role=smetchik&utm_source=landing&utm_medium=organic&utm_campaign=smetchik',
  },
  {
    name: 'Pro',
    subtitle: 'Полный арсенал сметчика.',
    monthlyPrice: 2900,
    priceNote: '1 специалист · безлимит',
    features: [
      { text: 'Всё из Базового', included: true },
      { text: 'Продвинутое сравнение версий (diff)', included: true },
      { text: 'Публичные ссылки для заказчика', included: true },
      { text: 'ФГИС ЦС в приложении', included: true },
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
      title="Начните бесплатно, растите по мере задач"
      description="Все тарифы включают мобильное приложение. Без скрытых ограничений по числу проектов."
      tiers={TIERS}
    />
  );
}
